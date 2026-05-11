import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setUnauthorizedHandler } from "@/api/client";
import { loginRequest, logoutRequest, refreshRequest, registerRequest } from "@/api/authApi";
import { fetchGuideProfile, fetchTouristProfile, startGuideOnboarding } from "@/api/profileApi";
import type { AuthIntent } from "@/types/auth";
import type { AppUser } from "@/types/user";
import { getEmailFromIdToken, getSubFromIdToken } from "@/utils/jwt";
import { clearSession, loadSession, saveSession, type StoredSession } from "./sessionStorage";

export type GuideGate = "approved" | "onboarding" | "pending_review" | "rejected";

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  intent: AuthIntent | null;
  accessToken: string | null;
  user: AppUser | null;
  guideGate: GuideGate | null;
  error: string | null;
  signIn: (email: string, password: string, intent: AuthIntent) => Promise<void>;
  signUp: (email: string, password: string, intent: AuthIntent, name?: string) => Promise<RegisterSignUpResult>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export type RegisterSignUpResult = {
  needsEmailVerification: boolean;
  message?: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function tokensToSession(tokens: {
  accessToken?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}, intent: AuthIntent): StoredSession {
  const accessToken = tokens.accessToken ?? "";
  const expiresInSec = tokens.expiresIn ?? 3600;
  const expiresAt = Date.now() + expiresInSec * 1000;
  return {
    accessToken,
    idToken: tokens.idToken,
    refreshToken: tokens.refreshToken,
    expiresAt,
    intent,
  };
}

async function buildUserFromTourist(token: string, idToken: string | undefined, intent: AuthIntent): Promise<AppUser> {
  const profile = await fetchTouristProfile(token);
  const sub = getSubFromIdToken(idToken) ?? profile?.userId ?? "";
  return {
    role: "tourist",
    intent,
    userId: sub,
    email: getEmailFromIdToken(idToken) ?? profile?.email,
    displayName: profile?.displayName,
    onboardingStatus: "complete",
    profileStatus: "active",
    accountStatus: "active",
  };
}

async function buildUserFromGuide(
  token: string,
  idToken: string | undefined,
  intent: AuthIntent,
): Promise<{ user: AppUser; gate: GuideGate }> {
  const bootstrap = await startGuideOnboarding(token);
  const profile = await fetchGuideProfile(token);
  const sub = getSubFromIdToken(idToken) ?? profile?.guideId ?? "";

  let gate: GuideGate = "onboarding";
  if (bootstrap.status === "APPROVED") gate = "approved";
  else if (bootstrap.status === "PENDING_REVIEW") gate = "pending_review";
  else if (bootstrap.status === "REJECTED") gate = "rejected";
  else if (bootstrap.status === "ONBOARDING") gate = "onboarding";

  if (profile?.guideStatus === "APPROVED" || profile?.guideStatus === "ACTIVE") {
    gate = "approved";
  } else if (profile?.guideStatus === "PENDING_REVIEW") {
    gate = "pending_review";
  } else if (profile?.guideStatus === "REJECTED") {
    gate = "rejected";
  } else if (profile?.guideStatus === "ONBOARDING" || profile?.guideStatus === "PENDING") {
    gate = "onboarding";
  }

  const user: AppUser = {
    role: "guide",
    intent,
    userId: sub,
    email: getEmailFromIdToken(idToken),
    displayName: profile?.displayName,
    onboardingStatus: profile?.guideStatus ?? bootstrap.status,
    profileStatus: profile?.guideStatus,
    accountStatus: gate === "approved" ? "active" : "onboarding",
  };
  return { user, gate };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [guideGate, setGuideGate] = useState<GuideGate | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signOut = useCallback(async () => {
    await logoutRequest(session?.accessToken);
    await clearSession();
    setSession(null);
    setUser(null);
    setGuideGate(null);
    setError(null);
  }, [session?.accessToken]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const hydrateProfile = useCallback(async (s: StoredSession) => {
    try {
      if (s.intent === "tourist") {
        const u = await buildUserFromTourist(s.accessToken, s.idToken, s.intent);
        setUser(u);
        setGuideGate(null);
        return;
      }
      const { user: gu, gate } = await buildUserFromGuide(s.accessToken, s.idToken, s.intent);
      setUser(gu);
      setGuideGate(gate);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load profile";
      setError(msg);
      await signOut();
    }
  }, [signOut]);

  const refreshSession = useCallback(async () => {
    if (!session?.refreshToken) return;
    try {
      const tokens = await refreshRequest(session.refreshToken, session.intent);
      const next = tokensToSession(
        { ...tokens, refreshToken: tokens.refreshToken ?? session.refreshToken },
        session.intent,
      );
      await saveSession(next);
      setSession(next);
    } catch {
      await signOut();
    }
  }, [session, signOut]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await loadSession();
        if (!s || cancelled) {
          if (!cancelled) setIsReady(true);
          return;
        }
        const skew = 120_000;
        if (s.expiresAt < Date.now() + skew && s.refreshToken) {
          try {
            const tokens = await refreshRequest(s.refreshToken, s.intent);
            const next = tokensToSession(
              { ...tokens, refreshToken: tokens.refreshToken ?? s.refreshToken },
              s.intent,
            );
            await saveSession(next);
            if (!cancelled) {
              setSession(next);
              await hydrateProfile(next);
            }
          } catch {
            await clearSession();
            if (!cancelled) setSession(null);
          }
        } else if (s.expiresAt < Date.now() + skew) {
          await clearSession();
          if (!cancelled) setSession(null);
        } else {
          setSession(s);
          await hydrateProfile(s);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateProfile]);

  const signIn = useCallback(
    async (email: string, password: string, intent: AuthIntent) => {
      setError(null);
      const tokens = await loginRequest(email, password, intent);
      const next = tokensToSession(tokens, intent);
      if (!next.accessToken) throw new Error("Login did not return an access token.");
      await saveSession(next);
      setSession(next);
      if (intent === "tourist") {
        const u = await buildUserFromTourist(next.accessToken, next.idToken, intent);
        setUser(u);
        setGuideGate(null);
      } else {
        const { user: gu, gate } = await buildUserFromGuide(next.accessToken, next.idToken, intent);
        setUser(gu);
        setGuideGate(gate);
      }
    },
    [],
  );

  const signUp = useCallback(async (email: string, password: string, intent: AuthIntent, name?: string) => {
    setError(null);
    const res = await registerRequest(email, password, intent, name);
    if (res.existingAccountMayExist && res.nextStep === "login_to_continue_guide_registration") {
      return {
        needsEmailVerification: false,
        message: "An account may already exist — try signing in with your email.",
      };
    }
    const needs = res.userConfirmed === false;
    return { needsEmailVerification: needs, message: needs ? "Check your email to verify your account." : undefined };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session) return;
    await hydrateProfile(session);
  }, [session, hydrateProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: Boolean(session?.accessToken),
      intent: session?.intent ?? null,
      accessToken: session?.accessToken ?? null,
      user,
      guideGate,
      error,
      signIn,
      signUp,
      signOut,
      refreshSession,
      refreshProfile,
    }),
    [isReady, session, user, guideGate, error, signIn, signUp, signOut, refreshSession, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

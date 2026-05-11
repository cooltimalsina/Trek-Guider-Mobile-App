import { API_ROUTES } from "@/constants/apiRoutes";
import type { AuthIntent } from "@/types/auth";
import type { LoginTokens, RegisterResult } from "@/types/auth";
import { apiRequest } from "./client";

export async function loginRequest(
  email: string,
  password: string,
  intent: AuthIntent,
): Promise<LoginTokens> {
  return apiRequest<LoginTokens>(API_ROUTES.authLogin, {
    method: "POST",
    body: { email, password, intent },
    public: true,
  });
}

export async function registerRequest(
  email: string,
  password: string,
  intent: AuthIntent,
  name?: string,
): Promise<RegisterResult> {
  return apiRequest<RegisterResult>(API_ROUTES.authRegister, {
    method: "POST",
    body: { email, password, intent, name },
    public: true,
  });
}

export async function refreshRequest(refreshToken: string, intent: AuthIntent): Promise<LoginTokens> {
  return apiRequest<LoginTokens>(API_ROUTES.authRefresh, {
    method: "POST",
    body: { intent, refreshToken },
    public: true,
  });
}

export async function logoutRequest(accessToken: string | null | undefined): Promise<void> {
  if (!accessToken) return;
  try {
    await apiRequest<unknown>(API_ROUTES.authLogout, {
      method: "POST",
      body: { accessToken },
      public: true,
    });
  } catch {
    /* best-effort */
  }
}

export async function resendVerificationRequest(email: string, intent: AuthIntent): Promise<void> {
  await apiRequest<unknown>(API_ROUTES.authResendVerification, {
    method: "POST",
    body: { email, intent },
    public: true,
  });
}

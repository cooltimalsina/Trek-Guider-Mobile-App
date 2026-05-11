import * as SecureStore from "expo-secure-store";
import type { AuthIntent } from "@/types/auth";

const K = {
  access: "tg_access_token",
  refresh: "tg_refresh_token",
  id: "tg_id_token",
  intent: "tg_auth_intent",
  expiresAt: "tg_expires_at_ms",
};

export type StoredSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  intent: AuthIntent;
};

async function setItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}

export async function saveSession(session: StoredSession): Promise<void> {
  await setItem(K.access, session.accessToken);
  await setItem(K.intent, session.intent);
  await setItem(K.expiresAt, String(session.expiresAt));
  if (session.refreshToken) await setItem(K.refresh, session.refreshToken);
  else await deleteItem(K.refresh);
  if (session.idToken) await setItem(K.id, session.idToken);
  else await deleteItem(K.id);
}

export async function loadSession(): Promise<StoredSession | null> {
  const accessToken = await getItem(K.access);
  const intentRaw = await getItem(K.intent);
  const expRaw = await getItem(K.expiresAt);
  if (!accessToken || !intentRaw || (intentRaw !== "tourist" && intentRaw !== "guide")) {
    return null;
  }
  const expiresAt = expRaw ? Number(expRaw) : 0;
  const refreshToken = (await getItem(K.refresh)) ?? undefined;
  const idToken = (await getItem(K.id)) ?? undefined;
  return {
    accessToken,
    refreshToken,
    idToken,
    expiresAt,
    intent: intentRaw,
  };
}

export async function clearSession(): Promise<void> {
  await Promise.all([K.access, K.refresh, K.id, K.intent, K.expiresAt].map((k) => deleteItem(k).catch(() => undefined)));
}

/** Decode JWT payload (no signature verification — for display / client hints only). */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const [, encoded] = token.split(".");
    if (!encoded) return {};
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function getSubFromIdToken(idToken: string | undefined): string | undefined {
  if (!idToken) return undefined;
  const p = decodeJwtPayload(idToken);
  return typeof p.sub === "string" ? p.sub : undefined;
}

export function getEmailFromIdToken(idToken: string | undefined): string | undefined {
  if (!idToken) return undefined;
  const p = decodeJwtPayload(idToken);
  return typeof p.email === "string" ? p.email : undefined;
}

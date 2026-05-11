/** Central env access — only EXPO_PUBLIC_* (safe for client). */

function trimSlash(s: string): string {
  return s.replace(/\/+$/, "");
}

const web = trimSlash(process.env.EXPO_PUBLIC_WEB_BASE_URL ?? "");

export const ENV = {
  apiBaseUrl: trimSlash(process.env.EXPO_PUBLIC_API_BASE_URL ?? ""),
  webBaseUrl: web,
  guideOnboardingUrl: trimSlash(
    process.env.EXPO_PUBLIC_GUIDE_ONBOARDING_URL ?? (web ? `${web}/guide/onboarding` : ""),
  ),
};

export function assertApiConfigured(): void {
  if (!ENV.apiBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not set. Copy .env.example to .env and configure.");
  }
}

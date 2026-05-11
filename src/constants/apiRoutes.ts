/**
 * Trek Guider API paths (API Gateway HTTP API).
 * @see Trek-Guider-Backend/infra/cdk/lib/stacks/api-stack.ts
 */

export const API_ROUTES = {
  authLogin: "/auth/login",
  authRegister: "/auth/register",
  authRefresh: "/auth/refresh",
  authLogout: "/auth/logout",
  authResendVerification: "/auth/resend-verification",

  touristProfile: "/me/tourist-profile",
  guideProfile: "/guides/profile",
  guideOnboardingStart: "/me/guide-onboarding/start",

  touristBookingsMe: "/bookings/me",
  touristBooking: (id: string) => `/bookings/${encodeURIComponent(id)}`,

  guideBookings: "/guides/bookings",

  /** Public — no auth */
  trekById: (id: string) => `/treks/${encodeURIComponent(id)}`,
} as const;

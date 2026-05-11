import { API_ROUTES } from "@/constants/apiRoutes";
import { apiRequest } from "./client";

export type GuideBookingsResponse = {
  open: Array<{
    bookingId: string;
    status: string;
    trekId: string;
    regionId: string;
    touristUserId: string;
    requestedStartDate: string;
  }>;
  assigned: Array<{
    bookingId: string;
    status: string;
    trekId: string;
    regionId: string;
    touristUserId: string;
    requestedStartDate: string;
  }>;
};

/** `GET /guides/bookings` — body `{ data: { open, assigned } }` from guide-service `listGuideBookings`. */
export async function fetchGuideBookings(token: string): Promise<GuideBookingsResponse> {
  const raw = await apiRequest<unknown>(API_ROUTES.guideBookings, { token });
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const open = Array.isArray(o.open) ? o.open : [];
  const assigned = Array.isArray(o.assigned) ? o.assigned : [];
  return { open, assigned } as GuideBookingsResponse;
}

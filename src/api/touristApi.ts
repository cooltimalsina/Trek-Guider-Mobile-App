import { API_ROUTES } from "@/constants/apiRoutes";
import type { TrekSummaryDto } from "@/types/trip";
import { apiRequest } from "./client";

export async function fetchTouristBookings(token: string): Promise<{ items: unknown[]; count: number }> {
  return apiRequest<{ items: unknown[]; count: number }>(API_ROUTES.touristBookingsMe, { token });
}

export async function fetchTouristBooking(token: string, bookingId: string): Promise<{ booking: unknown }> {
  return apiRequest<{ booking: unknown }>(API_ROUTES.touristBooking(bookingId), { token });
}

export async function fetchTrekPublic(trekId: string): Promise<TrekSummaryDto> {
  return apiRequest<TrekSummaryDto>(API_ROUTES.trekById(trekId), { public: true });
}

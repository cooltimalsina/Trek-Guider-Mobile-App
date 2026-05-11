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

export async function fetchGuideBookings(token: string): Promise<GuideBookingsResponse> {
  return apiRequest<GuideBookingsResponse>(API_ROUTES.guideBookings, { token });
}

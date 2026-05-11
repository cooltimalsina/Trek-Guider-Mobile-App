import { API_ROUTES } from "@/constants/apiRoutes";
import type { GuideBootstrapDto, GuideProfileDto, TouristProfileDto } from "@/types/user";
import { apiRequest } from "./client";

export async function fetchTouristProfile(token: string): Promise<TouristProfileDto | undefined> {
  const res = await apiRequest<{ profile?: TouristProfileDto }>(API_ROUTES.touristProfile, {
    token,
  });
  return res.profile;
}

export async function fetchGuideProfile(token: string): Promise<GuideProfileDto | undefined> {
  const res = await apiRequest<{ profile?: GuideProfileDto }>(API_ROUTES.guideProfile, {
    token,
  });
  return res.profile;
}

export async function startGuideOnboarding(token: string): Promise<GuideBootstrapDto> {
  return apiRequest<GuideBootstrapDto>(API_ROUTES.guideOnboardingStart, {
    method: "POST",
    token,
    body: {},
  });
}

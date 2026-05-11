import type { AuthIntent } from "./auth";

export type UserRole = "tourist" | "guide";

/** Derived from login intent + successful profile fetch (backend is source of truth for access). */
export type AppUser = {
  role: UserRole;
  intent: AuthIntent;
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  onboardingStatus?: string;
  profileStatus?: string;
  accountStatus?: string;
};

export type TouristProfileDto = {
  userId?: string;
  displayName?: string;
  countryCode?: string;
  email?: string;
};

export type GuideProfileDto = {
  guideId: string;
  displayName: string;
  bio?: string;
  languages?: string[];
  regionId: string;
  guideStatus: string;
  onboardingStep?: string;
  documentsSubmitted?: boolean;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
};

export type GuideBootstrapDto = {
  nextRoute: string;
  status: "ONBOARDING" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
};

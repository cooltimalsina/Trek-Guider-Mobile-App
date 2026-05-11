export type MobileBookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "completed"
  | "current"
  | "upcoming";

export type MobileBooking = {
  bookingId: string;
  tripId: string;
  tripTitle: string;
  tripImageUrl?: string;
  startDate: string;
  endDate?: string;
  /** Normalized workflow from API before date-based upcoming/current UI on `status`. */
  lifecycleStatus: MobileBookingStatus;
  status: MobileBookingStatus;
  paymentStatus?: string;
  depositAmount?: number;
  totalAmount?: number;
  guideName?: string;
  touristName?: string;
  travelerCount?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Guide-only: from open pool vs assigned */
  source?: "open" | "assigned";
  /** Enriched on detail from trek API when available */
  tripLocationLabel?: string;
  tripHeroCaption?: string;
  guideCompanyName?: string;
};

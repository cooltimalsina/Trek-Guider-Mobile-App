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
};

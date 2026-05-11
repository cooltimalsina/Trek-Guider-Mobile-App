import type { MobileBooking, MobileBookingStatus } from "@/types/booking";

export type BookingFilterTab = "all" | MobileBookingStatus;

export function filterBookings(list: MobileBooking[], tab: BookingFilterTab): MobileBooking[] {
  if (tab === "all") return list;
  return list.filter((b) => b.status === tab);
}

export function countByStatus(list: MobileBooking[], status: MobileBookingStatus): number {
  return list.filter((b) => b.status === status).length;
}

/** Home / API-style filters: pending, accepted, declined, cancelled (+ all). Completed only appears under "all". */
export type TripLifecycleFilter = "all" | "pending" | "accepted" | "declined" | "cancelled";

function matchesAcceptedChip(b: MobileBooking): boolean {
  return b.lifecycleStatus === "accepted" || b.lifecycleStatus === "current";
}

export function filterTripsByLifecycle(list: MobileBooking[], tab: TripLifecycleFilter): MobileBooking[] {
  if (tab === "all") return list;
  if (tab === "accepted") return list.filter(matchesAcceptedChip);
  return list.filter((b) => b.lifecycleStatus === tab);
}

export function countByLifecycle(list: MobileBooking[], status: Exclude<TripLifecycleFilter, "all">): number {
  if (status === "accepted") return list.filter(matchesAcceptedChip).length;
  return list.filter((b) => b.lifecycleStatus === status).length;
}

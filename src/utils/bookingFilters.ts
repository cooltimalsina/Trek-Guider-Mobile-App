import type { MobileBooking, MobileBookingStatus } from "@/types/booking";

export type BookingFilterTab = "all" | MobileBookingStatus;

export function filterBookings(list: MobileBooking[], tab: BookingFilterTab): MobileBooking[] {
  if (tab === "all") return list;
  return list.filter((b) => b.status === tab);
}

export function countByStatus(list: MobileBooking[], status: MobileBookingStatus): number {
  return list.filter((b) => b.status === status).length;
}

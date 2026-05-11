import type { MobileBooking, MobileBookingStatus } from "@/types/booking";

/** Backend booking / guide row uses mixed status strings — normalize for UI filters. */
export function mapBackendStatusToMobile(raw: string | undefined): MobileBookingStatus {
  const s = (raw ?? "").toUpperCase();
  if (s === "ACCEPTED" || s === "CONFIRMED") return "accepted";
  if (s === "DECLINED" || s === "REJECTED") return "declined";
  if (s === "CANCELLED" || s === "CANCELED") return "cancelled";
  if (s === "COMPLETED" || s === "DONE") return "completed";
  if (s === "REQUESTED" || s === "PENDING" || s === "AWAITING_PAYMENT") return "pending";
  if (s === "IN_PROGRESS" || s === "ACTIVE") return "current";
  return "pending";
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function inferTemporalStatus(b: {
  status: MobileBookingStatus;
  start: string;
}): MobileBookingStatus {
  if (b.status !== "accepted" && b.status !== "completed" && b.status !== "cancelled" && b.status !== "declined") {
    return b.status;
  }
  if (b.status !== "accepted") return b.status;
  const start = new Date(b.start);
  const now = new Date();
  if (Number.isNaN(start.getTime())) return "accepted";
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 14);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "current";
  return "accepted";
}

export type TouristBookingRecord = {
  bookingId: string;
  trekId: string;
  status?: string;
  bookingStatus?: string;
  paymentStatus?: string;
  requestedStartDate: string;
  requestedEndAt?: string;
  requestedStartAt?: string;
  guideName?: string;
  customerName?: string;
  travelers?: number;
  notes?: string;
  createdAt?: string;
  priceBreakdown?: { depositCents?: number; totalCents?: number };
};

export function mapTouristBookingRecord(raw: Record<string, unknown>, trekTitle?: string, imageUrl?: string): MobileBooking {
  const r = raw as unknown as TouristBookingRecord;
  const lifecycleStatus = mapBackendStatusToMobile(r.bookingStatus ?? r.status);
  const start = String(r.requestedStartDate ?? "").slice(0, 10);
  const depositCents = r.priceBreakdown?.depositCents;
  const totalCents = r.priceBreakdown?.totalCents;
  const endRaw = raw.requestedEndAt;
  const endStr = typeof endRaw === "string" ? endRaw.slice(0, 10) : undefined;
  const base: MobileBooking = {
    bookingId: String(r.bookingId ?? ""),
    tripId: String(r.trekId ?? ""),
    tripTitle: trekTitle ?? String(raw.trekId ?? ""),
    tripImageUrl: imageUrl,
    startDate: start,
    endDate: endStr ?? (start ? addDays(start, 7) : undefined),
    lifecycleStatus,
    status: inferTemporalStatus({ status: lifecycleStatus, start }),
    paymentStatus: r.paymentStatus,
    depositAmount: depositCents != null ? depositCents / 100 : undefined,
    totalAmount: totalCents != null ? totalCents / 100 : undefined,
    guideName: r.guideName,
    touristName: r.customerName,
    travelerCount: r.travelers,
    notes: r.notes,
    createdAt: r.createdAt,
  };
  return base;
}

type GuideBookingRow = {
  bookingId: string;
  status: string;
  trekId: string;
  regionId: string;
  touristUserId: string;
  requestedStartDate: string;
};

export function mapGuideBookingRow(
  raw: GuideBookingRow,
  source: "open" | "assigned",
  trekTitle?: string,
  trekImageUrl?: string,
): MobileBooking {
  const lifecycleStatus = mapBackendStatusToMobile(raw.status);
  const start = raw.requestedStartDate?.slice(0, 10) ?? "";
  return {
    bookingId: raw.bookingId,
    tripId: raw.trekId,
    tripTitle: trekTitle ?? raw.trekId,
    tripImageUrl: trekImageUrl,
    startDate: start,
    endDate: start ? addDays(start, 7) : undefined,
    lifecycleStatus,
    status: inferTemporalStatus({ status: lifecycleStatus, start }),
    touristName: source === "assigned" ? `Traveler ${raw.touristUserId.slice(0, 6)}…` : undefined,
    source,
    travelerCount: undefined,
  };
}

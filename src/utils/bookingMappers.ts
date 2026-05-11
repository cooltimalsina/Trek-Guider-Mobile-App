import type { MobileBooking, MobileBookingStatus } from "@/types/booking";

/** Backend booking / guide row uses mixed status strings — normalize for UI filters. */
export function mapBackendStatusToMobile(raw: string | undefined): MobileBookingStatus {
  const s = (raw ?? "").toUpperCase();
  if (s === "ACCEPTED" || s === "CONFIRMED") return "accepted";
  if (s === "DECLINED" || s === "REJECTED") return "declined";
  if (s === "CANCELLED" || s === "CANCELED") return "cancelled";
  if (s === "REFUNDED" || s === "REFUND_PENDING" || s === "REFUND_STARTED") return "cancelled";
  if (s === "EXPIRED") return "cancelled";
  if (s === "COMPLETED" || s === "DONE") return "completed";
  if (s === "REQUESTED" || s === "PENDING" || s === "AWAITING_PAYMENT" || s === "PENDING_PAYMENT" || s === "UNPAID") return "pending";
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

function pickPriceBreakdown(raw: Record<string, unknown>): TouristBookingRecord["priceBreakdown"] | undefined {
  const pb = raw.priceBreakdown ?? raw.price_breakdown;
  if (!pb || typeof pb !== "object") return undefined;
  return pb as TouristBookingRecord["priceBreakdown"];
}

export function mapTouristBookingRecord(
  raw: Record<string, unknown>,
  trekTitle?: string,
  imageUrl?: string,
  extras?: { locationLabel?: string; heroCaption?: string; guideCompany?: string },
): MobileBooking {
  const r = raw as unknown as TouristBookingRecord;
  const bookingId = String(
    r.bookingId ?? (raw as { id?: string }).id ?? (raw as { bookingNumber?: string }).bookingNumber ?? "",
  ).trim();
  const trekId = String(r.trekId ?? (raw as { trek_id?: string }).trek_id ?? "").trim();
  const lifecycleStatus = mapBackendStatusToMobile(r.bookingStatus ?? r.status);
  const start = String(r.requestedStartDate ?? (raw as { requested_start_date?: string }).requested_start_date ?? "").slice(
    0,
    10,
  );
  const breakdown = pickPriceBreakdown(raw);
  const depositCents = breakdown?.depositCents ?? (breakdown as { deposit_cents?: number } | undefined)?.deposit_cents;
  const totalCents = breakdown?.totalCents ?? (breakdown as { total_cents?: number } | undefined)?.total_cents;
  const endRaw = raw.requestedEndAt;
  const endStr = typeof endRaw === "string" ? endRaw.slice(0, 10) : undefined;
  const rawCompany = (raw as { guideCompanyName?: string; guideBusinessName?: string }).guideCompanyName
    ?? (raw as { guideBusinessName?: string }).guideBusinessName;
  const company = extras?.guideCompany ?? (typeof rawCompany === "string" ? rawCompany : undefined);

  const base: MobileBooking = {
    bookingId,
    tripId: trekId || String(raw.trekId ?? ""),
    tripTitle: trekTitle?.trim() || trekId || bookingId || "Trip",
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
    tripLocationLabel: extras?.locationLabel,
    tripHeroCaption: extras?.heroCaption,
    guideCompanyName: company,
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

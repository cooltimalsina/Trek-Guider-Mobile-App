import type { MobileBookingStatus } from "@/types/booking";

export type TripTimelineStepState = "done" | "current" | "pending" | "failed";

export type TripTimelineStep = {
  key: string;
  label: string;
  sublabel?: string;
  state: TripTimelineStepState;
  tone?: "orange" | "green" | "blue";
};

function paidLike(paymentStatus?: string): boolean {
  const p = (paymentStatus ?? "").toUpperCase();
  return p.includes("PAID") || p.includes("SUCCEEDED") || p.includes("COMPLETE") || p.includes("CAPTURED");
}

const LABELS = ["Request sent", "Guide accepted", "Confirmed & paid", "On your trip", "Completed"] as const;

/**
 * Five-step timeline for tourist trip detail UI.
 */
export function buildTouristTripTimeline(
  lifecycleStatus: MobileBookingStatus,
  displayStatus: MobileBookingStatus,
  paymentStatus?: string,
): TripTimelineStep[] {
  const paid = paidLike(paymentStatus);

  if (lifecycleStatus === "declined") {
    return [
      { key: "s0", label: "Request sent", state: "done", tone: "orange" },
      { key: "s1", label: "Guide declined", state: "failed" },
      { key: "s2", label: "Confirmed & paid", state: "pending" },
      { key: "s3", label: "On your trip", state: "pending" },
      { key: "s4", label: "Completed", state: "pending" },
    ];
  }

  if (lifecycleStatus === "cancelled") {
    return [
      { key: "s0", label: "Request sent", state: "done", tone: "orange" },
      { key: "s1", label: "Guide accepted", state: "done", tone: "green" },
      { key: "s2", label: "Cancelled", state: "failed" },
      { key: "s3", label: "On your trip", state: "pending" },
      { key: "s4", label: "Completed", state: "pending" },
    ];
  }

  let cursor = 0;
  if (lifecycleStatus === "pending") cursor = 1;
  else if (lifecycleStatus === "accepted" && !paid) cursor = 2;
  else if (displayStatus === "upcoming") cursor = 2;
  else if (displayStatus === "current") cursor = 3;
  else if (lifecycleStatus === "completed" || displayStatus === "completed") cursor = 5;

  return LABELS.map((label, i) => {
    let state: TripTimelineStepState;
    if (cursor >= 5) state = "done";
    else if (i < cursor) state = "done";
    else if (i === cursor) state = "current";
    else state = "pending";

    const tone: "orange" | "green" | "blue" | undefined =
      i === 0 ? "orange" : i === 1 ? "green" : i === 2 ? "blue" : undefined;

    const sublabel =
      i === 2 && state === "current" && paid && displayStatus === "upcoming" ? "Current status" : undefined;

    return { key: `s${i}`, label, state, tone, sublabel };
  });
}

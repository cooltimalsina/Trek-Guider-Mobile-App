import { fetchGuideBookings } from "@/api/guideApi";
import { fetchTrekPublic } from "@/api/touristApi";
import type { MobileBooking } from "@/types/booking";
import { mapGuideBookingRow } from "@/utils/bookingMappers";

export async function loadGuideBookingsEnriched(token: string): Promise<MobileBooking[]> {
  const data = await fetchGuideBookings(token);
  const trekCache = new Map<string, string | undefined>();
  async function titleFor(trekId: string): Promise<string | undefined> {
    if (trekCache.has(trekId)) return trekCache.get(trekId);
    try {
      const trek = await fetchTrekPublic(trekId);
      const t = trek.title ?? trek.name;
      trekCache.set(trekId, t);
      return t;
    } catch {
      trekCache.set(trekId, undefined);
      return undefined;
    }
  }

  const open = await Promise.all(
    (data.open ?? []).map(async (row) =>
      mapGuideBookingRow(row, "open", await titleFor(row.trekId)),
    ),
  );
  const assigned = await Promise.all(
    (data.assigned ?? []).map(async (row) =>
      mapGuideBookingRow(row, "assigned", await titleFor(row.trekId)),
    ),
  );
  const merged = [...assigned, ...open];
  merged.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  return merged;
}

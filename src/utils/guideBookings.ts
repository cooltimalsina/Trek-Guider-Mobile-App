import { fetchGuideBookings } from "@/api/guideApi";
import { fetchTrekPublic } from "@/api/touristApi";
import type { MobileBooking } from "@/types/booking";
import { mapGuideBookingRow } from "@/utils/bookingMappers";

export async function loadGuideBookingsEnriched(token: string): Promise<MobileBooking[]> {
  const data = await fetchGuideBookings(token);
  const trekCache = new Map<string, { title?: string; image?: string }>();
  async function trekMeta(trekId: string): Promise<{ title?: string; image?: string }> {
    const hit = trekCache.get(trekId);
    if (hit) return hit;
    try {
      const trek = await fetchTrekPublic(trekId);
      const meta = {
        title: trek.title ?? trek.name,
        image: trek.heroImageUrl ?? trek.coverImageUrl ?? trek.thumbnailUrl ?? trek.imageUrl,
      };
      trekCache.set(trekId, meta);
      return meta;
    } catch {
      trekCache.set(trekId, {});
      return {};
    }
  }

  const open = await Promise.all(
    (data.open ?? []).map(async (row) => {
      const { title, image } = await trekMeta(row.trekId);
      return mapGuideBookingRow(row, "open", title, image);
    }),
  );
  const assigned = await Promise.all(
    (data.assigned ?? []).map(async (row) => {
      const { title, image } = await trekMeta(row.trekId);
      return mapGuideBookingRow(row, "assigned", title, image);
    }),
  );
  const merged = [...assigned, ...open];
  merged.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  return merged;
}

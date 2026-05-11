import { API_ROUTES } from "@/constants/apiRoutes";
import { ENV } from "@/constants/env";
import type { CatalogTrek } from "@/types/catalogTrek";
import type { TrekSummaryDto } from "@/types/trip";
import { mapCatalogTrekFromApi } from "@/utils/catalogTrekMapper";
import { resolveTrekHeroCoverUrl } from "@/utils/resolveMediaImageUrl";
import { apiRequest } from "./client";

/**
 * `GET /bookings/me` — same as Trek-Guider web `apiFetchData("/bookings/me")`.
 * Response body is `{ data: { items: BookingRecord[], count } }`; this returns the inner payload.
 */
export async function fetchTouristBookings(token: string): Promise<{ items: unknown[]; count: number }> {
  const raw = await apiRequest<unknown>(API_ROUTES.touristBookingsMe, { token });
  if (Array.isArray(raw)) {
    const items = raw;
    return { items, count: items.length };
  }
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const items = Array.isArray(o.items) ? o.items : Array.isArray(o.bookings) ? o.bookings : [];
  const count = typeof o.count === "number" ? o.count : items.length;
  return { items, count };
}

/** `GET /bookings/{id}` — body `{ data: { booking } }` from tourist-service `getBookingById`. */
export async function fetchTouristBooking(token: string, bookingId: string): Promise<{ booking: unknown }> {
  const data = await apiRequest<unknown>(API_ROUTES.touristBooking(bookingId), { token });
  const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const booking = "booking" in o ? o.booking : data;
  return { booking };
}

/** Public trek — resolves hero/cover/gallery the same way as catalog + web media rules. */
export async function fetchTrekPublic(trekId: string): Promise<TrekSummaryDto> {
  const data = await apiRequest<unknown>(API_ROUTES.trekById(trekId), { public: true });
  const row = unwrapTrekPayload(data) as Record<string, unknown>;
  const img = resolveTrekHeroCoverUrl(row, ENV.webBaseUrl || undefined);
  const id = String(row.trekId ?? row.id ?? trekId);
  const title =
    typeof row.title === "string" ? row.title : typeof row.name === "string" ? row.name : undefined;
  const name = typeof row.name === "string" ? row.name : undefined;
  return {
    trekId: id,
    id,
    title,
    name,
    description: typeof row.description === "string" ? row.description : undefined,
    summary: typeof row.summary === "string" ? row.summary : undefined,
    locationLabel: typeof row.locationLabel === "string" ? row.locationLabel : undefined,
    regionName: typeof row.regionName === "string" ? row.regionName : undefined,
    startLocation: typeof row.startLocation === "string" ? row.startLocation : undefined,
    meetingPoint: typeof row.meetingPoint === "string" ? row.meetingPoint : undefined,
    heroImageUrl: img,
    coverImageUrl: img,
    thumbnailUrl: img,
    imageUrl: img,
  };
}

function unwrapTrekPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const o = data as Record<string, unknown>;
  if (o.trek && typeof o.trek === "object" && !Array.isArray(o.trek)) {
    return o.trek as Record<string, unknown>;
  }
  return o as Record<string, unknown>;
}

/** Public catalog — same source as web GET /treks. */
export async function fetchTreksCatalog(): Promise<CatalogTrek[]> {
  const data = await apiRequest<unknown>(API_ROUTES.treks, { public: true });
  if (Array.isArray(data)) {
    return data
      .map((r) => mapCatalogTrekFromApi((r && typeof r === "object" ? r : {}) as Record<string, unknown>))
      .filter((t) => Boolean(t.id));
  }
  const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const rows: unknown[] = Array.isArray(o.treks) ? o.treks : Array.isArray(o.items) ? (o.items as unknown[]) : [];
  return rows
    .map((r) => mapCatalogTrekFromApi((r && typeof r === "object" ? r : {}) as Record<string, unknown>))
    .filter((t) => Boolean(t.id));
}

/** Single trek for catalog detail — maps same shape as list rows. */
export async function fetchCatalogTrekById(trekId: string): Promise<CatalogTrek | null> {
  try {
    const data = await apiRequest<unknown>(API_ROUTES.trekById(trekId), { public: true });
    const row = unwrapTrekPayload(data);
    const t = mapCatalogTrekFromApi(row);
    return t.id ? t : null;
  } catch {
    return null;
  }
}

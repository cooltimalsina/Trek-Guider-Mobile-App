import { ENV } from "@/constants/env";
import type { CatalogTrek } from "@/types/catalogTrek";
import { resolveTrekHeroCoverUrl } from "@/utils/resolveMediaImageUrl";

type Raw = Record<string, unknown>;

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function minFromTierPricing(ptp: unknown): number | undefined {
  if (!ptp || typeof ptp !== "object") return undefined;
  const p = ptp as Record<string, { perPersonUsd?: number }[] | undefined>;
  for (const tier of ["Standard", "Budget", "Premium"] as const) {
    const arr = p[tier];
    if (!Array.isArray(arr)) continue;
    for (const row of arr) {
      const v = Number(row?.perPersonUsd);
      if (Number.isFinite(v) && v > 0) return v;
    }
  }
  return undefined;
}

function heroUrl(r: Raw): string | undefined {
  const hi = r.heroImage;
  if (hi && typeof hi === "object") {
    const o = hi as Record<string, unknown>;
    const u = str(o.url, "") || str(o.cdnUrl, "");
    if (u) return u;
  }
  const c = str(r.coverImage, "");
  return c || undefined;
}

function highlightsFromRow(r: Raw): string[] | undefined {
  const h = r.highlights;
  if (!Array.isArray(h)) return undefined;
  const lines = h.map((x) => String(x).trim()).filter(Boolean);
  return lines.length ? lines : undefined;
}

/** Maps API trek row (list or single) to {@link CatalogTrek}. */
export function mapCatalogTrekFromApi(r: Raw): CatalogTrek {
  const idRaw = String(r.id ?? r.trekId ?? "").trim();
  const slug = str(r.slug, idRaw);
  const id = idRaw || slug;
  const title = str(r.title, str(r.name, "Untitled trek"));

  const tierContent = r.tierContent as Record<string, { durationDays?: unknown; durationUnit?: unknown }> | undefined;
  const standard = tierContent?.Standard ?? tierContent?.Budget;
  const rootDur = num(r.durationDays);
  const tierDur = num(standard?.durationDays);
  const durationDays =
    Number.isFinite(rootDur) && rootDur > 0 ? rootDur : Number.isFinite(tierDur) && tierDur > 0 ? tierDur : 0;

  const minFromPricing = minFromTierPricing(r.publicTierBracketPricing);
  const minPriceUsd = Number(minFromPricing ?? r.minPriceUsd ?? 0) || 0;

  const difficulty = str(r.difficulty, "Moderate");

  const durationUnit: "days" | "hours" | undefined =
    durationDays > 0
      ? r.durationUnit === "hours" || standard?.durationUnit === "hours"
        ? "hours"
        : "days"
      : undefined;

  return {
    id,
    slug,
    title,
    difficulty,
    durationDays,
    durationUnit,
    minPriceUsd: minPriceUsd,
    coverImageUrl: resolveTrekHeroCoverUrl(r, ENV.webBaseUrl || undefined),
    areaLabel: str(r.areaLabel, "") || undefined,
    destinationName: str(r.destinationName, "") || undefined,
    meetingPoint: str(r.meetingPoint, "") || undefined,
    rating: typeof r.rating === "number" && r.rating > 0 ? r.rating : undefined,
    reviewCount: typeof r.reviewCount === "number" && r.reviewCount > 0 ? r.reviewCount : undefined,
    shortDescription: str(r.shortDescription, "") || undefined,
    highlights: highlightsFromRow(r),
  };
}

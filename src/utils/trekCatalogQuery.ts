import type { CatalogSortId, CatalogTrek } from "@/types/catalogTrek";

/** Same behavior as web `treksMatchingQuery`: exact title match wins; else substring / all words in blob. */
export function treksMatchingQuery(treks: CatalogTrek[], rawQuery: string): CatalogTrek[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return treks;
  const exact = treks.filter((t) => t.title.trim().toLowerCase() === q);
  if (exact.length > 0) return exact;

  const words = q.split(/\s+/).filter(Boolean);
  return treks.filter((t) => {
    const blob = `${t.title} ${t.slug} ${t.areaLabel ?? ""} ${t.shortDescription ?? ""} ${t.destinationName ?? ""}`.toLowerCase();
    if (words.length === 0) return true;
    return words.every((w) => blob.includes(w));
  });
}

export type TrekCatalogFilters = {
  q: string;
  /** "All" | "Easy" | "Moderate" | "Hard" — case-insensitive match to `trek.difficulty`. */
  difficulty: string;
  sort: CatalogSortId;
};

export function filterAndSortTreks(treks: CatalogTrek[], f: TrekCatalogFilters): CatalogTrek[] {
  let list = treksMatchingQuery(treks, f.q);
  if (f.difficulty !== "All") {
    const d = f.difficulty.toLowerCase();
    list = list.filter((t) => t.difficulty.toLowerCase() === d);
  }
  if (f.sort === "price") {
    list = [...list].sort((a, b) => a.minPriceUsd - b.minPriceUsd);
  } else if (f.sort === "duration") {
    list = [...list].sort((a, b) => a.durationDays - b.durationDays);
  } else {
    list = [...list].sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
  }
  return list;
}

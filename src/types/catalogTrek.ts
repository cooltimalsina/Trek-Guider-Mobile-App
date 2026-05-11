/** Normalized public trek row for catalog list + detail (from GET /treks and GET /treks/:id). */
export type CatalogSortId = "popular" | "price" | "duration";

export type CatalogTrek = {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  durationDays: number;
  durationUnit?: "days" | "hours";
  minPriceUsd: number;
  coverImageUrl?: string;
  areaLabel?: string;
  destinationName?: string;
  meetingPoint?: string;
  rating?: number;
  reviewCount?: number;
  shortDescription?: string;
  highlights?: string[];
};

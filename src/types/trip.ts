/** Public trek payload subset from GET /treks/:id */
export type TrekSummaryDto = {
  trekId?: string;
  id?: string;
  title?: string;
  name?: string;
  heroImageUrl?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
};

/** Public trek payload subset from GET /treks/:id */
export type TrekSummaryDto = {
  trekId?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  summary?: string;
  /** Human-readable start / region line when API provides it */
  locationLabel?: string;
  regionName?: string;
  startLocation?: string;
  meetingPoint?: string;
  heroImageUrl?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
};

export type ContentRating = 'safe' | 'sketchy' | 'unsafe';

export interface ContentRatingOptions {
  rating: ContentRating;
  defaultRating: ContentRating;
}

export const DEFAULT_CONTENT_RATING: ContentRating = 'safe';

export const CONTENT_RATINGS: ContentRating[] = ['safe', 'sketchy', 'unsafe']; 
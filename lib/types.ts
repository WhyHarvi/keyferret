// Shared presentation model for IGDB metadata and a future retailer-price layer.

export type RetailerPrice = {
  retailer: string;
  price: number;
  originalPrice?: number;
  url: string;
};

export type Game = {
  id: string;
  slug: string;
  title: string;
  tagline?: string;
  description: string;
  coverGradient: [string, string]; // fallback shown when IGDB has no cover
  coverImage?: string;
  backdropImage?: string; // landscape IGDB artwork or screenshot for wide hero areas
  screenshots: string[];
  videos: Array<{ name: string; videoId: string }>;
  themes: string[];
  gameModes: string[];
  playerPerspectives: string[];
  gameEngines: string[];
  franchises: string[];
  genres: string[];
  platforms: string[];
  rating: number; // 0-5
  ratingCount: number; // genuine IGDB user-rating count; 0 when unavailable
  releaseDate: string;
  prices: RetailerPrice[];
};

export function bestPrice(prices: RetailerPrice[]): RetailerPrice {
  return [...prices].sort((a, b) => a.price - b.price)[0];
}

export function discountPercent(price: RetailerPrice): number | null {
  if (!price.originalPrice || price.originalPrice <= price.price) return null;
  return Math.round(100 - (price.price / price.originalPrice) * 100);
}

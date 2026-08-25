import type { Game } from "@/lib/types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Static VideoGame schema — name/image/genre/platform, deliberately no Offer/price
// block. Embedding live pricing here would mean a pricing lookup on every one of
// the ~100 statically-generated /game/[slug] pages, and next build's parallel
// workers already exhaust Supabase's session-pooler connection cap without it.
export function productJsonLd(game: Game) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    image: game.coverImage,
    url: absoluteUrl(`/game/${game.slug}`),
    genre: game.genres.length > 0 ? game.genres : undefined,
    gamePlatform: game.platforms.length > 0 ? game.platforms : undefined,
    datePublished: game.releaseDate || undefined,
  };
}

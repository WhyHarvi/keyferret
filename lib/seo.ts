import type { Game } from "@/lib/types";
import type { PricingResult } from "@/lib/pricing/types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// Square, not the ideal 1200x630 OG banner — but it's the only image that
// exists site-wide, so it's the fallback for pages without a more specific
// image (game pages use the game's own cover art instead).
export const DEFAULT_OG_IMAGE = absoluteUrl("/logo.png");

// Shared Open Graph + Twitter Card block. Next's metadata merging is a
// shallow merge per top-level key, so a page spreading this in only needs to
// supply what's specific to it — siteName/card type inherited from here
// don't need repeating.
export function socialMeta({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  const url = absoluteUrl(path);
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  return {
    openGraph: {
      title,
      description,
      url,
      siteName: "KeyFerret",
      images: [{ url: ogImage }],
      type: "website" as const,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [ogImage],
    },
  };
}

// Product + VideoGame (schema.org allows multi-typing via an array) so the
// entity qualifies for Google's Product/merchant rich results — a bare
// VideoGame type doesn't, since it isn't a Product subtype. Pricing is
// optional and best-effort: pass it when available for an AggregateOffer
// block (live price rich snippets), omit it and the schema still validates
// as a plain creative-work listing.
export function productJsonLd(game: Game, pricing?: PricingResult | null) {
  const offers =
    pricing && pricing.bestPrice !== null && pricing.offers.length > 0
      ? {
          "@type": "AggregateOffer",
          priceCurrency: pricing.currency,
          lowPrice: pricing.bestPrice,
          highPrice: Math.max(...pricing.offers.map((offer) => offer.price)),
          offerCount: pricing.offers.length,
          offers: pricing.offers.map((offer) => ({
            "@type": "Offer",
            price: offer.price,
            priceCurrency: offer.currency,
            url: offer.purchaseUrl,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: offer.storeName },
          })),
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": ["Product", "VideoGame"],
    name: game.title,
    description: game.description,
    image: game.coverImage,
    url: absoluteUrl(`/game/${game.slug}`),
    genre: game.genres.length > 0 ? game.genres : undefined,
    gamePlatform: game.platforms.length > 0 ? game.platforms : undefined,
    datePublished: game.releaseDate || undefined,
    offers,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

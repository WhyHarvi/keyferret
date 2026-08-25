import "server-only";
import { unstable_cache } from "next/cache";
import { getTopViewedGameSlugs } from "@/lib/analytics/log";
import { getGameBySlug } from "@/lib/game-repository";
import { getOffersForGame } from "@/lib/pricing/pricing.service";
import { getPopularGames } from "@/lib/igdb";
import type { Game } from "@/lib/types";

export type FeaturedGame = {
  game: Game;
  bestPrice: number | null;
  currency: string;
  regularPrice: number | null;
  discountPercent: number | null;
  storeName: string | null;
  // "trending" = selected from real same-day view analytics; "popular" =
  // IGDB-ranking backfill, used while a game/site is too new to have that
  // data yet. Lets the UI say *why* a game is featured instead of just
  // asserting it.
  source: "trending" | "popular";
};

const FEATURED_COUNT = 4;
// Checked once a day (see cache below), not per request — wide enough that
// preferring games with an actual CheapShark listing doesn't leave us short.
const CANDIDATE_POOL_SIZE = 12;

type FeaturedSlug = { slug: string; source: FeaturedGame["source"] };

// Only the *selection* (which games, and why) is cached for a day — that's
// the part expensive enough (an analytics query, an IGDB backfill, and a
// pricing-availability check across the candidate pool) to be worth not
// redoing per request, and the part the user actually asked to refresh
// daily. The price VALUES themselves are deliberately fetched fresh in
// getFeaturedGames() below, outside this cache: pricing already has its own
// 1hr cache with real resilience in pricing.service.ts, and folding it into
// a 24hr cache would freeze a single bad moment (a CheapShark hiccup during
// the one request that populates the cache) as "no price" for the rest of
// the day.
async function computeFeaturedSlugs(): Promise<FeaturedSlug[]> {
  const topSlugs = await getTopViewedGameSlugs(1, CANDIDATE_POOL_SIZE).catch(() => []);
  const trendingSlugs = new Set(topSlugs);

  let candidateSlugs = topSlugs;
  if (candidateSlugs.length < CANDIDATE_POOL_SIZE) {
    // Not enough real view data yet (a brand-new site, or just a quiet day) —
    // backfill with IGDB's own popularity ranking so the hero never looks
    // sparse or empty while traffic builds up.
    const popular = await getPopularGames(30).catch(() => []);
    const backfill = popular.filter((g) => g.backdropImage && !trendingSlugs.has(g.slug)).map((g) => g.slug);
    candidateSlugs = [...candidateSlugs, ...backfill].slice(0, CANDIDATE_POOL_SIZE);
  }

  // Prefer candidates that actually have a live CheapShark price — that's
  // the whole point of featuring them (real deals, not just popular titles).
  const checked = await Promise.all(
    candidateSlugs.map(async (slug) => {
      const game = await getGameBySlug(slug).catch(() => undefined);
      if (!game || !game.backdropImage) return null;
      const pricing = await getOffersForGame(slug).catch(() => undefined);
      return {
        slug,
        source: trendingSlugs.has(slug) ? ("trending" as const) : ("popular" as const),
        hasPricing: (pricing?.bestPrice ?? null) !== null,
      };
    }),
  );

  const viable = checked.filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null);
  const priced = viable.filter((candidate) => candidate.hasPricing);
  const unpriced = viable.filter((candidate) => !candidate.hasPricing);

  return [...priced, ...unpriced].slice(0, FEATURED_COUNT).map(({ slug, source }) => ({ slug, source }));
}

const getFeaturedSlugs = unstable_cache(computeFeaturedSlugs, ["featured-game-slugs"], {
  revalidate: 86_400,
});

async function withPricing({ slug, source }: FeaturedSlug): Promise<FeaturedGame | null> {
  const game = await getGameBySlug(slug).catch(() => undefined);
  if (!game || !game.backdropImage) return null;

  const pricing = await getOffersForGame(slug).catch(() => undefined);
  const bestOffer = pricing?.offers[0] ?? null;
  const discountPercent =
    bestOffer && bestOffer.regularPrice > bestOffer.price
      ? Math.round(((bestOffer.regularPrice - bestOffer.price) / bestOffer.regularPrice) * 100)
      : null;

  return {
    game,
    bestPrice: pricing?.bestPrice ?? null,
    currency: pricing?.currency ?? "USD",
    regularPrice: bestOffer?.regularPrice ?? null,
    discountPercent,
    storeName: bestOffer?.storeName ?? null,
    source,
  };
}

export async function getFeaturedGames(): Promise<FeaturedGame[]> {
  const slugs = await getFeaturedSlugs();
  const results = await Promise.all(slugs.map(withPricing));
  return results.filter((result): result is FeaturedGame => result !== null);
}

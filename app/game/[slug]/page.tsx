import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GamePage from "@/components/GamePage";
import { getPopularGames } from "@/lib/igdb";
import { getGameBySlug } from "@/lib/game-repository";
import { getOffersForGame } from "@/lib/pricing/pricing.service";
import { absoluteUrl, breadcrumbJsonLd, productJsonLd, socialMeta } from "@/lib/seo";
import { slugifyGenre } from "@/lib/genres";
import type { Game } from "@/lib/types";

type GameDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function seoGameName(game: Game): string {
  return game.slug === "grand-theft-auto-v" ? "GTA V" : game.title;
}

export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  // Distinguish "lookup threw" (IGDB rate limit, DB hiccup — transient, the
  // game may well exist) from "lookup succeeded but found nothing" (genuinely
  // absent). An uncaught throw here 500s the entire page instead of letting
  // the page component's own fetch — and notFound()/error.tsx — decide the
  // real outcome, so this must never throw.
  const [game, pricing] = await Promise.all([
    getGameBySlug(slug).catch(() => null),
    getOffersForGame(slug).catch(() => null),
  ]);
  if (game === null) return { title: "KeyFerret" };
  if (!game) return { title: "Game not found — KeyFerret" };

  const hasConfirmedOffers = pricing !== null && pricing !== undefined && pricing.offers.length > 0;
  const hasConfirmedNoOffers = pricing !== null && pricing !== undefined && pricing.offers.length === 0;
  if (hasConfirmedNoOffers) {
    const description = game.tagline ?? game.description;
    return {
      title: `${game.title} | KeyFerret`,
      description,
      alternates: { canonical: absoluteUrl(`/game/${slug}`) },
      robots: { index: false, follow: true },
      ...socialMeta({ title: game.title, description, path: `/game/${slug}`, image: game.coverImage }),
    };
  }

  const seoName = seoGameName(game);
  const title = game.slug === "grand-theft-auto-v"
    ? "GTA V Price Comparison – Cheapest Grand Theft Auto V Deals | KeyFerret"
    : `${game.title} Price Comparison – Cheapest Deals | KeyFerret`;
  const description = game.slug === "grand-theft-auto-v"
    ? "Compare GTA V prices across PC game stores. Find the cheapest current Grand Theft Auto V deal, discount and available offers."
    : `Compare ${game.title} prices across game stores. Find the cheapest current deal, discounts, and available offers.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/game/${slug}`) },
    ...(hasConfirmedOffers ? { robots: { index: true, follow: true } } : {}),
    ...socialMeta({ title: seoName, description, path: `/game/${slug}`, image: game.coverImage }),
  };
}

// Games that share a genre with the current one come first; the rest of the
// catalog backfills so the "you might also like" row is never sparse.
function getRelatedGames(game: Game, games: Game[], limit = 8): Game[] {
  const sameGenre = games.filter((g) => g.id !== game.id && g.genres.some((genre) => game.genres.includes(genre)));
  const sameGenreIds = new Set(sameGenre.map((g) => g.id));
  const rest = games.filter((g) => g.id !== game.id && !sameGenreIds.has(g.id));
  return [...sameGenre, ...rest].slice(0, limit);
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const [game, games] = await Promise.all([getGameBySlug(slug), getPopularGames(40)]);

  if (!game) notFound();

  // Best-effort: a pricing failure (rate limit, DB hiccup) should still let
  // the page render — it just falls back to a plain Product listing without
  // the AggregateOffer block instead of failing the whole request.
  const pricing = await getOffersForGame(slug).catch(() => undefined);
  const bestOffer = pricing?.offers[0];
  const lastChecked = bestOffer?.lastUpdated;
  const freshnessLabel = lastChecked
    ? `Prices last checked ${new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(lastChecked))} UTC`
    : "Prices checked recently";
  const heroPricing = bestOffer && pricing
    ? {
        bestPrice: pricing.bestPrice ?? bestOffer.price,
        currency: pricing.currency,
        storeCount: new Set(pricing.offers.map((offer) => offer.storeName)).size,
        storeName: bestOffer.storeName,
        purchaseUrl: bestOffer.purchaseUrl,
        savings: Math.round(bestOffer.savings),
        freshnessLabel,
      }
    : null;

  const breadcrumbItems = game.genres.length > 0
    ? [
        { name: "Home", path: "/" },
        { name: game.genres[0], path: `/genre/${slugifyGenre(game.genres[0])}` },
        { name: game.title, path: `/game/${game.slug}` },
      ]
    : [
        { name: "Home", path: "/" },
        { name: game.title, path: `/game/${game.slug}` },
      ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(game, pricing)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbItems)) }}
      />
      <GamePage game={game} relatedGames={getRelatedGames(game, games)} heroPricing={heroPricing} />
    </>
  );
}

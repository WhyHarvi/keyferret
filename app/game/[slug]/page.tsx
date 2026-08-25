import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GamePage from "@/components/GamePage";
import { getPopularGames } from "@/lib/igdb";
import { getGameBySlug } from "@/lib/game-repository";
import { absoluteUrl, productJsonLd } from "@/lib/seo";
import type { Game } from "@/lib/types";

type GameDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) return { title: "Game not found — KeyFerret" };

  return {
    title: `${game.title} — Compare prices | KeyFerret`,
    description: game.tagline ?? game.description,
    alternates: { canonical: absoluteUrl(`/game/${slug}`) },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(game)) }}
      />
      <GamePage game={game} relatedGames={getRelatedGames(game, games)} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameGridPage from "@/components/GameGridPage";
import { getPopularGames } from "@/lib/igdb";
import { genreIcon, getGamesByGenreSlug, getGenreCounts } from "@/lib/genres";

type GenrePageProps = {
  params: Promise<{ genre: string }>;
};

export async function generateStaticParams() {
  const games = await getPopularGames(100);
  return getGenreCounts(games).map((entry) => ({ genre: entry.slug }));
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  const games = await getPopularGames(100);
  const match = getGamesByGenreSlug(games, genre);
  if (!match) return { title: "Genre not found — KeyFerret" };

  return {
    title: `${match.genre} games — KeyFerret`,
    description: `Every ${match.genre} game in the catalog, with prices compared across every storefront that sells it.`,
  };
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { genre } = await params;
  const games = await getPopularGames(100);
  const match = getGamesByGenreSlug(games, genre);

  if (!match) notFound();

  return (
    <GameGridPage
      eyebrow="Genre"
      title={match.genre}
      icon={genreIcon(match.genre)}
      games={match.games}
      backHref="/#browse"
      backLabel="Back to browse"
    />
  );
}

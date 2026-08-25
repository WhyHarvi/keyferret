import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GameGridPage from "@/components/GameGridPage";
import { getPopularGames } from "@/lib/igdb";
import { genreIcon, getGamesByGenreSlug, getGenreCounts } from "@/lib/genres";
import { absoluteUrl, breadcrumbJsonLd, socialMeta } from "@/lib/seo";

type GenrePageProps = {
  params: Promise<{ genre: string }>;
};

export async function generateStaticParams() {
  const games = await getPopularGames(100);
  return getGenreCounts(games).map((entry) => ({ genre: entry.slug }));
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  // Same reasoning as the game page: a thrown lookup (IGDB rate limit) must
  // never 500 the whole page — fall back to a generic title and let the page
  // component's own fetch determine the real outcome.
  const games = await getPopularGames(100).catch(() => null);
  if (games === null) return { title: "KeyFerret" };

  const match = getGamesByGenreSlug(games, genre);
  if (!match) return { title: "Genre not found — KeyFerret" };

  const title = `${match.genre} games — KeyFerret`;
  const description = `Every ${match.genre} game in the catalog, with prices compared across every storefront that sells it.`;

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/genre/${genre}`) },
    ...socialMeta({ title: `${match.genre} games`, description, path: `/genre/${genre}` }),
  };
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { genre } = await params;
  const games = await getPopularGames(100);
  const match = getGamesByGenreSlug(games, genre);

  if (!match) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: match.genre, path: `/genre/${genre}` },
            ]),
          ),
        }}
      />
      <GameGridPage
        eyebrow="Genre"
        title={match.genre}
        icon={genreIcon(match.genre)}
        games={match.games}
        backHref="/#browse"
        backLabel="Back to browse"
      />
    </>
  );
}

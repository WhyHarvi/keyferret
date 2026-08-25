import type { MetadataRoute } from "next";
import { getPopularGames } from "@/lib/igdb";
import { getGenreCounts } from "@/lib/genres";
import { DEAL_FILTERS } from "@/lib/deal-filters";
import { SITE_URL } from "@/lib/seo";

// DEAL_FILTERS lands with the /deals pages built right after this file —
// sitemap and filter registry ship together, this import isn't a dangling ref.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await getPopularGames(100);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/games`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/deals`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const dealRoutes: MetadataRoute.Sitemap = Object.keys(DEAL_FILTERS).map((slug) => ({
    url: `${SITE_URL}/deals/${slug}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const genreRoutes: MetadataRoute.Sitemap = getGenreCounts(games).map((entry) => ({
    url: `${SITE_URL}/genre/${entry.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const gameRoutes: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${SITE_URL}/game/${game.slug}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...dealRoutes, ...genreRoutes, ...gameRoutes];
}

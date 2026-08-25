import type { Metadata } from "next";
import { Layers } from "lucide-react";
import GameGridPage from "@/components/GameGridPage";
import { getPopularGames } from "@/lib/igdb";
import { absoluteUrl, socialMeta } from "@/lib/seo";

const TITLE = "All games — KeyFerret";
const DESCRIPTION = "Every game in the catalog, with prices compared across every storefront that sells it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/games") },
  ...socialMeta({ title: "All games", description: DESCRIPTION, path: "/games" }),
};

export default async function AllGamesPage() {
  const games = await getPopularGames(100);
  return (
    <GameGridPage
      eyebrow="Catalog"
      title="Every game, every storefront."
      description="Browse the full catalog, or head back and filter by genre."
      icon={Layers}
      games={games}
    />
  );
}

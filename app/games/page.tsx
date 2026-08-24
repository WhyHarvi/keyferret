import type { Metadata } from "next";
import { Layers } from "lucide-react";
import GameGridPage from "@/components/GameGridPage";
import { getPopularGames } from "@/lib/igdb";

export const metadata: Metadata = {
  title: "All games — KeyFerret",
  description: "Every game in the catalog, with prices compared across every storefront that sells it.",
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

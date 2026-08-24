import HeroCarousel from "@/components/HeroCarousel";
import TrendingRow from "@/components/TrendingRow";
import BrowseSection from "@/components/BrowseSection";
import Footer from "@/components/Footer";
import { getPopularGames } from "@/lib/igdb";

export default async function Home() {
  const games = await getPopularGames();
  const featuredGames = games.filter((game) => game.backdropImage).slice(0, 4);
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroCarousel games={featuredGames} />

        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <TrendingRow games={games.slice(0, 12)} />
            <BrowseSection games={games} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

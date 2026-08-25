import HeroCarousel from "@/components/HeroCarousel";
import TrendingRow from "@/components/TrendingRow";
import BrowseSection from "@/components/BrowseSection";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { getPopularGames } from "@/lib/igdb";
import { getFeaturedGames } from "@/lib/featured-games";

export default async function Home() {
  const [games, featuredGames] = await Promise.all([getPopularGames(), getFeaturedGames()]);
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroCarousel games={featuredGames} />

        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <TrendingRow games={games.slice(0, 12)} />
            <AdSlot format="banner" slotId="0000000001" className="my-10" />
            <BrowseSection games={games} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

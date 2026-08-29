import type { Metadata } from "next";
import HeroCarousel from "@/components/HeroCarousel";
import TrendingRow from "@/components/TrendingRow";
import BrowseSection from "@/components/BrowseSection";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { getPopularGames } from "@/lib/igdb";
import { getFeaturedGames } from "@/lib/featured-games";
import { getCheapSharkDeals } from "@/lib/pricing/cheapshark";
import { POPULAR_DEALS_FILTER } from "@/lib/deal-filters";
import { absoluteUrl, socialMeta } from "@/lib/seo";

const DESCRIPTION = "Compare PC game prices across multiple stores. Find the cheapest game deals, discounts and current offers with KeyFerret.";

export const metadata: Metadata = {
  title: "Compare PC Game Prices & Find Cheap Game Deals | KeyFerret",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  ...socialMeta({ title: "Compare PC Game Prices & Find Cheap Game Deals", description: DESCRIPTION, path: "/" }),
};

export default async function Home() {
  const [games, featuredGames, trendingDeals] = await Promise.all([
    getPopularGames(),
    getFeaturedGames(),
    getCheapSharkDeals({ ...POPULAR_DEALS_FILTER.query, pageSize: 12 }).catch(() => []),
  ]);
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroCarousel games={featuredGames} />

        <div className="px-6 py-8 sm:px-10 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <TrendingRow deals={trendingDeals} />
            <AdSlot format="banner" slotId="0000000001" className="my-10" />
            <BrowseSection games={games} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import type { Metadata } from "next";
import DealsPage from "@/components/DealsPage";
import { getCheapSharkDeals } from "@/lib/pricing/cheapshark";
import { POPULAR_DEALS_FILTER } from "@/lib/deal-filters";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Popular game deals — KeyFerret",
  description: "The best-rated active game deals right now, ranked by CheapShark's deal-quality score.",
  alternates: { canonical: absoluteUrl("/deals") },
};

export default async function PopularDealsPage() {
  const deals = await getCheapSharkDeals(POPULAR_DEALS_FILTER.query).catch(() => []);
  return <DealsPage filter={POPULAR_DEALS_FILTER} deals={deals} />;
}

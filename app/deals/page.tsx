import type { Metadata } from "next";
import DealsPage from "@/components/DealsPage";
import { getCheapSharkDeals } from "@/lib/pricing/cheapshark";
import { POPULAR_DEALS_FILTER } from "@/lib/deal-filters";
import { absoluteUrl, socialMeta } from "@/lib/seo";

const DESCRIPTION = "The best-rated active game deals right now, ranked by CheapShark's deal-quality score.";

export const metadata: Metadata = {
  title: "Popular game deals — KeyFerret",
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("/deals") },
  ...socialMeta({ title: "Popular game deals", description: DESCRIPTION, path: "/deals" }),
};

export default async function PopularDealsPage() {
  const deals = await getCheapSharkDeals(POPULAR_DEALS_FILTER.query).catch(() => []);
  return <DealsPage filter={POPULAR_DEALS_FILTER} deals={deals} />;
}

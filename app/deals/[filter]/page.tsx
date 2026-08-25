import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DealsPage from "@/components/DealsPage";
import { getCheapSharkDeals } from "@/lib/pricing/cheapshark";
import { DEAL_FILTERS, getDealFilter } from "@/lib/deal-filters";
import { absoluteUrl } from "@/lib/seo";

type DealsFilterPageProps = {
  params: Promise<{ filter: string }>;
};

export function generateStaticParams() {
  return Object.keys(DEAL_FILTERS).map((filter) => ({ filter }));
}

export async function generateMetadata({ params }: DealsFilterPageProps): Promise<Metadata> {
  const { filter: slug } = await params;
  const filter = getDealFilter(slug);
  if (!filter) return { title: "Deals not found — KeyFerret" };

  return {
    title: `${filter.label} — KeyFerret`,
    description: filter.description,
    alternates: { canonical: absoluteUrl(filter.href) },
  };
}

export default async function DealsFilterPage({ params }: DealsFilterPageProps) {
  const { filter: slug } = await params;
  const filter = getDealFilter(slug);
  if (!filter) notFound();

  const deals = await getCheapSharkDeals(filter.query).catch(() => []);
  return <DealsPage filter={filter} deals={deals} />;
}

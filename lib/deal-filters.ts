import { Coins, Flame, PiggyBank, TrendingDown, Wallet, type LucideIcon } from "lucide-react";
import type { DealsQuery } from "@/lib/pricing/cheapshark";

export type DealFilter = {
  slug: string;
  href: string;
  label: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  query: DealsQuery;
};

// The /deals index — not part of DEAL_FILTERS since it has no [filter] slug,
// but included in ALL_DEAL_FILTERS so the tab row can render it alongside
// the rest.
export const POPULAR_DEALS_FILTER: DealFilter = {
  slug: "",
  href: "/deals",
  label: "Popular deals",
  eyebrow: "Trending offers",
  description: "The best-rated active deals right now, ranked by CheapShark's own deal-quality score.",
  icon: Flame,
  query: { sortBy: "Deal Rating" },
};

export const DEAL_FILTERS: Record<string, DealFilter> = {
  "biggest-discounts": {
    slug: "biggest-discounts",
    href: "/deals/biggest-discounts",
    label: "Biggest discounts",
    eyebrow: "Deepest cuts",
    description: "The steepest percentage discounts live right now, across every store CheapShark tracks.",
    icon: TrendingDown,
    query: { sortBy: "Savings" },
  },
  "under-5": {
    slug: "under-5",
    href: "/deals/under-5",
    label: "Under $5",
    eyebrow: "Budget picks",
    description: "Full games for less than the price of a coffee.",
    icon: Coins,
    query: { upperPrice: 5, sortBy: "Deal Rating" },
  },
  "under-10": {
    slug: "under-10",
    href: "/deals/under-10",
    label: "Under $10",
    eyebrow: "Budget picks",
    description: "Solid games at a price that barely needs a second thought.",
    icon: Wallet,
    query: { upperPrice: 10, sortBy: "Deal Rating" },
  },
  "under-20": {
    slug: "under-20",
    href: "/deals/under-20",
    label: "Under $20",
    eyebrow: "Budget picks",
    description: "Bigger titles, still well under full price.",
    icon: PiggyBank,
    query: { upperPrice: 20, sortBy: "Deal Rating" },
  },
};

export const ALL_DEAL_FILTERS: DealFilter[] = [POPULAR_DEALS_FILTER, ...Object.values(DEAL_FILTERS)];

export function getDealFilter(slug: string): DealFilter | undefined {
  return DEAL_FILTERS[slug];
}

import { ArrowUpRight } from "lucide-react";
import { discountPercent, type RetailerPrice } from "@/lib/types";

type PriceCompareListProps = {
  prices: RetailerPrice[];
};

// The reason this site exists: every storefront selling the game, ranked
// cheapest first, with the winner called out. Trending/Deals/Watchlist sell
// the games — this sells the comparison.
export default function PriceCompareList({ prices }: PriceCompareListProps) {
  if (prices.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <p className="font-semibold text-text-main">Price comparisons are coming soon.</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
          We don&apos;t have verified storefront prices for this game yet. They&apos;ll appear here when available.
        </p>
      </div>
    );
  }

  const sorted = [...prices].sort((a, b) => a.price - b.price);

  return (
    <div className="mt-6 flex flex-col gap-3">
      {sorted.map((price, i) => {
        const discount = discountPercent(price);
        const isBest = i === 0;

        return (
          <a
            key={price.retailer}
            href={price.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center gap-4 rounded-xl border p-4 transition-colors duration-200 ${
              isBest
                ? "border-accent/50 bg-accent/5"
                : "border-border bg-surface hover:border-accent/30 hover:bg-surface-2"
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 text-sm font-bold text-text-main">
              {price.retailer.charAt(0)}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold text-text-main">{price.retailer}</p>
                {isBest && (
                  <span className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Best price
                  </span>
                )}
              </div>
              {discount !== null && (
                <p className="mt-0.5 text-xs text-text-muted">{discount}% off list price</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-lg font-bold text-text-main">${price.price.toFixed(2)}</p>
                {price.originalPrice && (
                  <p className="text-xs text-text-muted line-through">${price.originalPrice.toFixed(2)}</p>
                )}
              </div>
              <ArrowUpRight
                size={18}
                className="shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                aria-hidden="true"
              />
            </div>
          </a>
        );
      })}
    </div>
  );
}

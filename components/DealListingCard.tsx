"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Award } from "lucide-react";
import { trackEvent } from "@/lib/analytics-client";
import type { Deal } from "@/lib/pricing/cheapshark";

// Fixed to en-US: this data renders during SSR (unlike the per-game price
// panel, which only shows a price after a client-side fetch resolves), so an
// Intl.NumberFormat(undefined, ...) locale here would format one way on the
// server and possibly another in the browser, producing a hydration
// mismatch. Deals are always plain USD (CheapShark's /deals feed isn't
// currency-converted), so there's no locale-aware formatting to preserve.
const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(amount);

export default function DealListingCard({ deal }: { deal: Deal }) {

  return (
    <motion.a
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      href={deal.purchaseUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackEvent({ type: "deal_click", storeName: deal.storeName, metadata: { dealId: deal.dealId, title: deal.title, price: deal.price } })}
      aria-label={`View ${formatPrice(deal.price)} deal for ${deal.title} at ${deal.storeName}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- external, dynamic CheapShark thumbnails across many store CDNs */}
        <img
          src={deal.thumbnailUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />

        <span className="absolute left-2.5 top-2.5 rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white">
          -{deal.savingsPercent}%
        </span>
        {deal.metacriticScore !== null && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Award size={12} className="text-amber-400" aria-hidden="true" />
            {deal.metacriticScore}
          </span>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="truncate text-sm font-semibold text-text-main">{deal.title}</h3>
        <p className="mt-0.5 truncate text-xs text-text-muted">{deal.storeName}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tabular-nums text-text-main">{formatPrice(deal.price)}</span>
            {deal.regularPrice > deal.price && (
              <span className="text-xs tabular-nums text-text-muted line-through">{formatPrice(deal.regularPrice)}</span>
            )}
          </div>
          <ArrowUpRight size={15} className="shrink-0 text-text-muted transition-colors group-hover:text-accent" aria-hidden="true" />
        </div>
      </div>
    </motion.a>
  );
}

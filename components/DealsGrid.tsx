"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Store, X } from "lucide-react";
import DealListingCard from "@/components/DealListingCard";
import type { Deal } from "@/lib/pricing/cheapshark";

export default function DealsGrid({ deals }: { deals: Deal[] }) {
  const [storeName, setStoreName] = useState("");

  const stores = useMemo(
    () => [...new Set(deals.map((deal) => deal.storeName))].sort((a, b) => a.localeCompare(b)),
    [deals],
  );
  const filteredDeals = storeName ? deals.filter((deal) => deal.storeName === storeName) : deals;

  return (
    <>
      <div className="sticky top-20 z-20 mt-6 rounded-2xl border border-border bg-background/95 p-3 shadow-lg shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-text-main focus-within:border-accent md:max-w-xs">
            <Store size={16} className="shrink-0 text-accent" aria-hidden="true" />
            <span className="sr-only">Filter by store</span>
            <select
              value={storeName}
              onChange={(event) => setStoreName(event.target.value)}
              className="h-11 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-5 outline-none"
            >
              <option value="">All stores</option>
              {stores.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <div className="flex min-h-11 items-center justify-between gap-3 md:justify-end">
            <p className="text-sm text-text-muted" role="status" aria-live="polite">
              <span className="font-semibold text-text-main">{filteredDeals.length}</span> {filteredDeals.length === 1 ? "deal" : "deals"}
            </p>
            {storeName && (
              <button
                type="button"
                onClick={() => setStoreName("")}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-text-main transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X size={15} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredDeals.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {filteredDeals.map((deal) => (
              <motion.div key={deal.dealId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <DealListingCard deal={deal} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-medium text-text-main">No deals match this filter.</p>
          <button type="button" onClick={() => setStoreName("")} className="mt-3 min-h-11 cursor-pointer text-sm font-semibold text-accent hover:underline">
            Clear filter
          </button>
        </div>
      )}
    </>
  );
}

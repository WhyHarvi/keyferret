"use client";

// Keeps the best deal one click away while the visitor is reading the
// description or scanning the full price list further down the page.
// Appears once the hero's own CTA row scrolls out of view, disappears again
// when they scroll back up to it — a sentinel div in the hero (#hero-cta-sentinel)
// is the trigger, watched with a plain IntersectionObserver.

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { formatPrice, usePricing } from "@/lib/pricing-client";
import { trackEvent } from "@/lib/analytics-client";
import type { Game } from "@/lib/types";

type StickyPriceBarProps = {
  game: Game;
};

export default function StickyPriceBar({ game }: StickyPriceBarProps) {
  const [visible, setVisible] = useState(false);
  const { pricing } = usePricing(game.slug);

  useEffect(() => {
    const sentinel = document.getElementById("hero-cta-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "-64px 0px 0px 0px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const bestOffer = pricing && pricing.offers.length > 0 ? pricing.offers[0] : null;

  return (
    <AnimatePresence>
      {visible && bestOffer && (
        <motion.div
          initial={{ y: -72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -72, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background/80 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-xl backdrop-saturate-150"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
            <p className="truncate text-sm font-semibold text-text-main">{game.title}</p>

            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-sm font-bold tabular-nums text-text-main">{formatPrice(bestOffer.price, bestOffer.currency)}</p>
                <p className="truncate text-[11px] text-text-muted">at {bestOffer.storeName}</p>
              </div>
              <a
                href={bestOffer.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => trackEvent({ type: "offer_click", gameSlug: game.slug, storeName: bestOffer.storeName, metadata: { dealId: bestOffer.dealId, price: bestOffer.price } })}
                className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 hover:opacity-90 active:scale-100"
              >
                Get deal
                <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

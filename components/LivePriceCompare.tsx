"use client";

// Real prices only: CheapShark exposes a single all-time-low data point per
// title (price + date), not a day-by-day history, so "price history" here is
// an honest range chart — lowest ever recorded, up to the highest listed
// price, with today's best price marked between them — instead of a
// fabricated trend line the API can't actually back up.

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "motion/react";
import { AlertTriangle, ArrowUpRight, Check, Flame, RefreshCw, Store, TrendingDown } from "lucide-react";
import CountUp from "@/components/CountUp";
import { formatPrice, usePricing, type OfferResponse } from "@/lib/pricing-client";

type Offer = OfferResponse["offers"][number];

const DAY_MS = 86_400_000;

function formatRelativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"} ago`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "year" : "years"} ago`;
}

// CountUp animates a plain number, so it needs the bare currency symbol
// (not a fully formatted string) to use as its prefix.
function currencySymbol(currency: string): string {
  const parts = new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).formatToParts(0);
  return parts.find((part) => part.type === "currency")?.value ?? "";
}

function SkeletonBlock({ className, delayMs = 0 }: { className: string; delayMs?: number }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} style={{ animationDelay: `${delayMs}ms` }} />;
}

const listReveal = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const rowReveal = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
};

// The range chart: lowest-ever-recorded up to the highest regular price any
// store lists, with today's best price marked along it. GSAP owns this
// sequence (track draws in, then the marker pops) — a multi-step timeline is
// what it's good at, distinct from the spring-based number ticks below.
function PriceHistoryMeter({
  bestPrice,
  currency,
  historicalLow,
  offers,
}: {
  bestPrice: number;
  currency: string;
  historicalLow: { price: number; date: string };
  offers: Offer[];
}) {
  const fillRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  const ceiling = Math.max(...offers.map((offer) => offer.regularPrice), bestPrice);
  const floor = Math.min(historicalLow.price, bestPrice);
  const range = ceiling - floor;
  const position = range > 0.01 ? Math.min(100, Math.max(0, ((bestPrice - floor) / range) * 100)) : 0;
  const percentAboveLow =
    historicalLow.price > 0 && bestPrice > historicalLow.price
      ? Math.round(((bestPrice - historicalLow.price) / historicalLow.price) * 100)
      : null;

  useEffect(() => {
    if (!fillRef.current || !markerRef.current) return;
    const context = gsap.context(() => {
      gsap.set(fillRef.current, { width: "0%" });
      gsap.set(markerRef.current, { opacity: 0, scale: 0.4 });
      gsap
        .timeline({ defaults: { ease: "power3.out" }, delay: 0.15 })
        .to(fillRef.current, { width: `${position}%`, duration: 0.9 })
        .to(markerRef.current, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2.2)" }, "-=0.3");
    });
    return () => context.revert();
  }, [position]);

  return (
    <div className="rounded-2xl border border-border bg-background/40 p-6">
      <div className="flex items-center gap-2 text-text-muted">
        <TrendingDown size={16} aria-hidden="true" />
        <p className="text-sm font-medium">Price history</p>
      </div>

      <div className="relative mt-6">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div ref={fillRef} className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" />
        </div>
        <div ref={markerRef} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${position}%` }}>
          <span className="block h-3.5 w-3.5 rounded-full bg-accent-2 ring-[3px] ring-background" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-text-muted">
        <span>
          <span className="block text-sm font-semibold tabular-nums text-text-main">
            <CountUp to={historicalLow.price} prefix={currencySymbol(currency)} duration={1} />
          </span>
          Lowest · {formatRelativeDate(historicalLow.date)}
        </span>
        <span className="text-right">
          <span className="block text-sm font-semibold tabular-nums text-text-main">{formatPrice(ceiling, currency)}</span>
          Regular price
        </span>
      </div>

      {percentAboveLow !== null && percentAboveLow > 0 && (
        <p className="mt-3 text-xs text-text-muted">{percentAboveLow}% above the lowest recorded price.</p>
      )}
    </div>
  );
}

export default function LivePriceCompare({ slug }: { slug: string }) {
  const { pricing, error, loading, retry } = usePricing(slug);

  const historicalLow = pricing?.historicalLow ?? null;
  const bestPrice = pricing?.bestPrice ?? null;
  const isBestPriceEver = bestPrice !== null && historicalLow !== null && bestPrice <= historicalLow.price + 0.01;

  return (
    <section aria-labelledby="price-comparison-title" className="overflow-hidden rounded-3xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2">
            <Store size={18} className="text-white" aria-hidden="true" />
          </span>
          <div>
            <h2 id="price-comparison-title" className="text-lg font-semibold tracking-tight text-text-main sm:text-xl">
              Price comparison
            </h2>
            <p className="text-sm text-text-muted">Live offers across every storefront that sells it.</p>
          </div>
        </div>
        {pricing && pricing.offers.length > 0 && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-text-main">
            <Check size={13} className="text-accent" aria-hidden="true" />
            {pricing.offers.length} {pricing.offers.length === 1 ? "offer" : "offers"}
          </span>
        )}
      </div>

      {loading && (
        <div className="px-5 py-6 sm:px-8 sm:py-8" role="status" aria-label="Loading current prices">
          <span className="sr-only">Checking current prices…</span>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <SkeletonBlock className="h-36" />
            <SkeletonBlock className="h-36" delayMs={90} />
          </div>
          <div className="mt-3 flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <SkeletonBlock key={i} className="h-16" delayMs={(i + 2) * 90} />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="mx-5 mb-5 mt-5 flex items-start gap-4 rounded-2xl border border-border bg-background/40 p-6 sm:mx-8 sm:mb-8">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <AlertTriangle size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-text-main">Prices are temporarily unavailable.</p>
            <p className="mt-1 text-sm text-text-muted">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <RefreshCw size={15} aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && pricing && pricing.offers.length === 0 && (
        <div className="mx-5 mb-5 mt-5 rounded-2xl border border-dashed border-border bg-background/40 p-6 sm:mx-8 sm:mb-8">
          <p className="font-semibold text-text-main">No current offers found</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
            There are no active store offers available for this game right now.
          </p>
        </div>
      )}

      {!loading && !error && pricing && pricing.offers.length > 0 && (
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/15 via-surface to-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-text-muted">Best available price</p>
                {isBestPriceEver && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent to-accent-2 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Flame size={12} aria-hidden="true" />
                    Best price ever
                  </span>
                )}
              </div>
              <p className="mt-3 text-4xl font-bold tracking-tight text-text-main sm:text-5xl">
                {bestPrice === null ? (
                  "—"
                ) : (
                  <CountUp to={bestPrice} prefix={currencySymbol(pricing.currency)} duration={1} />
                )}
              </p>
              <p className="mt-3 text-sm text-text-muted">
                at <span className="font-medium text-text-main">{pricing.offers[0].storeName}</span> · priced in {pricing.currency}
              </p>
            </div>

            {historicalLow && bestPrice !== null ? (
              <PriceHistoryMeter bestPrice={bestPrice} currency={pricing.currency} historicalLow={historicalLow} offers={pricing.offers} />
            ) : (
              <div className="flex flex-col justify-center rounded-2xl border border-border bg-background/40 p-6">
                <div className="flex items-center gap-2 text-text-muted">
                  <TrendingDown size={16} aria-hidden="true" />
                  <p className="text-sm font-medium">Price history</p>
                </div>
                <p className="mt-3 text-sm text-text-muted">We haven&apos;t recorded a price low for this title yet — check back soon.</p>
              </div>
            )}
          </div>

          <div className="mt-7 hidden grid-cols-[minmax(0,1fr)_110px_110px_130px] gap-4 px-4 text-xs font-semibold uppercase tracking-wider text-text-muted sm:grid">
            <span>Store</span>
            <span className="text-right">Regular</span>
            <span className="text-right">Price</span>
            <span />
          </div>

          <motion.div initial="hidden" animate="show" variants={listReveal} className="mt-3 flex flex-col gap-2.5">
            {pricing.offers.map((offer, index) => (
              <motion.a
                key={offer.dealId}
                variants={rowReveal}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                href={offer.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                aria-label={`View ${formatPrice(offer.price, offer.currency)} offer at ${offer.storeName}`}
                className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 rounded-2xl border p-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:grid-cols-[minmax(0,1fr)_110px_110px_130px] ${
                  index === 0
                    ? "border-accent/40 bg-accent/5"
                    : "border-border bg-background/40 hover:border-accent/30 hover:bg-surface-2"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-text-main">{offer.storeName}</p>
                    {index === 0 && (
                      <span className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Best price
                      </span>
                    )}
                  </div>
                  {offer.savings > 0.01 && <p className="mt-0.5 text-xs text-text-muted">Save {Math.round(offer.savings)}%</p>}
                </div>

                <p className="hidden text-right text-sm tabular-nums text-text-muted line-through sm:block">
                  {offer.regularPrice > offer.price ? formatPrice(offer.regularPrice, offer.currency) : "—"}
                </p>
                <p className="hidden text-right text-base font-bold tabular-nums text-text-main sm:block">
                  {formatPrice(offer.price, offer.currency)}
                </p>

                <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:justify-end">
                  <p className="text-lg font-bold tabular-nums text-text-main sm:hidden">{formatPrice(offer.price, offer.currency)}</p>
                  <span className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-surface-2 px-4 text-sm font-semibold text-text-main transition-colors duration-200 group-hover:bg-gradient-to-r group-hover:from-accent group-hover:to-accent-2 group-hover:text-white">
                    View deal
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}

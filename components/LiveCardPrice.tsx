"use client";

import { useEffect, useRef, useState } from "react";

type CardPricing = {
  bestPrice: number | null;
  currency: string;
  offers: Array<{ dealId: string }>;
};

const responseCache = new Map<string, Promise<CardPricing>>();

function requestPricing(slug: string): Promise<CardPricing> {
  const existing = responseCache.get(slug);
  if (existing) return existing;
  const request = fetch(`/api/games/${encodeURIComponent(slug)}/offers`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Pricing request failed");
      return response.json() as Promise<CardPricing>;
    })
    .catch((error) => {
      responseCache.delete(slug);
      throw error;
    });
  responseCache.set(slug, request);
  return request;
}

export default function LiveCardPrice({ slug }: { slug: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pricing, setPricing] = useState<CardPricing | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      requestPricing(slug)
        .then((result) => {
          if (active) setPricing(result);
        })
        .catch(() => {
          if (active) setUnavailable(true);
        });
    }, { rootMargin: "300px" });
    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [slug]);

  const hasPrice = pricing?.bestPrice !== null && pricing?.bestPrice !== undefined && pricing.offers.length > 0;
  const label = hasPrice
    ? new Intl.NumberFormat(undefined, { style: "currency", currency: pricing.currency, maximumFractionDigits: 2 }).format(pricing.bestPrice as number)
    : pricing || unavailable
      ? "View"
      : "···";

  return (
    <span ref={ref} className="inline-flex min-h-7 items-center rounded-lg border border-white/15 bg-black/70 px-2.5 text-xs font-bold tabular-nums text-white shadow-sm backdrop-blur-md">
      {label}
    </span>
  );
}

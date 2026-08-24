"use client";

import { useEffect, useState } from "react";

export type OfferResponse = {
  bestPrice: number | null;
  currency: string;
  sourceCurrency: "USD";
  isConverted: boolean;
  historicalLow: { price: number; date: string } | null;
  offers: Array<{
    dealId: string;
    storeName: string;
    price: number;
    regularPrice: number;
    savings: number;
    currency: string;
    purchaseUrl: string;
    lastUpdated?: string;
  }>;
};

// Keyed by slug so every component reading the same game's price on the same
// page (price panel, sticky bar) shares one in-flight request instead of
// each firing its own.
const pricingCache = new Map<string, Promise<OfferResponse>>();

function requestPricing(slug: string): Promise<OfferResponse> {
  const existing = pricingCache.get(slug);
  if (existing) return existing;
  const request = fetch(`/api/games/${encodeURIComponent(slug)}/offers`, { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Pricing request failed");
      }
      return response.json() as Promise<OfferResponse>;
    })
    .catch((error: unknown) => {
      pricingCache.delete(slug);
      throw error;
    });
  pricingCache.set(slug, request);
  return request;
}

export function usePricing(slug: string) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<{
    slug: string;
    version: number;
    pricing: OfferResponse | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    let active = true;
    if (version > 0) pricingCache.delete(slug);

    requestPricing(slug)
      .then((pricing) => {
        if (active) setState({ slug, version, pricing, error: null });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ slug, version, pricing: null, error: error instanceof Error ? error.message : "Pricing request failed" });
      });

    return () => {
      active = false;
    };
  }, [slug, version]);

  const current = state?.slug === slug && state.version === version ? state : null;

  return {
    pricing: current?.pricing ?? null,
    error: current?.error ?? null,
    loading: current === null,
    retry: () => setVersion((v) => v + 1),
  };
}

export function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

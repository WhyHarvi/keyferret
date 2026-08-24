import "server-only";
import type { PricingResult } from "@/lib/pricing/types";

const REGION_CURRENCIES: Record<string, string> = {
  AU: "AUD", BR: "BRL", CA: "CAD", CH: "CHF", CZ: "CZK", DK: "DKK",
  GB: "GBP", IN: "INR", JP: "JPY", MX: "MXN", NO: "NOK", NZ: "NZD",
  PL: "PLN", SE: "SEK", US: "USD",
};

const EURO_REGIONS = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR", "IE",
  "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
]);

function currencyForRegion(region?: string): string {
  if (!region) return "USD";
  const normalized = region.toUpperCase();
  if (EURO_REGIONS.has(normalized)) return "EUR";
  return REGION_CURRENCIES[normalized] || "USD";
}

export function getVisitorCurrency(request: Request): string {
  const region = request.headers.get("x-vercel-ip-country")
    || request.headers.get("cf-ipcountry");
  if (region) return currencyForRegion(region);

  const language = request.headers.get("accept-language")?.split(",")[0]?.trim();
  if (!language) return "USD";
  try {
    return currencyForRegion(new Intl.Locale(language).region);
  } catch {
    return "USD";
  }
}

async function getUsdRate(currency: string): Promise<number> {
  if (currency === "USD") return 1;
  const response = await fetch(`https://api.frankfurter.dev/v2/rate/USD/${currency}`, {
    next: { revalidate: 21_600 },
  });
  if (!response.ok) throw new Error(`Exchange-rate request failed (${response.status})`);
  const data = await response.json() as { rate?: number };
  if (!Number.isFinite(data.rate)) throw new Error("Exchange-rate response was invalid");
  return data.rate as number;
}

export async function localizePricing(pricing: PricingResult, currency: string) {
  try {
    const exchangeRate = await getUsdRate(currency);
    const convert = (amount: number) => Math.round(amount * exchangeRate * 100) / 100;
    return {
      ...pricing,
      bestPrice: pricing.bestPrice === null ? null : convert(pricing.bestPrice),
      currency,
      sourceCurrency: "USD" as const,
      exchangeRate,
      isConverted: currency !== "USD",
      offers: pricing.offers.map((offer) => ({
        ...offer,
        price: convert(offer.price),
        regularPrice: convert(offer.regularPrice),
        currency,
      })),
      historicalLow: pricing.historicalLow
        ? { ...pricing.historicalLow, price: convert(pricing.historicalLow.price) }
        : null,
    };
  } catch (error) {
    console.error("Currency conversion failed", error);
    return { ...pricing, sourceCurrency: "USD" as const, exchangeRate: 1, isConverted: false };
  }
}

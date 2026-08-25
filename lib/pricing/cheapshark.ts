import "server-only";
import type { GameOffer } from "@/lib/pricing/types";

const API_URL = "https://www.cheapshark.com/api/1.0";
const PROVIDER = "cheapshark";

type CheapSharkSearchResult = { gameID: string; external: string; steamAppID: string | null };
type CheapSharkDeal = { storeID: string; dealID: string; price: string; retailPrice: string; savings: string };
type CheapSharkGame = {
  info: { title: string; steamAppID: string | null };
  cheapestPriceEver?: { price: string; date: number };
  deals: CheapSharkDeal[];
};
type CheapSharkStore = { storeID: string; storeName: string; isActive: number };

export type HistoricalLow = { price: number; date: string };

function headers(): HeadersInit {
  return { "User-Agent": process.env.CHEAPSHARK_USER_AGENT?.trim() || "KeyFerret/0.1" };
}

// CheapShark rate-limits aggressively (429 + Retry-After). Once we're told to
// back off, further calls fail fast locally instead of making a request we
// already know will be rejected — that would just extend the ban and pile up
// noisy errors on every page view until the window passes.
let cooldownUntilMs = 0;

// next dev never honors next:{revalidate} (Next only applies the fetch data
// cache in a build/prod context), so a hand-rolled cache is what actually
// cuts request volume while developing — same fix already applied in
// lib/igdb.ts, for the same reason. Additive: callers that pass no
// cacheSeconds (the live per-game offers lookup) are unaffected.
const responseCache = new Map<string, { value: unknown; expiresAt: number }>();

async function fetchCheapShark<T>(path: string, cacheSeconds?: number): Promise<T> {
  if (cacheSeconds) {
    const cached = responseCache.get(path);
    if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  }

  const remainingCooldownMs = cooldownUntilMs - Date.now();
  if (remainingCooldownMs > 0) {
    throw new Error(`CheapShark is rate-limited; retry after ${Math.ceil(remainingCooldownMs / 1000)}s`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: headers(),
    ...(cacheSeconds ? { next: { revalidate: cacheSeconds } } : { cache: "no-store" as const }),
  });
  if (!response.ok) {
    const retryAfter = response.headers.get("Retry-After");
    if (response.status === 429) {
      const retryAfterSeconds = Number(retryAfter);
      cooldownUntilMs = Date.now() + (Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 60_000);
    }
    throw new Error(`CheapShark request failed (${response.status})${retryAfter ? `; retry after ${retryAfter}s` : ""}`);
  }
  const data = (await response.json()) as T;
  if (cacheSeconds) responseCache.set(path, { value: data, expiresAt: Date.now() + cacheSeconds * 1000 });
  return data;
}

function normalizeTitle(title: string): string {
  return title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function findCheapSharkGame(title: string): Promise<CheapSharkSearchResult | undefined> {
  const params = new URLSearchParams({ title, limit: "60", exact: "1" });
  let results = await fetchCheapShark<CheapSharkSearchResult[]>(`/games?${params}`);
  if (results.length === 0) {
    params.set("exact", "0");
    results = await fetchCheapShark<CheapSharkSearchResult[]>(`/games?${params}`);
  }
  const normalized = normalizeTitle(title);
  return results.find((candidate) => normalizeTitle(candidate.external) === normalized);
}

function extractHistoricalLow(game: CheapSharkGame): HistoricalLow | null {
  const cheapest = game.cheapestPriceEver;
  const price = cheapest ? Number(cheapest.price) : NaN;
  if (!cheapest || !Number.isFinite(price) || !Number.isFinite(cheapest.date)) return null;
  return { price, date: new Date(cheapest.date * 1000).toISOString() };
}

export async function getCheapSharkOffers(cheapSharkGameId: string): Promise<{ offers: GameOffer[]; historicalLow: HistoricalLow | null }> {
  const [game, stores] = await Promise.all([
    fetchCheapShark<CheapSharkGame>(`/games?id=${encodeURIComponent(cheapSharkGameId)}`),
    fetchCheapShark<CheapSharkStore[]>("/stores", 86_400),
  ]);
  const storeMap = new Map(stores.map((store) => [store.storeID, store]));
  const now = new Date();

  const offers = game.deals
    .map((deal) => {
      const store = storeMap.get(deal.storeID);
      return {
        provider: PROVIDER,
        providerGameId: cheapSharkGameId,
        storeId: deal.storeID,
        storeName: store?.storeName || `Store ${deal.storeID}`,
        price: Number(deal.price),
        regularPrice: Number(deal.retailPrice),
        savings: Number(deal.savings),
        currency: "USD" as const,
        dealId: deal.dealID,
        purchaseUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
        lastUpdated: now,
      };
    })
    .filter((offer) => Number.isFinite(offer.price) && Number.isFinite(offer.regularPrice))
    .sort((a, b) => a.price - b.price);

  return { offers, historicalLow: extractHistoricalLow(game) };
}

// The lowest price CheapShark has ever recorded for this title, fetched on
// its own for the DB-cache-hit path (where we don't already have a fresh
// /games?id= response in hand). Cached at the fetch level — independent of
// the DB offer cache — so it stays cheap to read on every page view without
// making an extra CheapShark request each time.
export async function getCheapSharkHistoricalLow(cheapSharkGameId: string): Promise<HistoricalLow | null> {
  const game = await fetchCheapShark<CheapSharkGame>(`/games?id=${encodeURIComponent(cheapSharkGameId)}`, 3600);
  return extractHistoricalLow(game);
}

type CheapSharkDealListItem = {
  dealID: string;
  title: string;
  storeID: string;
  salePrice: string;
  normalPrice: string;
  savings: string;
  metacriticScore: string;
  steamRatingText: string | null;
  thumb: string;
};

export type Deal = {
  dealId: string;
  title: string;
  storeId: string;
  storeName: string;
  price: number;
  regularPrice: number;
  savingsPercent: number;
  metacriticScore: number | null;
  steamRatingText: string | null;
  thumbnailUrl: string;
  purchaseUrl: string;
};

export type DealsQuery = {
  storeID?: string;
  upperPrice?: number;
  lowerPrice?: number;
  sortBy?: "Deal Rating" | "Savings" | "Price" | "Recent";
  pageSize?: number;
};

// CheapShark's site-wide deal feed — distinct from getCheapSharkOffers, which
// is scoped to a single already-known game. Backs the /deals pages (popular,
// biggest discounts, under-$N) rather than the per-game price panel.
export async function getCheapSharkDeals(query: DealsQuery = {}): Promise<Deal[]> {
  const params = new URLSearchParams({ onSale: "1", pageSize: String(query.pageSize ?? 60) });
  if (query.storeID) params.set("storeID", query.storeID);
  if (query.upperPrice !== undefined) params.set("upperPrice", String(query.upperPrice));
  if (query.lowerPrice !== undefined) params.set("lowerPrice", String(query.lowerPrice));
  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
    params.set("desc", "1");
  }

  const [deals, stores] = await Promise.all([
    fetchCheapShark<CheapSharkDealListItem[]>(`/deals?${params}`, 900),
    fetchCheapShark<CheapSharkStore[]>("/stores", 86_400),
  ]);
  const storeMap = new Map(stores.map((store) => [store.storeID, store]));

  return deals
    .map((deal) => ({
      dealId: deal.dealID,
      title: deal.title,
      storeId: deal.storeID,
      storeName: storeMap.get(deal.storeID)?.storeName || `Store ${deal.storeID}`,
      price: Number(deal.salePrice),
      regularPrice: Number(deal.normalPrice),
      savingsPercent: Math.round(Number(deal.savings)),
      metacriticScore: deal.metacriticScore && Number(deal.metacriticScore) > 0 ? Number(deal.metacriticScore) : null,
      steamRatingText: deal.steamRatingText || null,
      thumbnailUrl: deal.thumb,
      purchaseUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
    }))
    .filter((deal) => Number.isFinite(deal.price) && Number.isFinite(deal.regularPrice));
}

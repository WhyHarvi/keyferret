export interface GameOffer {
  provider: string;
  providerGameId: string;
  storeId: string;
  storeName: string;
  price: number;
  regularPrice: number;
  savings: number;
  currency: string;
  dealId: string;
  purchaseUrl: string;
  lastUpdated?: Date;
}

export interface PricingResult {
  game: { id: string; name: string; slug: string };
  bestPrice: number | null;
  currency: string;
  offers: GameOffer[];
  source: "cache" | "cheapshark";
  historicalLow: { price: number; date: string } | null;
}

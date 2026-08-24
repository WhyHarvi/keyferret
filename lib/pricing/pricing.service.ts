import "server-only";
import { getPrisma } from "@/lib/db";
import { getGameBySlug } from "@/lib/game-repository";
import { findCheapSharkGame, getCheapSharkHistoricalLow, getCheapSharkOffers } from "@/lib/pricing/cheapshark";
import type { GameOffer, PricingResult } from "@/lib/pricing/types";

const PROVIDER = "cheapshark";
const CACHE_TTL_MS = 60 * 60 * 1000;

function result(
  game: { id: string; name: string; slug: string },
  offers: GameOffer[],
  source: PricingResult["source"],
  historicalLow: PricingResult["historicalLow"],
): PricingResult {
  return { game, bestPrice: offers[0]?.price ?? null, currency: "USD", offers, source, historicalLow };
}

// Best-effort: a missing or failed historical-low lookup shouldn't take down
// the current offers, which are the part visitors actually need.
function fetchHistoricalLow(cheapSharkGameId: string | undefined): Promise<PricingResult["historicalLow"]> {
  if (!cheapSharkGameId) return Promise.resolve(null);
  return getCheapSharkHistoricalLow(cheapSharkGameId).catch((error: unknown) => {
    console.error("Historical low lookup failed", error);
    return null;
  });
}

export async function getOffersForGame(slug: string): Promise<PricingResult | undefined> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("DATABASE_URL is required for pricing lookups");

  let storedGame = await prisma.game.findUnique({ where: { slug } });
  if (!storedGame) {
    const game = await getGameBySlug(slug);
    if (!game) return undefined;
    storedGame = await prisma.game.findUnique({ where: { slug } });
  }
  if (!storedGame) throw new Error("Game could not be persisted before pricing lookup");

  const gameSummary = { id: storedGame.id, name: storedGame.name, slug: storedGame.slug };
  const cutoff = new Date(Date.now() - CACHE_TTL_MS);
  const mapping = await prisma.gameMapping.findUnique({
    where: { gameId_provider: { gameId: storedGame.id, provider: PROVIDER } },
  });
  const cached = await prisma.offer.findMany({
    where: { gameId: storedGame.id, provider: PROVIDER, lastUpdated: { gte: cutoff } },
    include: { store: true },
    orderBy: { price: "asc" },
  });

  if (cached.length > 0 || (mapping && mapping.updatedAt >= cutoff)) {
    const offers = cached.map((offer) => ({
      provider: offer.provider,
      providerGameId: offer.providerGameId,
      storeId: offer.store.externalId,
      storeName: offer.store.name,
      price: Number(offer.price),
      regularPrice: Number(offer.regularPrice),
      savings: offer.savings,
      currency: "USD" as const,
      dealId: offer.providerOfferId,
      purchaseUrl: offer.purchaseUrl,
      lastUpdated: offer.lastUpdated,
    }));
    const historicalLow = await fetchHistoricalLow(mapping?.externalId);
    return result(gameSummary, offers, "cache", historicalLow);
  }

  let providerGameId = mapping?.externalId;
  if (!providerGameId) {
    const match = await findCheapSharkGame(storedGame.name);
    if (!match) return result(gameSummary, [], "cheapshark", null);
    providerGameId = match.gameID;
  }

  const { offers, historicalLow } = await getCheapSharkOffers(providerGameId);
  await prisma.gameMapping.upsert({
    where: { gameId_provider: { gameId: storedGame.id, provider: PROVIDER } },
    create: { gameId: storedGame.id, provider: PROVIDER, externalId: providerGameId },
    update: { externalId: providerGameId, updatedAt: new Date() },
  });

  const storedOffers = [] as Array<GameOffer & { databaseStoreId: string }>;
  for (const offer of offers) {
    const store = await prisma.store.upsert({
      where: { provider_externalId: { provider: PROVIDER, externalId: offer.storeId } },
      create: { provider: PROVIDER, externalId: offer.storeId, name: offer.storeName },
      update: { name: offer.storeName, active: true },
    });
    storedOffers.push({ ...offer, databaseStoreId: store.id });
  }

  await prisma.$transaction([
    prisma.offer.deleteMany({ where: { gameId: storedGame.id, provider: PROVIDER } }),
    ...storedOffers.map((offer) => prisma.offer.create({ data: {
      gameId: storedGame.id,
      storeId: offer.databaseStoreId,
      provider: offer.provider,
      providerGameId: offer.providerGameId,
      providerOfferId: offer.dealId,
      price: offer.price,
      regularPrice: offer.regularPrice,
      savings: offer.savings,
      currency: offer.currency,
      purchaseUrl: offer.purchaseUrl,
      lastUpdated: offer.lastUpdated ?? new Date(),
    } })),
  ]);

  return result(gameSummary, offers, "cheapshark", historicalLow);
}

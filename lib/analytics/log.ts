import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import type { AnalyticsEventInput } from "@/lib/analytics/types";

// No-ops silently if there's no DB configured, and never throws on a write
// failure — a lost analytics event should never take down the page that
// triggered it.
export async function logEvent(input: AnalyticsEventInput): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    await prisma.analyticsEvent.create({
      data: {
        type: input.type,
        path: input.path?.slice(0, 512),
        query: input.query?.slice(0, 256),
        gameSlug: input.gameSlug?.slice(0, 256),
        storeName: input.storeName?.slice(0, 128),
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log analytics event", error);
  }
}

// Ranks games by view count in the trailing window — the signal behind the
// homepage's featured carousel. "game_view" (not "search") is used because
// search events only log the query text, not which game (if any) it led to;
// game_view is the one event type that reliably ties back to a specific slug.
export async function getTopViewedGameSlugs(sinceDays = 1, limit = 4): Promise<string[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  const since = new Date(Date.now() - sinceDays * 86_400_000);
  const rows = await prisma.analyticsEvent.groupBy({
    by: ["gameSlug"],
    where: { type: "game_view", gameSlug: { not: null }, createdAt: { gte: since } },
    _count: { gameSlug: true },
    orderBy: { _count: { gameSlug: "desc" } },
    take: limit,
  });

  return rows.map((row) => row.gameSlug).filter((slug): slug is string => Boolean(slug));
}

export type AnalyticsSummary = {
  totalEvents: number;
  byType: Array<{ type: string; count: number }>;
  topSearchQueries: Array<{ query: string; count: number }>;
  topViewedGames: Array<{ gameSlug: string; count: number }>;
  topClickedStores: Array<{ storeName: string; count: number }>;
  recentEvents: Array<{
    id: string;
    type: string;
    path: string | null;
    gameSlug: string | null;
    storeName: string | null;
    createdAt: Date;
  }>;
};

export async function getAnalyticsSummary(sinceDays = 30): Promise<AnalyticsSummary | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const since = new Date(Date.now() - sinceDays * 86_400_000);
  const whereRecent = { createdAt: { gte: since } };

  const [totalEvents, byTypeRaw, topSearchQueriesRaw, topViewedGamesRaw, topClickedStoresRaw, recentEvents] = await Promise.all([
    prisma.analyticsEvent.count({ where: whereRecent }),
    prisma.analyticsEvent.groupBy({ by: ["type"], where: whereRecent, _count: { type: true } }),
    prisma.analyticsEvent.groupBy({
      by: ["query"],
      where: { ...whereRecent, type: "search", query: { not: null } },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["gameSlug"],
      where: { ...whereRecent, type: "game_view", gameSlug: { not: null } },
      _count: { gameSlug: true },
      orderBy: { _count: { gameSlug: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["storeName"],
      where: { ...whereRecent, type: { in: ["deal_click", "offer_click"] }, storeName: { not: null } },
      _count: { storeName: true },
      orderBy: { _count: { storeName: "desc" } },
      take: 10,
    }),
    prisma.analyticsEvent.findMany({
      where: whereRecent,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, type: true, path: true, gameSlug: true, storeName: true, createdAt: true },
    }),
  ]);

  return {
    totalEvents,
    byType: byTypeRaw.map((row) => ({ type: row.type, count: row._count.type })),
    topSearchQueries: topSearchQueriesRaw.map((row) => ({ query: row.query ?? "", count: row._count.query })),
    topViewedGames: topViewedGamesRaw.map((row) => ({ gameSlug: row.gameSlug ?? "", count: row._count.gameSlug })),
    topClickedStores: topClickedStoresRaw.map((row) => ({ storeName: row.storeName ?? "", count: row._count.storeName })),
    recentEvents,
  };
}

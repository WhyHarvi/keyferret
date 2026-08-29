import "server-only";
import { cache } from "react";
import type { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/db";
import { getGameBySlug as getIGDBGameBySlug } from "@/lib/igdb";
import type { Game } from "@/lib/types";

export const getGameBySlug = cache(async (slug: string): Promise<Game | undefined> => {
  const prisma = getPrisma();

  if (prisma) {
    const stored = await prisma.game.findUnique({ where: { slug } });
    if (stored) {
      const metadata = stored.metadata as unknown as Partial<Game>;
      // Records saved before ratingCount was added are refreshed once so we
      // never invent a count or keep omitting a real one indefinitely.
      if (typeof metadata.ratingCount === "number") return metadata as Game;
    }
  }

  const game = await getIGDBGameBySlug(slug);
  if (!game || !prisma) return game;

  const metadata = JSON.parse(JSON.stringify(game)) as Prisma.InputJsonValue;
  const saved = await prisma.game.upsert({
    where: { igdbId: Number(game.id) },
    create: {
      igdbId: Number(game.id),
      name: game.title,
      slug: game.slug,
      coverUrl: game.coverImage,
      releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
      rating: game.rating || null,
      metadata,
    },
    update: {
      name: game.title,
      slug: game.slug,
      coverUrl: game.coverImage,
      releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
      rating: game.rating || null,
      metadata,
    },
  });

  await prisma.gameMapping.upsert({
    where: { provider_externalId: { provider: "IGDB", externalId: game.id } },
    create: { gameId: saved.id, provider: "IGDB", externalId: game.id },
    update: { gameId: saved.id },
  });

  return game;
});

import {
  Compass,
  Crosshair,
  Layers,
  Map as MapIcon,
  Puzzle,
  Rocket,
  Shield,
  Swords,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Game } from "@/lib/types";

// Icon per genre string coming out of the catalog. Unmapped genres (IGDB
// will introduce plenty once it's wired in) fall back to a generic compass.
export const GENRE_ICONS: Record<string, LucideIcon> = {
  RPG: Shield,
  Action: Swords,
  "Open World": MapIcon,
  "Sci-Fi": Rocket,
  Roguelike: Layers,
  Strategy: Puzzle,
  Shooter: Crosshair,
  "Co-op": Users,
  Adventure: Compass,
};
export const DEFAULT_GENRE_ICON = Compass;

export function genreIcon(genre: string): LucideIcon {
  return GENRE_ICONS[genre] ?? DEFAULT_GENRE_ICON;
}

// URL-safe id for a genre, e.g. "Sci-Fi" -> "sci-fi", "Open World" -> "open-world".
export function slugifyGenre(genre: string): string {
  return genre
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type GenreCount = { genre: string; slug: string; count: number };

// Every genre present in the catalog, most-populated first.
export function getGenreCounts(games: Game[]): GenreCount[] {
  const counts = new Map<string, number>();
  for (const game of games) {
    for (const genre of game.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([genre, count]) => ({ genre, slug: slugifyGenre(genre), count }))
    .sort((a, b) => b.count - a.count);
}

// Resolve a URL slug back to its genre name + matching games. Returns
// undefined when nothing in the catalog maps to that slug (route calls
// notFound() in that case).
export function getGamesByGenreSlug(games: Game[], slug: string): { genre: string; games: Game[] } | undefined {
  const match = getGenreCounts(games).find((entry) => entry.slug === slug);
  if (!match) return undefined;
  return { genre: match.genre, games: games.filter((g) => g.genres.includes(match.genre)) };
}

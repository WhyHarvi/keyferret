"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Gamepad2, Tags, X } from "lucide-react";
import GameCard from "@/components/GameCard";
import type { Game } from "@/lib/types";

type BrowseGridProps = { games: Game[]; remoteFiltering?: boolean };

export default function BrowseGrid({ games, remoteFiltering = true }: BrowseGridProps) {
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [remoteGames, setRemoteGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState(false);

  const genres = useMemo(
    () => [...new Set(games.flatMap((game) => game.genres))].sort((a, b) => a.localeCompare(b)),
    [games],
  );
  const platforms = useMemo(
    () => [...new Set(games.flatMap((game) => game.platforms))].sort((a, b) => a.localeCompare(b)),
    [games],
  );
  const hasFilters = Boolean(genre || platform);
  const localFilteredGames = useMemo(
    () => games.filter((game) => (!genre || game.genres.includes(genre)) && (!platform || game.platforms.includes(platform))),
    [games, genre, platform],
  );
  const filteredGames = !hasFilters ? games : remoteFiltering ? remoteGames : localFilteredGames;
  const scrollToCatalogTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  useEffect(() => {
    if (!hasFilters || !remoteFiltering) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (platform) params.set("platform", platform);
    fetch(`/api/games?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Filter request failed");
        return response.json() as Promise<{ games: Game[] }>;
      })
      .then(({ games: matches }) => setRemoteGames(matches))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRemoteGames([]);
        setFilterError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [genre, platform, hasFilters, remoteFiltering]);

  return (
    <>
      <div className="sticky top-20 z-20 mt-6 rounded-2xl border border-border bg-background/95 p-3 shadow-lg shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="relative flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-text-main focus-within:border-accent">
              <Tags size={16} className="shrink-0 text-accent" aria-hidden="true" />
              <span className="sr-only">Filter by genre</span>
              <select
                value={genre}
                onChange={(event) => {
                  setGenre(event.target.value);
                  setLoading(remoteFiltering && Boolean(event.target.value || platform));
                  setFilterError(false);
                  scrollToCatalogTop();
                }}
                className="h-11 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-5 outline-none"
              >
                <option value="">All genres</option>
                {genres.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>

            <label className="relative flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-text-main focus-within:border-accent">
              <Gamepad2 size={16} className="shrink-0 text-accent" aria-hidden="true" />
              <span className="sr-only">Filter by platform</span>
              <select
                value={platform}
                onChange={(event) => {
                  setPlatform(event.target.value);
                  setLoading(remoteFiltering && Boolean(event.target.value || genre));
                  setFilterError(false);
                  scrollToCatalogTop();
                }}
                className="h-11 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pr-5 outline-none"
              >
                <option value="">All platforms</option>
                {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>

          <div className="flex min-h-11 items-center justify-between gap-3 md:justify-end">
            <p className="text-sm text-text-muted" role="status" aria-live="polite">
              {loading ? "Loading games…" : <><span className="font-semibold text-text-main">{filteredGames.length}</span> {filteredGames.length === 1 ? "game" : "games"}</>}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={() => { setGenre(""); setPlatform(""); setLoading(false); setFilterError(false); scrollToCatalogTop(); }}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-medium text-text-main transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <X size={15} aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {hasFilters && filterError ? (
        <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-medium text-text-main">Games could not be loaded.</p>
          <p className="mt-2 text-sm text-text-muted">Clear the filters and try again.</p>
        </div>
      ) : filteredGames.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game) => (
              <motion.div key={game.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <GameCard game={game} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-medium text-text-main">No games match these filters.</p>
          <button type="button" onClick={() => { setGenre(""); setPlatform(""); setLoading(false); setFilterError(false); scrollToCatalogTop(); }} className="mt-3 min-h-11 cursor-pointer text-sm font-semibold text-accent hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}

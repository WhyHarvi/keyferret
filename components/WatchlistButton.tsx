"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { subscribeToWatchlist, toggleWatchlist, watchlistSnapshot } from "@/lib/watchlist";
import type { Game } from "@/lib/types";

export default function WatchlistButton({ game }: { game: Game }) {
  const snapshot = useSyncExternalStore(subscribeToWatchlist, watchlistSnapshot, () => "[]");
  const saved = JSON.parse(snapshot).some((item: Game) => item.id === game.id);

  return (
    <button
      type="button"
      onClick={() => toggleWatchlist(game)}
      aria-pressed={saved}
      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-main transition-all duration-150 hover:border-accent active:scale-[0.97] aria-pressed:border-accent aria-pressed:bg-accent/10"
    >
      <Heart
        size={17}
        className={`transition-transform duration-200 ${saved ? "scale-110 fill-accent text-accent" : "text-text-muted"}`}
        aria-hidden="true"
      />
      {saved ? "Saved to watchlist" : "Add to watchlist"}
    </button>
  );
}

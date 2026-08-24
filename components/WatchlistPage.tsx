"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import BrowseGrid from "@/components/BrowseGrid";
import Footer from "@/components/Footer";
import { subscribeToWatchlist, watchlistSnapshot } from "@/lib/watchlist";
import type { Game } from "@/lib/types";

export default function WatchlistPage() {
  const snapshot = useSyncExternalStore(subscribeToWatchlist, watchlistSnapshot, () => "[]");
  const games = useMemo(() => JSON.parse(snapshot) as Game[], [snapshot]);

  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 pb-16 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-accent"><Heart size={20} aria-hidden="true" /></span>
            <div><p className="text-sm text-text-muted">Your library</p><h1 className="mt-1 text-3xl font-semibold text-text-main">Watchlist</h1></div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-text-muted">Games saved on this device for quick access later.</p>
          {games.length > 0 ? <BrowseGrid games={games} remoteFiltering={false} /> : (
            <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="font-semibold text-text-main">Your watchlist is empty.</p>
              <p className="mt-2 text-sm text-text-muted">Open a game and select “Add to watchlist.”</p>
              <Link href="/games" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-white">Browse games</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

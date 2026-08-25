"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, BellRing, Star, X } from "lucide-react";
import Link from "next/link";
import LiveCardPrice from "@/components/LiveCardPrice";
import PriceAlertForm from "@/components/PriceAlertForm";
import { hasRequestedAlert, subscribeToAlertRequests } from "@/lib/alerts-client";
import type { Game } from "@/lib/types";

type WatchlistCardProps = {
  game: Game;
  addedLabel: string;
};

export default function WatchlistCard({ game, addedLabel }: WatchlistCardProps) {
  const [open, setOpen] = useState(false);
  const requested = useSyncExternalStore(subscribeToAlertRequests, () => hasRequestedAlert(game.slug), () => false);
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : null;

  return (
    <div data-scroll-item className="group relative w-[140px] shrink-0 snap-start sm:w-[160px] md:w-[180px]">
      <Link href={`/game/${game.slug}`} scroll className="block">
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-300 hover:border-accent/40">
          <div
            className="relative aspect-[2/3] overflow-hidden"
            style={
              !game.coverImage
                ? { background: `linear-gradient(135deg, ${game.coverGradient[0]}, ${game.coverGradient[1]})` }
                : undefined
            }
          >
            {game.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element -- external, dynamic cover URLs
              <img
                src={game.coverImage}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}

            <span className="absolute bottom-2 right-2 z-10"><LiveCardPrice slug={game.slug} /></span>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
              <h3 className="truncate text-sm font-semibold text-white">{game.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs">
                {year && <span className="text-white/60">{year}</span>}
                {game.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Star size={11} className="fill-amber-400" aria-hidden="true" />
                    {game.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                <span className="truncate text-[10px] text-white/50">{addedLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Sibling of the Link, not nested inside it — the modal it opens needs
          a real form, which can't validly live inside an <a>. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={requested ? "Price alert requested" : "Get a price-drop alert"}
        aria-pressed={requested}
        className={`absolute left-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-md backdrop-blur-sm transition-colors ${
          requested ? "bg-accent text-white" : "bg-black/60 text-white/70 hover:text-white"
        }`}
      >
        {requested ? <BellRing size={12} aria-hidden="true" /> : <Bell size={12} aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-main">Get a price alert</p>
                  <p className="mt-1 text-xs text-text-muted">We&apos;ll email you when {game.title} drops below its current price.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="shrink-0 cursor-pointer text-text-muted transition-colors hover:text-text-main"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-4">
                <PriceAlertForm gameSlug={game.slug} gameName={game.title} onSuccess={() => setOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

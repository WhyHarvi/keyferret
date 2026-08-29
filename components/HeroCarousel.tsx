"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Flame, Star, TrendingUp } from "lucide-react";
import type { FeaturedGame } from "@/lib/featured-games";

type HeroCarouselProps = {
  games: FeaturedGame[];
};

const AUTO_ADVANCE_MS = 6000;

// Fixed to en-US deliberately: this renders server-side (unlike the per-game
// price panel, which only shows a price after a client fetch resolves), so
// an Intl.NumberFormat(undefined, ...) locale here would format one way on
// the server and possibly another in the browser — a hydration mismatch,
// the same bug already hit and fixed once in DealListingCard.
function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export default function HeroCarousel({ games }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || games.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % games.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [paused, games.length]);

  if (games.length === 0) return null;

  const featured = games[index];
  const { game, bestPrice, regularPrice, discountPercent, currency, storeName, source } = featured;
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : null;

  return (
    <section
      id="hero"
      aria-labelledby="home-hero-title"
      className="relative h-[88vh] max-h-[780px] min-h-[620px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={game.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.6, ease: "easeInOut" }, scale: { duration: AUTO_ADVANCE_MS / 1000, ease: "linear" } }}
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${game.coverGradient[0]}, ${game.coverGradient[1]})` }}
        >
          {game.backdropImage && (
            // eslint-disable-next-line @next/next/no-img-element -- external, dynamic IGDB artwork
            <img src={game.backdropImage} alt="" className="h-full w-full object-cover object-center" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legibility gradient — matches the fixed, blurred navbar sitting on top */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />

      <div className="relative flex h-full flex-col justify-end px-6 pb-16 sm:px-10 sm:pb-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-7 max-w-3xl">
            <h1 id="home-hero-title" className="font-display text-4xl font-extrabold tracking-[-0.035em] text-text-main sm:text-5xl lg:text-6xl">
              Compare Game Prices. Find the Cheapest Deal.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              Compare PC game prices across multiple stores and find today&apos;s cheapest available deals.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex flex-wrap items-center gap-2">
                {source === "trending" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-text-main backdrop-blur-md">
                    <TrendingUp size={13} className="text-accent" aria-hidden="true" />
                    Trending among players
                  </span>
                )}
                {discountPercent !== null && discountPercent > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-accent to-accent-2 px-3 py-1 text-xs font-bold text-white shadow-[0_4px_20px_-4px_rgba(236,19,19,0.6)]">
                    <Flame size={13} aria-hidden="true" />
                    {discountPercent}% off right now
                  </span>
                )}
              </div>

              <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-[-0.02em] text-text-main sm:text-4xl">
                {game.title}
              </h2>

              <p className="mt-4 line-clamp-2 max-w-xl text-base leading-7 text-text-muted sm:text-lg">
                {game.tagline ?? game.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                {game.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                    {game.rating.toFixed(1)}
                  </span>
                )}
                {year && <span>{year}</span>}
                {game.platforms.length > 0 && <span className="truncate">{game.platforms.join(" · ")}</span>}
              </div>

              {bestPrice !== null && (
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="text-3xl font-bold tabular-nums text-text-main sm:text-4xl">
                    {formatPrice(bestPrice, currency)}
                  </span>
                  {regularPrice !== null && regularPrice > bestPrice && (
                    <span className="text-base tabular-nums text-text-muted line-through">
                      {formatPrice(regularPrice, currency)}
                    </span>
                  )}
                  {storeName && <span className="text-sm text-text-muted">at {storeName}</span>}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/game/${game.slug}`}
                  scroll
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-2 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {bestPrice !== null ? `Get this deal — ${formatPrice(bestPrice, currency)}` : "View game"}
                </Link>
                <Link
                  href="#browse"
                  className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-text-main backdrop-blur-md transition-colors hover:bg-white/10"
                >
                  Browse all games
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {games.length > 1 && (
            <div className="mt-9 flex items-center gap-2">
              {games.map((featuredGame, i) => (
                <button
                  key={featuredGame.game.id}
                  type="button"
                  aria-label={`Show featured deal ${i + 1}: ${featuredGame.game.title}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-7 bg-gradient-to-r from-accent to-accent-2" : "w-3 bg-white/25 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

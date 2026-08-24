"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Star } from "lucide-react";
import { bestPrice, discountPercent, type Game } from "@/lib/types";

type HeroCarouselProps = {
  games: Game[];
};

const AUTO_ADVANCE_MS = 6000;

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

  const game = games[index];
  const price = game.prices.length > 0 ? bestPrice(game.prices) : null;
  const discount = price ? discountPercent(price) : null;
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : null;

  return (
    <section
      id="hero"
      aria-label="Featured games"
      className="relative h-[78vh] max-h-[680px] min-h-[460px] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={game.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
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
          <AnimatePresence mode="wait">
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {discount !== null && (
                <span className="mb-3 inline-flex items-center rounded-full bg-gradient-to-br from-accent to-accent-2 px-3 py-1 text-xs font-semibold text-white">
                  {discount}% off right now
                </span>
              )}

              <h1 className="max-w-2xl font-display text-4xl font-extrabold tracking-[-0.02em] text-text-main sm:text-6xl">
                {game.title}
              </h1>

              <p className="mt-4 line-clamp-2 max-w-xl text-base leading-7 text-text-muted sm:text-lg">
                {game.tagline ?? game.description}
              </p>

              <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
                {game.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                    {game.rating.toFixed(1)}
                  </span>
                )}
                {year && <span>{year}</span>}
                {game.platforms.length > 0 && <span className="truncate">{game.platforms.join(" · ")}</span>}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={`/game/${game.slug}`}
                  scroll
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-2 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {price ? `Get this deal — $${price.price.toFixed(2)}` : "View game"}
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
              {games.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  aria-label={`Show featured deal ${i + 1}: ${g.title}`}
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

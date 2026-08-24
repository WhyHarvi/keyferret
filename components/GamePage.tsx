"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Check, ChevronLeft, Gamepad2, Link2, Star, Tags } from "lucide-react";
import ScrollRow from "@/components/ScrollRow";
import DealCard from "@/components/DealCard";
import Footer from "@/components/Footer";
import GameMedia from "@/components/GameMedia";
import GameFacts from "@/components/GameFacts";
import WatchlistButton from "@/components/WatchlistButton";
import LivePriceCompare from "@/components/LivePriceCompare";
import StickyPriceBar from "@/components/StickyPriceBar";
import { genreIcon, slugifyGenre } from "@/lib/genres";
import type { Game } from "@/lib/types";

type GamePageProps = {
  game: Game;
  relatedGames: Game[];
};

// Shared shell for every /game/[slug] route: hero with the floating cover
// art, the overview, the full price comparison, and a "you might also like"
// row. The route just resolves a slug to a Game and hands it here — this
// component owns everything about what a game page looks like.
export default function GamePage({ game, relatedGames }: GamePageProps) {
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : null;
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied by the browser — the button just no-ops.
    }
  };

  const sectionReveal = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <div className="min-h-screen bg-background">
      <StickyPriceBar game={game} />
      <main>
        {/* Hero — backdrop wash + floating cover art, same gradient language as the homepage hero */}
        <section className="relative border-b border-border">
          <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-[420px]">
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${game.coverGradient[0]}, ${game.coverGradient[1]})` }}
            />
            {game.backdropImage && (
              // eslint-disable-next-line @next/next/no-img-element -- external, dynamic IGDB artwork
              <img
                src={game.backdropImage}
                alt=""
                className="absolute inset-0 h-full w-full scale-[1.02] object-cover object-center"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-transparent" />
          </div>

          <div className="px-6 sm:px-10">
            <div className="mx-auto max-w-7xl">
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-main"
              >
                <ChevronLeft size={15} aria-hidden="true" />
                All games
              </Link>

              <div className="relative -mt-24 flex flex-col gap-6 pb-8 sm:-mt-36 sm:flex-row sm:items-end sm:gap-8">
                <div
                  className="relative aspect-[2/3] w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/60 sm:w-44 md:w-52"
                  style={
                    !game.coverImage
                      ? { background: `linear-gradient(135deg, ${game.coverGradient[0]}, ${game.coverGradient[1]})` }
                      : undefined
                  }
                >
                  {game.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element -- external, dynamic cover URLs
                    <img src={game.coverImage} alt="" className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="flex-1 pb-1">
                  <h1 className="font-display text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl md:text-5xl">
                    {game.title}
                  </h1>
                  {game.tagline && (
                    <p className="mt-2 italic text-text-muted">&ldquo;{game.tagline}&rdquo;</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    {game.rating > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-text-muted">
                        <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="font-semibold text-text-main">{game.rating.toFixed(1)}</span>
                      </span>
                    )}
                    {year && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-text-muted">
                        <Calendar size={14} aria-hidden="true" />
                        {year}
                      </span>
                    )}
                  </div>

                  {game.genres.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {game.genres.map((genre) => {
                        const GenreIcon = genreIcon(genre);
                        return (
                          <Link
                            key={genre}
                            href={`/genre/${slugifyGenre(genre)}`}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-text-main"
                          >
                            <GenreIcon size={12} className="text-text-muted transition-colors group-hover:text-accent" aria-hidden="true" />
                            {genre}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {game.platforms.length > 0 && (
                    <div className="mt-6 max-w-3xl rounded-xl border border-white/15 bg-background/85 p-4 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
                        <Gamepad2 size={18} className="text-accent" aria-hidden="true" />
                        Available on {game.platforms.length} {game.platforms.length === 1 ? "platform" : "platforms"}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2" aria-label="Available platforms">
                        {game.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-text-main"
                          >
                            <Check size={14} className="text-accent" aria-hidden="true" />
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <WatchlistButton game={game} />
                    <button
                      type="button"
                      onClick={copyLink}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-main transition-colors hover:border-accent active:scale-[0.97]"
                    >
                      {copied ? (
                        <Check size={17} className="text-accent" aria-hidden="true" />
                      ) : (
                        <Link2 size={17} className="text-text-muted" aria-hidden="true" />
                      )}
                      {copied ? "Link copied" : "Share"}
                    </button>
                  </div>
                  <div id="hero-cta-sentinel" />

                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="px-6 py-12 sm:px-10 sm:py-16">
          <div className="mx-auto flex max-w-7xl flex-col gap-14 sm:gap-16">
            {/* Overview */}
            <motion.section
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionReveal}
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                <div>
                  <p className="text-sm font-medium text-text-muted">Overview</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-text-main">About this game</h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-text-main/85">{game.description}</p>
                </div>
                <aside className="rounded-2xl border border-border border-l-2 border-l-accent bg-surface p-5" aria-label="Game details">
                  <h2 className="text-sm font-semibold text-text-main">Game details</h2>
                  <dl className="mt-4 grid gap-4 text-sm">
                    {year && <div><dt className="flex items-center gap-2 text-text-muted"><Calendar size={15} aria-hidden="true" />Released</dt><dd className="mt-1 font-medium text-text-main">{year}</dd></div>}
                    {game.rating > 0 && <div><dt className="flex items-center gap-2 text-text-muted"><Star size={15} aria-hidden="true" />IGDB rating</dt><dd className="mt-1 font-medium text-text-main">{game.rating.toFixed(1)} out of 5</dd></div>}
                    {game.genres.length > 0 && <div><dt className="flex items-center gap-2 text-text-muted"><Tags size={15} aria-hidden="true" />Genres</dt><dd className="mt-1 leading-6 text-text-main">{game.genres.join(", ")}</dd></div>}
                  </dl>
                </aside>
              </div>
            </motion.section>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionReveal}
            >
              <LivePriceCompare slug={game.slug} />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionReveal}
            >
              <GameFacts game={game} />
            </motion.div>

            <GameMedia game={game} />
          </div>
        </div>

        {relatedGames.length > 0 && (
          <div className="px-6 pb-16 sm:px-10">
            <div className="mx-auto max-w-7xl">
              <ScrollRow
                ariaLabel="You might also like"
                eyebrow="You might also like"
                title="More games worth a look"
              >
                {relatedGames.map((related) => (
                  <DealCard key={related.id} game={related} />
                ))}
              </ScrollRow>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

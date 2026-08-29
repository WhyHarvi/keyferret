"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { gsap } from "gsap";
import { ArrowUpRight, BadgePercent, Bell, BellRing, Calendar, Check, ChevronLeft, Clock3, Gamepad2, Link2, Star, Store, Tags } from "lucide-react";
import ScrollRow from "@/components/ScrollRow";
import DealCard from "@/components/DealCard";
import Footer from "@/components/Footer";
import GameMedia from "@/components/GameMedia";
import GameFacts from "@/components/GameFacts";
import WatchlistButton from "@/components/WatchlistButton";
import PriceAlertForm from "@/components/PriceAlertForm";
import LivePriceCompare from "@/components/LivePriceCompare";
import StickyPriceBar from "@/components/StickyPriceBar";
import AdSlot from "@/components/AdSlot";
import { genreIcon, slugifyGenre } from "@/lib/genres";
import { trackEvent } from "@/lib/analytics-client";
import { hasRequestedAlert, subscribeToAlertRequests } from "@/lib/alerts-client";
import { formatPrice } from "@/lib/pricing-client";
import type { Game } from "@/lib/types";
import styles from "./GamePage.module.css";

type GamePageProps = {
  game: Game;
  relatedGames: Game[];
  heroPricing: {
    bestPrice: number;
    currency: string;
    storeCount: number;
    storeName: string;
    purchaseUrl: string;
    savings: number;
    freshnessLabel: string;
  } | null;
};

function visibleGameAccents([first, second]: Game["coverGradient"]): [string, string] {
  const saturation = (hex: string) => {
    const value = hex.replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(value)) return 0;
    const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
    return Math.max(...channels) - Math.min(...channels);
  };

  return saturation(first) + saturation(second) >= 48 ? [first, second] : ["#ec1313", "#f45925"];
}

// Shared shell for every /game/[slug] route: hero with the floating cover
// art, the overview, the full price comparison, and a "you might also like"
// row. The route just resolves a slug to a Game and hands it here — this
// component owns everything about what a game page looks like.
export default function GamePage({ game, relatedGames, heroPricing }: GamePageProps) {
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : null;
  const [accentA, accentB] = visibleGameAccents(game.coverGradient);
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const backdropY = useTransform(heroScrollProgress, [0, 1], [0, prefersReducedMotion ? 0 : 48]);
  const coverY = useTransform(heroScrollProgress, [0, 1], [0, prefersReducedMotion ? 0 : -20]);
  const alertRequested = useSyncExternalStore(subscribeToAlertRequests, () => hasRequestedAlert(game.slug), () => false);

  useEffect(() => {
    trackEvent({ type: "game_view", gameSlug: game.slug, path: `/game/${game.slug}` });
  }, [game.slug]);

  useLayoutEffect(() => {
    if (!pageRef.current || prefersReducedMotion) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo("[data-hero-backdrop]", { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.9 })
        .fromTo("[data-hero-cover]", { opacity: 0, y: 28, rotate: -1.5 }, { opacity: 1, y: 0, rotate: 0, duration: 0.65 }, "-=0.55")
        .fromTo("[data-hero-reveal]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, "-=0.42");
    }, pageRef);

    return () => context.revert();
  }, [game.slug, prefersReducedMotion]);

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
    <div
      ref={pageRef}
      className={`${styles.gamePage} min-h-screen`}
      style={{
        "--game-accent-a": accentA,
        "--game-accent-b": accentB,
      } as CSSProperties}
    >
      <StickyPriceBar game={game} />
      <main>
        {/* Hero — backdrop wash + floating cover art, same gradient language as the homepage hero */}
        <section ref={heroRef} className="relative border-b border-border">
          <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-[420px]">
            <div data-hero-backdrop className="absolute -inset-y-12 inset-x-0">
              <motion.div className="absolute inset-0" style={{ y: backdropY }}>
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
              </motion.div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-transparent" />
            <div className={styles.heroGrid} aria-hidden="true" />
            <div className={styles.heroVignette} aria-hidden="true" />
          </div>

          <div className="px-6 sm:px-10">
            <div className="mx-auto max-w-7xl">
              <Link
                href="/"
                data-hero-reveal
                className="mt-4 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-main"
              >
                <ChevronLeft size={15} aria-hidden="true" />
                All games
              </Link>

              <div className="relative -mt-24 flex flex-col gap-6 pb-8 sm:-mt-36 sm:flex-row sm:items-end sm:gap-8">
                <div data-hero-cover className={`${styles.coverStage} w-32 shrink-0 sm:w-44 md:w-52`}>
                  <motion.div
                    className={`${styles.gameCase} relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/60`}
                    style={{
                      y: coverY,
                      ...(!game.coverImage
                        ? { background: `linear-gradient(135deg, ${game.coverGradient[0]}, ${game.coverGradient[1]})` }
                      : {}),
                    }}
                    whileHover={prefersReducedMotion ? undefined : { rotateY: -4, rotateX: 2, scale: 1.025 }}
                    transition={{ type: "spring", stiffness: 240, damping: 22 }}
                  >
                    {game.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element -- external, dynamic cover URLs
                      <img src={game.coverImage} alt="" className="h-full w-full object-cover" />
                    )}
                  </motion.div>
                </div>

                <div className="flex-1 pb-1">
                  <h1 data-hero-reveal className={`${styles.gameTitle} font-display text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl md:text-5xl`}>
                    {game.title}
                  </h1>
                  {game.tagline && (
                    <p data-hero-reveal className="mt-2 italic text-text-muted">&ldquo;{game.tagline}&rdquo;</p>
                  )}

                  <div data-hero-reveal className={`${styles.statRail} mt-4 flex flex-wrap items-center gap-2 text-sm`}>
                    {game.rating > 0 && (
                      <span className={`${styles.hudChip} inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-text-muted`} aria-label={`IGDB user rating ${game.rating.toFixed(1)} out of 5${game.ratingCount > 0 ? ` from ${game.ratingCount.toLocaleString()} ratings` : ""}`}>
                        <Star size={14} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        <span className="font-semibold text-text-main">IGDB {game.rating.toFixed(1)}</span>
                      </span>
                    )}
                    {year && (
                      <span className={`${styles.hudChip} inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-text-muted`}>
                        <Calendar size={14} aria-hidden="true" />
                        {year}
                      </span>
                    )}
                  </div>

                  {game.genres.length > 0 && (
                    <div data-hero-reveal className="mt-3 flex flex-wrap gap-2">
                      {game.genres.map((genre) => {
                        const GenreIcon = genreIcon(genre);
                        return (
                          <Link
                            key={genre}
                            href={`/genre/${slugifyGenre(genre)}`}
                            className={`${styles.genreChip} group inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-text-main`}
                          >
                            <GenreIcon size={12} className="text-text-muted transition-colors group-hover:text-accent" aria-hidden="true" />
                            {genre}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {heroPricing && (
                    <div data-hero-reveal className={styles.heroPriceCard} aria-label="Best current price">
                      <div className={styles.heroPriceMain}>
                        <div>
                          <p className={styles.heroPriceLabel}>Best current price</p>
                          <p className={styles.heroPriceValue}>{formatPrice(heroPricing.bestPrice, heroPricing.currency)}</p>
                          <p className="mt-1 text-sm text-text-muted">
                            at <span className="font-semibold text-text-main">{heroPricing.storeName}</span>
                          </p>
                        </div>
                        <div className={styles.heroPriceStats}>
                          {heroPricing.savings > 0 && (
                            <span><BadgePercent size={16} aria-hidden="true" />Save {heroPricing.savings}%</span>
                          )}
                          <span><Store size={16} aria-hidden="true" />Compare {heroPricing.storeCount} {heroPricing.storeCount === 1 ? "store" : "stores"}</span>
                        </div>
                      </div>
                      <div className={styles.heroPriceFooter}>
                        <p><Clock3 size={14} aria-hidden="true" />{heroPricing.freshnessLabel}</p>
                        <a
                          href={heroPricing.purchaseUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          onClick={() => trackEvent({ type: "offer_click", gameSlug: game.slug, storeName: heroPricing.storeName, metadata: { price: heroPricing.bestPrice, placement: "hero" } })}
                          className={styles.bestDealButton}
                        >
                          View best deal
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  )}

                  {game.platforms.length > 0 && (
                    <div data-hero-reveal className={`${styles.platformDeck} mt-6 max-w-3xl rounded-xl border border-white/15 p-4 backdrop-blur-md`}>
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

                  <div data-hero-reveal className="mt-6 flex flex-wrap items-center gap-3">
                    <WatchlistButton game={game} />
                    <button
                      type="button"
                      onClick={copyLink}
                      className={`${styles.secondaryAction} inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-main transition-colors hover:border-accent active:scale-[0.97]`}
                    >
                      {copied ? (
                        <Check size={17} className="text-accent" aria-hidden="true" />
                      ) : (
                        <Link2 size={17} className="text-text-muted" aria-hidden="true" />
                      )}
                      {copied ? "Link copied" : "Share"}
                    </button>
                    {!alertRequested && (
                      <button
                        type="button"
                        onClick={() => setShowAlertForm((v) => !v)}
                        aria-pressed={showAlertForm}
                        className={`${styles.secondaryAction} inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-main transition-colors hover:border-accent active:scale-[0.97]`}
                      >
                        <Bell size={17} className="text-text-muted" aria-hidden="true" />
                        Email me price drops
                      </button>
                    )}
                    {alertRequested && (
                      <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 text-sm font-semibold text-accent">
                        <BellRing size={17} aria-hidden="true" />
                        Alert requested
                      </span>
                    )}
                  </div>
                  {showAlertForm && !alertRequested && (
                    <div className="mt-3 max-w-md">
                      <PriceAlertForm gameSlug={game.slug} gameName={game.title} onSuccess={() => setShowAlertForm(false)} />
                    </div>
                  )}
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
                <aside className={`${styles.detailsPanel} rounded-2xl border border-border border-l-2 border-l-accent p-5`} aria-label="Game details">
                  <h2 className="text-sm font-semibold text-text-main">Game details</h2>
                  <dl className="mt-4 grid gap-4 text-sm">
                    {year && <div><dt className="flex items-center gap-2 text-text-muted"><Calendar size={15} aria-hidden="true" />Released</dt><dd className="mt-1 font-medium text-text-main">{year}</dd></div>}
                    {game.rating > 0 && <div><dt className="flex items-center gap-2 text-text-muted"><Star size={15} aria-hidden="true" />IGDB user rating</dt><dd className="mt-1 font-medium text-text-main">{game.rating.toFixed(1)} out of 5{game.ratingCount > 0 ? ` from ${game.ratingCount.toLocaleString()} ratings` : ""}</dd></div>}
                    {game.genres.length > 0 && <div><dt className="flex items-center gap-2 text-text-muted"><Tags size={15} aria-hidden="true" />Genres</dt><dd className="mt-1 leading-6 text-text-main">{game.genres.join(", ")}</dd></div>}
                  </dl>
                </aside>
              </div>
            </motion.section>

            <motion.div
              className={styles.commandPanel}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionReveal}
            >
              <LivePriceCompare slug={game.slug} />
            </motion.div>

            {/* Keep ads in normal document flow and outside transformed/revealed
                containers so Google can size and measure the unit reliably. */}
            <AdSlot format="banner" slotId="0000000003" />

            <motion.div
              className={`${styles.commandPanel} ${styles.factsPanel}`}
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
          <div className="px-6 pb-16 pt-8 sm:px-10">
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

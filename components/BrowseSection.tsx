"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Layers, type LucideIcon } from "lucide-react";
import BrowseGrid from "@/components/BrowseGrid";
import { genreIcon, getGenreCounts } from "@/lib/genres";
import type { Game } from "@/lib/types";

type BrowseSectionProps = {
  games: Game[];
};

const MotionLink = motion.create(Link);

const tileContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const tileItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
};

// Genre tiles are entry points, not filters — clicking one navigates to a
// dedicated /genre/[genre] listing page (mirroring the inspiration site's
// genre-browse pattern) instead of filtering this grid in place. The grid
// below always shows the full catalog.
export default function BrowseSection({ games }: BrowseSectionProps) {
  const genreCounts = useMemo(() => getGenreCounts(games), [games]);

  return (
    <section id="browse" className="scroll-mt-24 pt-28">
      <p className="text-sm font-medium text-text-muted">Browse</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-main">Explore games and compare prices across multiple stores.</h2>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={tileContainer}
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <GenreTile href="/games" label="All genres" count={games.length} icon={Layers} />
        {genreCounts.map(({ genre, slug, count }) => (
          <GenreTile key={genre} href={`/genre/${slug}`} label={genre} count={count} icon={genreIcon(genre)} />
        ))}
      </motion.div>

      <BrowseGrid games={games} />
    </section>
  );
}

type GenreTileProps = {
  href: string;
  label: string;
  count: number;
  icon: LucideIcon;
};

function GenreTile({ href, label, count, icon: Icon }: GenreTileProps) {
  return (
    <MotionLink
      href={href}
      variants={tileItem}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group relative block rounded-lg border border-border bg-surface p-4 text-left transition-colors duration-200 hover:border-accent/30 hover:bg-surface-2"
    >
      <Icon size={22} className="text-text-muted transition-colors group-hover:text-text-main" aria-hidden="true" />
      <span className="mt-3 block text-sm font-semibold text-text-main">{label}</span>
      <span className="mt-0.5 block text-xs text-text-muted transition-colors group-hover:text-accent">
        {count} {count === 1 ? "game" : "games"}
      </span>
    </MotionLink>
  );
}

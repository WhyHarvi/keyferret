"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Star } from "lucide-react";
import LiveCardPrice from "@/components/LiveCardPrice";
import type { Game } from "@/lib/types";

type GameCardProps = {
  game: Game;
};

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/game/${game.slug}`} scroll className="block">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="group overflow-hidden rounded-2xl border border-border bg-surface"
      >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
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
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />

        {game.rating > 0 && (
          <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
            {game.rating.toFixed(1)}
          </span>
        )}

        <span className="absolute bottom-2.5 right-2.5"><LiveCardPrice slug={game.slug} /></span>
      </div>

      <div className="p-3.5">
        <h3 className="truncate text-sm font-semibold text-text-main">{game.title}</h3>
        <p className="mt-0.5 truncate text-xs text-text-muted">
          {game.genres.length > 0 ? game.genres.join(" · ") : game.platforms.join(" · ")}
        </p>

      </div>
      </motion.div>
    </Link>
  );
}

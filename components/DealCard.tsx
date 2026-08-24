"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import LiveCardPrice from "@/components/LiveCardPrice";
import type { Game } from "@/lib/types";

type DealCardProps = {
  game: Game;
};

export default function DealCard({ game }: DealCardProps) {
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : null;

  return (
    <Link href={`/game/${game.slug}`} scroll data-scroll-item className="group block w-[140px] shrink-0 snap-start sm:w-[160px] md:w-[180px]">
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
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics-client";
import type { Game } from "@/lib/types";

type SearchBarProps = {
  onClose: () => void;
  className?: string;
};

export default function SearchBar({ onClose, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setLoading(true);
      setError(false);
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Search failed");
          return res.json() as Promise<{ games: Game[]; source: string }>;
        })
        .then((data: { games: Game[]; source: string }) => {
          const games = Array.isArray(data.games) ? data.games : [];
          setResults(games);
          setLoading(false);
          if (query.trim()) trackEvent({ type: "search", query: query.trim(), metadata: { resultCount: games.length } });
        })
        .catch((requestError: unknown) => {
          if (requestError instanceof DOMException && requestError.name === "AbortError") return;
          setResults([]);
          setError(true);
          setLoading(false);
        });
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <Search size={17} className="shrink-0 text-text-muted" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any game"
          aria-label="Search any game"
          className="min-w-0 flex-1 bg-transparent text-sm text-text-main outline-none placeholder:text-text-muted"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/10 hover:text-text-main"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute left-0 top-[calc(100%+8px)] z-50 w-full max-w-sm rounded-2xl border border-white/10 bg-surface/95 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl"
      >
        <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-text-muted">
          {query.trim() ? `Results for "${query.trim()}"` : "Trending now"}
        </p>

        {loading ? (
          <p className="px-3 py-8 text-center text-sm text-text-muted">Searching IGDB…</p>
        ) : error ? (
          <p className="px-3 py-8 text-center text-sm text-text-muted">Search is unavailable right now.</p>
        ) : results.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-text-muted">No games found.</p>
        ) : (
          // Narrow, single-column panel with a few rows visible and the
          // rest scrollable — the dropdown used to span the full search bar
          // width as a 2-column grid and stretch to fit every result at
          // once, up to 5 rows for the trending list.
          <ul className="grid max-h-80 grid-cols-1 gap-0.5 overflow-y-auto">
            {results.map((game) => {
              return (
                <li key={game.id}>
                  <Link
                    href={`/game/${game.slug}`}
                    scroll
                    onClick={onClose}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5"
                  >
                    {game.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element -- external, dynamic IGDB URLs
                      <img
                        src={game.coverImage}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span
                        className="h-11 w-11 shrink-0 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${game.coverGradient[0]}, ${game.coverGradient[1]})`,
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-main">{game.title}</span>
                      <span className="block truncate text-xs text-text-muted">
                        {game.genres.length > 0 ? game.genres.join(" · ") : "—"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent">
                      Check price
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

      </motion.div>
    </div>
  );
}

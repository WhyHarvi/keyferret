import type { Game } from "@/lib/types";

export const WATCHLIST_KEY = "keyferret-watchlist";
export const WATCHLIST_EVENT = "keyferret-watchlist-change";

export function readWatchlist(): Game[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(WATCHLIST_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function watchlistSnapshot(): string {
  return typeof window === "undefined" ? "[]" : window.localStorage.getItem(WATCHLIST_KEY) ?? "[]";
}

export function subscribeToWatchlist(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === WATCHLIST_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(WATCHLIST_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(WATCHLIST_EVENT, callback);
  };
}

export function toggleWatchlist(game: Game): void {
  const current = readWatchlist();
  const next = current.some((item) => item.id === game.id)
    ? current.filter((item) => item.id !== game.id)
    : [game, ...current];
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(WATCHLIST_EVENT));
}

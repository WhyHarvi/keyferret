// UI-only hint that an alert was requested for a game — with no accounts,
// there's nothing server-side to check on page load, so this is purely what
// keeps the bell from resetting to "untracked" after a reload. The database
// row (created via POST /api/alerts) is the actual source of truth.

const ALERTS_KEY = "keyferret-price-alerts";
const ALERTS_EVENT = "keyferret-price-alerts-change";

function readRequestedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(ALERTS_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function alertsSnapshot(): string {
  return typeof window === "undefined" ? "[]" : window.localStorage.getItem(ALERTS_KEY) ?? "[]";
}

export function subscribeToAlertRequests(callback: () => void): () => void {
  window.addEventListener(ALERTS_EVENT, callback);
  return () => window.removeEventListener(ALERTS_EVENT, callback);
}

export function hasRequestedAlert(gameSlug: string): boolean {
  return readRequestedSlugs().includes(gameSlug);
}

export function markAlertRequested(gameSlug: string): void {
  const current = readRequestedSlugs();
  if (current.includes(gameSlug)) return;
  window.localStorage.setItem(ALERTS_KEY, JSON.stringify([...current, gameSlug]));
  window.dispatchEvent(new Event(ALERTS_EVENT));
}

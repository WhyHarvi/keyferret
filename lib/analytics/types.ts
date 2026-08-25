// Shared shape between the browser tracker (lib/analytics-client.ts) and the
// server-side logger/ingestion route — no "server-only" here so both can
// import it.

export type AnalyticsEventType = "search" | "game_view" | "deal_click" | "offer_click";

export const ANALYTICS_EVENT_TYPES: AnalyticsEventType[] = ["search", "game_view", "deal_click", "offer_click"];

export type AnalyticsEventInput = {
  type: AnalyticsEventType;
  path?: string;
  query?: string;
  gameSlug?: string;
  storeName?: string;
  metadata?: Record<string, unknown>;
};

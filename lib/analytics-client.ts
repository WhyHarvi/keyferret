"use client";

import type { AnalyticsEventInput } from "@/lib/analytics/types";

// Fire-and-forget telemetry beacon. sendBeacon is what actually matters here:
// offer_click/deal_click fire right as the tab navigates away to a third-party
// store, and sendBeacon is the one browser primitive guaranteed to survive
// that — a plain fetch can get cancelled mid-flight by the navigation.
export function trackEvent(input: AnalyticsEventInput): void {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify(input);
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
      if (sent) return;
    }
    fetch("/api/analytics", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
  } catch {
    // Telemetry is best-effort — never let a tracking failure surface to the user.
  }
}

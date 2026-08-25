"use client";

// Renders the real AdSense unit once NEXT_PUBLIC_ADSENSE_CLIENT_ID is set
// (the loader script itself is added conditionally in app/layout.tsx);
// otherwise renders the placeholder unchanged. Once that env var is set,
// the only remaining step is swapping each call site's `slotId` placeholder
// for the real ad-unit ID from your AdSense dashboard — a one-line change,
// not a second env var per placement.

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSlotProps = {
  format?: "leaderboard" | "rectangle" | "banner";
  slotId?: string;
  className?: string;
};

const FORMAT_META: Record<NonNullable<AdSlotProps["format"]>, { minHeight: string; note: string }> = {
  leaderboard: { minHeight: "90px", note: "728×90 leaderboard" },
  rectangle: { minHeight: "250px", note: "300×250 rectangle" },
  banner: { minHeight: "100px", note: "responsive banner" },
};

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();

export default function AdSlot({ format = "banner", slotId = "0000000000", className = "" }: AdSlotProps) {
  const meta = FORMAT_META[format];
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense push failed", error);
    }
  }, []);

  if (!ADSENSE_CLIENT_ID) {
    return (
      <div
        role="complementary"
        aria-label="Advertisement"
        className={`flex w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 text-xs text-text-muted ${className}`}
        style={{ minHeight: meta.minHeight }}
      >
        Ad space · {meta.note}
      </div>
    );
  }

  // No minHeight here: with data-ad-format="auto" + full-width-responsive,
  // Google's script sizes and collapses this element itself. Forcing a
  // minimum height would keep a visibly empty block reserved even on an
  // unfilled impression — normal on an unapproved account or a plain no-fill,
  // not just a local-dev thing.
  return (
    <ins
      ref={insRef}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

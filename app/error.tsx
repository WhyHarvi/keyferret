"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface">
        <TriangleAlert size={24} className="text-accent" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-text-main">Something went wrong</h1>
      <p className="max-w-md text-sm text-text-muted">
        One of our data providers may be temporarily unavailable — give it a moment and try again.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <RefreshCw size={16} aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-text-main transition-colors hover:border-accent"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail } from "lucide-react";
import { markAlertRequested } from "@/lib/alerts-client";

type PriceAlertFormProps = {
  gameSlug: string;
  gameName: string;
  onSuccess?: () => void;
};

export default function PriceAlertForm({ gameSlug, gameName, onSuccess }: PriceAlertFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, gameSlug, gameName }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(data?.error || "Something went wrong.");
      markAlertRequested(gameSlug);
      setStatus("success");
      onSuccess?.();
    } catch (submitError: unknown) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm text-text-main">
        Check your inbox — confirm the email we just sent to start getting price-drop alerts for {gameName}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-text-main focus-within:border-accent">
          <Mail size={15} className="shrink-0 text-text-muted" aria-hidden="true" />
          <span className="sr-only">Email address</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-muted"
          />
        </label>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          Notify me
        </button>
      </form>
      {status === "error" && error && <p className="text-xs text-accent">{error}</p>}
    </div>
  );
}

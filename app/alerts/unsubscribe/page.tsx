import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { unsubscribePriceAlert } from "@/lib/alerts/service";

export const metadata: Metadata = {
  title: "Unsubscribe — KeyFerret",
  robots: { index: false, follow: false },
};

type UnsubscribeAlertPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribeAlertPage({ searchParams }: UnsubscribeAlertPageProps) {
  const { token } = await searchParams;
  const result = token ? await unsubscribePriceAlert(token) : { ok: false as const };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface">
        {result.ok ? (
          <CheckCircle2 size={24} className="text-emerald-400" aria-hidden="true" />
        ) : (
          <XCircle size={24} className="text-accent" aria-hidden="true" />
        )}
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-text-main">
        {result.ok ? "You're unsubscribed" : "This link isn't valid"}
      </h1>
      <p className="max-w-md text-sm text-text-muted">
        {result.ok
          ? "You won't receive any more price-drop emails for this alert."
          : "This unsubscribe link has already been used or doesn't exist."}
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-text-main transition-colors hover:border-accent"
      >
        Back home
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { verifyPriceAlert } from "@/lib/alerts/service";

export const metadata: Metadata = {
  title: "Confirm price alert — KeyFerret",
  robots: { index: false, follow: false },
};

type VerifyAlertPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyAlertPage({ searchParams }: VerifyAlertPageProps) {
  const { token } = await searchParams;
  const result = token ? await verifyPriceAlert(token) : { ok: false as const };

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
        {result.ok ? "Price alert confirmed" : "This link isn't valid"}
      </h1>
      <p className="max-w-md text-sm text-text-muted">
        {result.ok
          ? `You'll get an email as soon as ${result.gameName ?? "this game"} drops below its current price.`
          : "This confirmation link has expired or was already used."}
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

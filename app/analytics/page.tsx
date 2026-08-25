import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { getAnalyticsSummary } from "@/lib/analytics/log";

export const metadata: Metadata = {
  title: "Analytics — KeyFerret",
  robots: { index: false, follow: false },
};

type AnalyticsPageProps = {
  searchParams: Promise<{ key?: string }>;
};

// Gated by a shared secret, not a real account system — fails closed: if the
// key env var isn't set at all, this 404s unconditionally rather than ever
// falling open to "no key configured = public".
export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { key } = await searchParams;
  const expected = process.env.ANALYTICS_DASHBOARD_KEY?.trim();
  if (!expected || key !== expected) notFound();

  const summary = await getAnalyticsSummary(30);

  return <AnalyticsDashboard summary={summary} />;
}

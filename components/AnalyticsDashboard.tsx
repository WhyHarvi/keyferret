import { Activity, MousePointerClick, Search, Store as StoreIcon } from "lucide-react";
import type { AnalyticsSummary } from "@/lib/analytics/log";

const TYPE_LABELS: Record<string, string> = {
  search: "Searches",
  game_view: "Game views",
  deal_click: "Deal clicks",
  offer_click: "Offer clicks",
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-text-main">{value}</p>
    </div>
  );
}

function TopList({ title, icon: Icon, rows }: { title: string; icon: typeof Search; rows: Array<{ label: string; count: number }> }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-text-main">
        <Icon size={16} className="text-accent" aria-hidden="true" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">No data yet.</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-2.5">
          {rows.map((row, index) => (
            <li key={`${row.label}-${index}`} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-text-main">{row.label}</span>
              <span className="shrink-0 tabular-nums text-text-muted">{row.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function AnalyticsDashboard({ summary }: { summary: AnalyticsSummary | null }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 pb-16 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium text-text-muted">Internal</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-main sm:text-3xl">Analytics</h1>
          <p className="mt-2 text-sm text-text-muted">Last 30 days · self-hosted, no third-party tracker involved.</p>

          {!summary ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-medium text-text-main">No database configured.</p>
              <p className="mt-2 text-sm text-text-muted">Set DATABASE_URL to start collecting events.</p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard label="Total events" value={summary.totalEvents} />
                {summary.byType.map((row) => (
                  <StatCard key={row.type} label={TYPE_LABELS[row.type] ?? row.type} value={row.count} />
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <TopList
                  title="Top search queries"
                  icon={Search}
                  rows={summary.topSearchQueries.map((row) => ({ label: row.query, count: row.count }))}
                />
                <TopList
                  title="Most-viewed games"
                  icon={Activity}
                  rows={summary.topViewedGames.map((row) => ({ label: row.gameSlug, count: row.count }))}
                />
                <TopList
                  title="Most-clicked stores"
                  icon={StoreIcon}
                  rows={summary.topClickedStores.map((row) => ({ label: row.storeName, count: row.count }))}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 text-text-main">
                  <MousePointerClick size={16} className="text-accent" aria-hidden="true" />
                  <h2 className="text-sm font-semibold">Recent events</h2>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[540px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                        <th className="pb-2 pr-4 font-medium">Type</th>
                        <th className="pb-2 pr-4 font-medium">Path</th>
                        <th className="pb-2 pr-4 font-medium">Game</th>
                        <th className="pb-2 pr-4 font-medium">Store</th>
                        <th className="pb-2 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.recentEvents.map((event) => (
                        <tr key={event.id} className="border-b border-border/60 text-text-main last:border-0">
                          <td className="py-2 pr-4">{TYPE_LABELS[event.type] ?? event.type}</td>
                          <td className="py-2 pr-4 text-text-muted">{event.path ?? "—"}</td>
                          <td className="py-2 pr-4 text-text-muted">{event.gameSlug ?? "—"}</td>
                          <td className="py-2 pr-4 text-text-muted">{event.storeName ?? "—"}</td>
                          <td className="py-2 text-text-muted">{new Date(event.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {summary.recentEvents.length === 0 && <p className="py-4 text-sm text-text-muted">No events logged yet.</p>}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

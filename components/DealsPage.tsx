import Link from "next/link";
import Footer from "@/components/Footer";
import DealsGrid from "@/components/DealsGrid";
import AdSlot from "@/components/AdSlot";
import { ALL_DEAL_FILTERS, type DealFilter } from "@/lib/deal-filters";
import type { Deal } from "@/lib/pricing/cheapshark";

type DealsPageProps = {
  filter: DealFilter;
  deals: Deal[];
};

// Shared shell for /deals and /deals/[filter] — mirrors GameGridPage's split
// (route resolves data, this component owns the markup), plus a pill-tab row
// so the four deal categories read as one feature, not four disconnected pages.
export default function DealsPage({ filter, deals }: DealsPageProps) {
  const Icon = filter.icon;

  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 pb-16 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent">
              <Icon size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-text-muted">{filter.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-main sm:text-3xl">{filter.label}</h1>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-text-muted">{filter.description}</p>

          <nav aria-label="Deal categories" className="mt-6 flex w-fit flex-wrap items-center gap-1 rounded-full border border-border bg-surface p-1">
            {ALL_DEAL_FILTERS.map((item) => {
              const active = item.slug === filter.slug;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-accent/15 text-accent" : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <AdSlot format="rectangle" slotId="0000000002" className="mt-6" />

          {deals.length > 0 ? (
            <DealsGrid deals={deals} />
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-medium text-text-main">No active deals here right now.</p>
              <p className="mt-2 text-sm text-text-muted">CheapShark may be temporarily unavailable — check back shortly.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

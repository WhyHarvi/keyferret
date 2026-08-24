import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import BrowseGrid from "@/components/BrowseGrid";
import Footer from "@/components/Footer";
import type { Game } from "@/lib/types";

type GameGridPageProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  games: Game[];
  backHref?: string;
  backLabel?: string;
};

// Shared shell for any full-page game listing: the full catalog (/games) and
// per-genre pages (/genre/[genre]) both resolve to a list of Game and hand
// it here, the same way GamePage owns every /game/[slug] route.
export default function GameGridPage({
  eyebrow,
  title,
  description,
  icon: Icon,
  games,
  backHref = "/",
  backLabel = "All games",
}: GameGridPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="px-6 pb-16 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-text-main"
          >
            <ChevronLeft size={15} aria-hidden="true" />
            {backLabel}
          </Link>

          <div className="mt-4 flex items-center gap-3">
            {Icon && (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-accent">
                <Icon size={20} aria-hidden="true" />
              </span>
            )}
            <div>
              <p className="text-sm font-medium text-text-muted">{eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-main sm:text-3xl">{title}</h1>
            </div>
          </div>
          {description && <p className="mt-3 max-w-2xl text-sm text-text-muted">{description}</p>}

          {games.length > 0 ? (
            <BrowseGrid games={games} />
          ) : (
            <p className="mt-8 text-sm text-text-muted">No games here yet — check back soon.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

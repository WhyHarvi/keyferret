import { Bell } from "lucide-react";
import ScrollRow from "@/components/ScrollRow";
import WatchlistCard from "@/components/WatchlistCard";
import type { Game } from "@/lib/types";

type WatchlistEntry = { game: Game; addedLabel: string };

type WatchlistRowProps = {
  entries: WatchlistEntry[];
};

export default function WatchlistRow({ entries }: WatchlistRowProps) {
  if (entries.length === 0) return null;

  return (
    <ScrollRow
      id="watchlist"
      className="pt-28"
      ariaLabel="Watchlist"
      eyebrow="Watchlist"
      description="Save games you're eyeing and catch the price drop the moment it happens. No account needed."
      title={
        <>
          <Bell size={20} className="fill-accent/20 text-accent" aria-hidden="true" />
          Track the games worth waiting for.
        </>
      }
    >
      {entries.map((entry) => (
        <WatchlistCard key={entry.game.id} game={entry.game} addedLabel={entry.addedLabel} />
      ))}
    </ScrollRow>
  );
}

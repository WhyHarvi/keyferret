import { Flame } from "lucide-react";
import ScrollRow from "@/components/ScrollRow";
import TrendingCard from "@/components/TrendingCard";
import type { Game } from "@/lib/types";

type TrendingRowProps = {
  games: Game[];
};

export default function TrendingRow({ games }: TrendingRowProps) {
  return (
    <ScrollRow
      id="trending"
      ariaLabel="Trending now"
      eyebrow="Trending"
      itemSelector="[data-trending-card]"
      title={
        <>
          <Flame size={20} className="fill-accent text-accent" aria-hidden="true" />
          Popular games on IGDB
        </>
      }
    >
      {games.map((game, i) => (
        <TrendingCard key={game.id} game={game} rank={i + 1} />
      ))}
    </ScrollRow>
  );
}

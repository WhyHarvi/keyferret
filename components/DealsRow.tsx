import { Tag } from "lucide-react";
import ScrollRow from "@/components/ScrollRow";
import DealCard from "@/components/DealCard";
import { bestPrice, discountPercent, type Game } from "@/lib/types";

type DealsRowProps = {
  games: Game[];
};

export default function DealsRow({ games }: DealsRowProps) {
  const deals = [...games]
    .filter((game) => game.prices.length > 0 && discountPercent(bestPrice(game.prices)) !== null)
    .sort((a, b) => (discountPercent(bestPrice(b.prices)) ?? 0) - (discountPercent(bestPrice(a.prices)) ?? 0));

  if (deals.length === 0) return null;

  return (
    <ScrollRow
      id="deals"
      className="pt-28"
      ariaLabel="Current deals"
      eyebrow="Deals"
      title={
        <>
          <Tag size={20} className="fill-accent/20 text-accent" aria-hidden="true" />
          The sharpest price drops, without the noise.
        </>
      }
    >
      {deals.map((game) => (
        <DealCard key={game.id} game={game} />
      ))}
    </ScrollRow>
  );
}

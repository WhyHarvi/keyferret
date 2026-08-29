import { Flame } from "lucide-react";
import ScrollRow from "@/components/ScrollRow";
import DealListingCard from "@/components/DealListingCard";
import type { Deal } from "@/lib/pricing/cheapshark";

type TrendingRowProps = {
  deals: Deal[];
};

export default function TrendingRow({ deals }: TrendingRowProps) {
  if (deals.length === 0) return null;

  return (
    <ScrollRow
      id="trending-deals"
      ariaLabel="Trending game deals"
      eyebrow="Current offers"
      itemSelector="[data-trending-deal]"
      title={
        <>
          <Flame size={20} className="fill-accent text-accent" aria-hidden="true" />
          Trending deals
        </>
      }
    >
      {deals.map((deal) => (
        <div key={deal.dealId} data-trending-deal className="w-[230px] shrink-0 snap-start sm:w-[250px] md:w-[270px]">
          <DealListingCard deal={deal} />
        </div>
      ))}
    </ScrollRow>
  );
}

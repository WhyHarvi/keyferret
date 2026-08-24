import type { Metadata } from "next";
import WatchlistPage from "@/components/WatchlistPage";

export const metadata: Metadata = { title: "Watchlist — KeyFerret", description: "Games saved to your KeyFerret watchlist." };

export default function Page() {
  return <WatchlistPage />;
}

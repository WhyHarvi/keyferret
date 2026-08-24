import { NextRequest, NextResponse } from "next/server";
import { getFilteredGames, getPopularGames } from "@/lib/igdb";

export async function GET(request: NextRequest) {
  try {
    const genre = request.nextUrl.searchParams.get("genre")?.trim() || undefined;
    const platform = request.nextUrl.searchParams.get("platform")?.trim() || undefined;
    const games = genre || platform
      ? await getFilteredGames({ genre, platform }, 100)
      : await getPopularGames(100);
    return NextResponse.json({ games });
  } catch (error) {
    console.error("IGDB catalog filter failed", error);
    return NextResponse.json({ error: "Unable to filter games right now." }, { status: 502 });
  }
}

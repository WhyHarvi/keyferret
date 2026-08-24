import { NextRequest, NextResponse } from "next/server";
import { searchIGDBGames } from "@/lib/igdb";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") ?? "";
    return NextResponse.json({ games: await searchIGDBGames(query), source: "igdb" });
  } catch (error) {
    console.error("IGDB search failed", error);
    return NextResponse.json({ error: "Unable to search games right now." }, { status: 502 });
  }
}

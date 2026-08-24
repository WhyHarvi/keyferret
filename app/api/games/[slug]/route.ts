import { NextResponse } from "next/server";
import { getGameBySlug } from "@/lib/game-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const game = await getGameBySlug(slug);
    if (!game) return NextResponse.json({ error: "Game not found." }, { status: 404 });
    return NextResponse.json({ game });
  } catch (error) {
    console.error("Game lookup failed", error);
    return NextResponse.json({ error: "Unable to load this game." }, { status: 500 });
  }
}

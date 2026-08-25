import { NextResponse } from "next/server";
import { createPriceAlert } from "@/lib/alerts/service";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, gameSlug, gameName } = body as Record<string, unknown>;
  if (typeof email !== "string" || typeof gameSlug !== "string" || typeof gameName !== "string") {
    return NextResponse.json({ error: "Missing email, gameSlug, or gameName." }, { status: 400 });
  }

  const result = await createPriceAlert({ email, gameSlug, gameName });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

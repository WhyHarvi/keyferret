import { NextResponse } from "next/server";
import { logEvent } from "@/lib/analytics/log";
import { ANALYTICS_EVENT_TYPES, type AnalyticsEventInput } from "@/lib/analytics/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("type" in body)) {
    return NextResponse.json({ error: "Missing event type." }, { status: 400 });
  }

  const input = body as Partial<AnalyticsEventInput>;
  if (!input.type || !ANALYTICS_EVENT_TYPES.includes(input.type)) {
    return NextResponse.json({ error: "Unknown event type." }, { status: 400 });
  }

  await logEvent({
    type: input.type,
    path: typeof input.path === "string" ? input.path : undefined,
    query: typeof input.query === "string" ? input.query : undefined,
    gameSlug: typeof input.gameSlug === "string" ? input.gameSlug : undefined,
    storeName: typeof input.storeName === "string" ? input.storeName : undefined,
    metadata: typeof input.metadata === "object" && input.metadata !== null ? input.metadata : undefined,
  });

  return NextResponse.json({ ok: true });
}

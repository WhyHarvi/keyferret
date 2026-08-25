import { NextRequest, NextResponse } from "next/server";
import { checkPriceAlerts } from "@/lib/alerts/service";

// Deployment-agnostic: bearer-token-protected rather than tied to one host's
// cron system. Vercel Cron auto-attaches `Authorization: Bearer $CRON_SECRET`
// when that env var is set; any other scheduler (cron-job.org, a GitHub
// Actions workflow) just needs to send the same header manually.
async function handle(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await checkPriceAlerts();
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;

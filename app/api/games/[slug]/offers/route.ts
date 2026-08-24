import { NextResponse } from "next/server";
import { getOffersForGame } from "@/lib/pricing/pricing.service";
import { getVisitorCurrency, localizePricing } from "@/lib/pricing/currency";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const pricing = await getOffersForGame(slug);
    if (!pricing) return NextResponse.json({ error: "Game not found." }, { status: 404 });
    const localizedPricing = await localizePricing(pricing, getVisitorCurrency(request));
    return NextResponse.json(localizedPricing, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    console.error("Pricing lookup failed", error);
    return NextResponse.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }
}

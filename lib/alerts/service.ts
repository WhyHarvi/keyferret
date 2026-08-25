import "server-only";
import { randomUUID } from "node:crypto";
import { getPrisma } from "@/lib/db";
import { getOffersForGame } from "@/lib/pricing/pricing.service";
import { sendAlertVerificationEmail, sendPriceDropEmail } from "@/lib/alerts/email";
import type { CreateAlertInput, CreateAlertResult } from "@/lib/alerts/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resolves the current price itself via getOffersForGame — never trusts a
// price the client could supply — and rejects up front if there's nothing to
// alert on yet, so the form stays a single email field with no price input.
export async function createPriceAlert(input: CreateAlertInput): Promise<CreateAlertResult> {
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: "Enter a valid email address." };

  const prisma = getPrisma();
  if (!prisma) return { ok: false, error: "Price alerts aren't available right now." };

  const existing = await prisma.priceAlert.findFirst({
    where: { email, gameSlug: input.gameSlug, status: { not: "unsubscribed" } },
  });
  if (existing) return { ok: true };

  const pricing = await getOffersForGame(input.gameSlug).catch(() => undefined);
  if (!pricing || pricing.bestPrice === null) {
    return { ok: false, error: "We don't have a price for this game yet — try again once pricing has loaded." };
  }

  const verifyToken = randomUUID();
  const unsubscribeToken = randomUUID();

  await prisma.priceAlert.create({
    data: {
      email,
      gameSlug: input.gameSlug,
      gameName: input.gameName,
      referencePrice: pricing.bestPrice,
      thresholdPrice: pricing.bestPrice,
      currency: pricing.currency,
      verifyToken,
      unsubscribeToken,
    },
  });

  await sendAlertVerificationEmail({ to: email, gameName: input.gameName, verifyToken }).catch((error: unknown) => {
    console.error("Failed to send alert verification email", error);
  });

  return { ok: true };
}

export async function verifyPriceAlert(token: string): Promise<{ ok: boolean; gameName?: string }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false };

  const alert = await prisma.priceAlert.findUnique({ where: { verifyToken: token } });
  if (!alert || alert.status === "unsubscribed") return { ok: false };

  if (alert.status !== "active") {
    await prisma.priceAlert.update({ where: { id: alert.id }, data: { status: "active", verifiedAt: new Date() } });
  }

  return { ok: true, gameName: alert.gameName };
}

export async function unsubscribePriceAlert(token: string): Promise<{ ok: boolean }> {
  const prisma = getPrisma();
  if (!prisma) return { ok: false };

  const alert = await prisma.priceAlert.findUnique({ where: { unsubscribeToken: token } });
  if (!alert) return { ok: false };

  await prisma.priceAlert.update({ where: { id: alert.id }, data: { status: "unsubscribed" } });
  return { ok: true };
}

// The cron entry point. Reuses getOffersForGame (and its 1hr DB cache) rather
// than talking to CheapShark directly, so recently-viewed games are a free
// cache hit — only alert-only games trigger a fresh CheapShark call.
export async function checkPriceAlerts(): Promise<{ checked: number; notified: number }> {
  const prisma = getPrisma();
  if (!prisma) return { checked: 0, notified: 0 };

  const activeAlerts = await prisma.priceAlert.findMany({ where: { status: "active" } });
  const uniqueSlugs = [...new Set(activeAlerts.map((alert) => alert.gameSlug))];

  let notified = 0;

  for (const slug of uniqueSlugs) {
    const pricing = await getOffersForGame(slug).catch((error: unknown) => {
      console.error(`Price-alert check failed for ${slug}`, error);
      return undefined;
    });
    if (!pricing || pricing.bestPrice === null) continue;

    const alertsForGame = activeAlerts.filter((alert) => alert.gameSlug === slug);
    for (const alert of alertsForGame) {
      const threshold = Number(alert.thresholdPrice ?? alert.referencePrice);
      const lastNotifiedPrice = alert.lastNotifiedPrice !== null ? Number(alert.lastNotifiedPrice) : null;
      const hasDropped = pricing.bestPrice <= threshold;
      const isNewLow = lastNotifiedPrice === null || pricing.bestPrice < lastNotifiedPrice;
      if (!hasDropped || !isNewLow) continue;

      await sendPriceDropEmail({
        to: alert.email,
        gameName: alert.gameName,
        price: pricing.bestPrice,
        currency: pricing.currency,
        gameSlug: alert.gameSlug,
        unsubscribeToken: alert.unsubscribeToken,
      }).catch((error: unknown) => console.error(`Failed to send price-drop email for ${slug}`, error));

      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { lastNotifiedAt: new Date(), lastNotifiedPrice: pricing.bestPrice },
      });
      notified += 1;
    }
  }

  return { checked: uniqueSlugs.length, notified };
}

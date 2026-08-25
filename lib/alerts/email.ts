import "server-only";
import { Resend } from "resend";
import { absoluteUrl } from "@/lib/seo";

// No-ops with a console.warn if RESEND_API_KEY is unset — same graceful-
// absence pattern getPrisma() already uses. Every other piece of the alerts
// feature (DB rows, verify/unsubscribe pages, the cron check) works fully
// without a Resend account; only actual mail delivery needs one.
const apiKey = process.env.RESEND_API_KEY?.trim();
const resend = apiKey ? new Resend(apiKey) : null;
const FROM_EMAIL = process.env.ALERTS_FROM_EMAIL?.trim() || "KeyFerret <alerts@keyferret.app>";

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, (char) => entities[char] ?? char);
}

export async function sendAlertVerificationEmail(params: { to: string; gameName: string; verifyToken: string }): Promise<void> {
  if (!resend) {
    console.warn(`RESEND_API_KEY is not set — skipping verification email to ${params.to}.`);
    return;
  }

  const verifyUrl = absoluteUrl(`/alerts/verify?token=${encodeURIComponent(params.verifyToken)}`);
  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Confirm your price alert for ${params.gameName}`,
    html: `
      <p>You asked to be notified when <strong>${escapeHtml(params.gameName)}</strong> drops below its current price.</p>
      <p><a href="${verifyUrl}">Confirm this alert</a></p>
      <p style="color:#888;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

export async function sendPriceDropEmail(params: {
  to: string;
  gameName: string;
  price: number;
  currency: string;
  gameSlug: string;
  unsubscribeToken: string;
}): Promise<void> {
  if (!resend) {
    console.warn(`RESEND_API_KEY is not set — skipping price-drop email to ${params.to}.`);
    return;
  }

  const gameUrl = absoluteUrl(`/game/${params.gameSlug}`);
  const unsubscribeUrl = absoluteUrl(`/alerts/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`);
  const formattedPrice = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: params.currency,
    maximumFractionDigits: 2,
  }).format(params.price);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Price drop: ${params.gameName} is now ${formattedPrice}`,
    html: `
      <p><strong>${escapeHtml(params.gameName)}</strong> just dropped to <strong>${formattedPrice}</strong>.</p>
      <p><a href="${gameUrl}">View the deal</a></p>
      <p style="color:#888;font-size:12px;">Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe</a></p>
    `,
  });
}

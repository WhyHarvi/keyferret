import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service — KeyFerret",
  description: "The terms that govern your use of KeyFerret.",
  alternates: { canonical: absoluteUrl("/terms") },
};

const h2 = "text-lg font-semibold text-text-main";
const p = "text-sm leading-7 text-text-main/85";
const ul = "flex list-disc flex-col gap-1.5 pl-5 text-sm leading-7 text-text-main/85";

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" updated="August 24, 2026">
      <section className="flex flex-col gap-3">
        <h2 className={h2}>Acceptance of terms</h2>
        <p className={p}>By using KeyFerret, you agree to these terms. If you don&apos;t agree, please don&apos;t use the site.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>What this service is</h2>
        <p className={p}>
          KeyFerret aggregates game information and pricing from third-party sources (IGDB and CheapShark) to help
          you compare deals. Prices, discounts, and availability are sourced from those retailers and can change or
          go out of date between the time a page was generated and the time you visit a store — always confirm the
          final price on the retailer&apos;s own site before completing a purchase.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Third-party links and purchases</h2>
        <p className={p}>
          Every purchase happens on a third-party retailer&apos;s site, under that retailer&apos;s own terms. Some
          outbound deal links may include affiliate or referral parameters, and KeyFerret may earn a commission on
          purchases made after clicking through — this never affects the price you pay.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>No account required</h2>
        <ul className={ul}>
          <li>KeyFerret doesn&apos;t require an account to browse, search, or compare prices.</li>
          <li>Your watchlist is stored only in your browser and can be lost if you clear your browser&apos;s site data.</li>
          <li>Price alerts are optional, free, and email-based — no login is created, and you can unsubscribe at any time via the link in every alert email.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Attribution</h2>
        <p className={p}>Game data is provided by IGDB. Pricing and deal data is provided by CheapShark.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>No warranty; limitation of liability</h2>
        <p className={p}>
          KeyFerret is provided &ldquo;as is,&rdquo; without warranty of any kind. We don&apos;t guarantee the
          accuracy, completeness, or timeliness of any price, deal, or game information shown, and we&apos;re not
          liable for any loss arising from your reliance on it or from your dealings with a third-party retailer.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Changes to these terms</h2>
        <p className={p}>We may update these terms as the site changes. Continued use after an update means you accept the revised terms.</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Contact</h2>
        <p className={p}>
          Questions about these terms:{" "}
          <a href="mailto:hello@keyferret.app" className="text-accent hover:underline">
            hello@keyferret.app
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}

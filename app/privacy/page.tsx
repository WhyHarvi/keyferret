import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy — KeyFerret",
  description: "How KeyFerret collects, uses, and protects your information.",
  alternates: { canonical: absoluteUrl("/privacy") },
};

const h2 = "text-lg font-semibold text-text-main";
const p = "text-sm leading-7 text-text-main/85";
const ul = "flex list-disc flex-col gap-1.5 pl-5 text-sm leading-7 text-text-main/85";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="August 24, 2026">
      <section className="flex flex-col gap-3">
        <h2 className={h2}>What KeyFerret is</h2>
        <p className={p}>
          KeyFerret helps you compare current prices for video games across storefronts. We don&apos;t sell anything
          ourselves — every purchase happens on a third-party retailer&apos;s site after you click through a listed
          deal.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Information we collect</h2>
        <p className={p}>KeyFerret is designed to work without an account. What we do collect:</p>
        <ul className={ul}>
          <li>
            <strong className="text-text-main">Usage analytics.</strong> Search queries, game page views, and
            clicks on outbound deal links, logged to our own database — not shared with or sent through a
            third-party analytics network. This data isn&apos;t tied to your name or a persistent identity.
          </li>
          <li>
            <strong className="text-text-main">Watchlist.</strong> Games you add to your watchlist are stored only
            in your browser&apos;s local storage. They&apos;re never sent to our servers and are lost if you clear
            your browser&apos;s site data.
          </li>
          <li>
            <strong className="text-text-main">Price alerts (optional).</strong> If you ask to be emailed when a
            game&apos;s price drops, we store the email address you provide along with the game and the price at
            the time you signed up, solely to send you a one-time confirmation email and later price-drop notices.
            Every alert email includes a one-click unsubscribe link.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Third-party data and links</h2>
        <p className={p}>
          Game details (descriptions, artwork, genres) come from IGDB. Pricing and deal information comes from
          CheapShark. Clicking a deal takes you to a third-party retailer&apos;s site, governed by that retailer&apos;s
          own privacy policy and terms — KeyFerret isn&apos;t a party to that transaction and doesn&apos;t see your
          payment information.
        </p>
      </section>

      <section id="cookies" className="flex flex-col gap-3 scroll-mt-24">
        <h2 className={h2}>Cookies</h2>
        <p className={p}>
          KeyFerret does not currently use tracking or advertising cookies. We may show ads through Google AdSense
          in the future to help support the site; when that&apos;s active, Google and its partners may use cookies
          to serve and measure relevant ads. You&apos;ll be able to review or adjust ad personalization at any time
          through{" "}
          <a href="https://myadcenter.google.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Google&apos;s Ad Settings
          </a>
          .
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Data retention and deletion</h2>
        <p className={p}>
          Analytics events are retained for a limited period and are not linked to an identifiable person. Price
          alert records are deleted when you unsubscribe. To request deletion of a price alert or ask what data we
          hold, contact us below.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Changes to this policy</h2>
        <p className={p}>
          We may update this policy as the site changes. Material changes will be reflected by updating the date at
          the top of this page.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className={h2}>Contact</h2>
        <p className={p}>
          Questions about this policy or your data:{" "}
          <a href="mailto:privacy@keyferret.app" className="text-accent hover:underline">
            privacy@keyferret.app
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}

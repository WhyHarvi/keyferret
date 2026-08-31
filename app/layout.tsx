import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
const skimlinksId = process.env.NEXT_PUBLIC_SKIMLINKS_ID?.trim();

const SITE_DESCRIPTION = "Compare game prices across multiple stores and find the cheapest available deals.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "KeyFerret",
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  verification: { google: "4j8vHM0VtkxOIRkD7THJE6sHg5psLNBBwLgbpXaqlCs" },
  openGraph: {
    siteName: "KeyFerret",
    type: "website",
    locale: "en_US",
    title: "KeyFerret",
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyFerret",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  ...(adsenseClientId ? { other: { "google-adsense-account": adsenseClientId } } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        {skimlinksId && (
          // Rewrites outbound "Get deal" / "View deal" links to Skimlinks'
          // affiliate-tagged equivalents client-side when a merchant match
          // exists — no server-side link wrapping needed.
          <Script
            src={`https://s.skimresources.com/js/${skimlinksId}.skimlinks.js`}
            strategy="beforeInteractive"
          />
        )}
        <Navbar />
        {children}
      </body>
    </html>
  );
}

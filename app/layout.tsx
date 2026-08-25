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

const SITE_DESCRIPTION = "Find the cheapest price for any game, compared across every storefront that sells it.";

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
        <Navbar />
        {children}
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

type FooterLink = { label: string; href: string };
type FooterColumnData = { title: string; links: FooterLink[] };

const columns: FooterColumnData[] = [
  {
    title: "Explore",
    links: [
      { label: "Browse", href: "/games" },
      { label: "All games", href: "/games" },
      { label: "Deals", href: "/deals" },
      { label: "Trending deals", href: "/#trending-deals" },
      { label: "Watchlist", href: "/watchlist" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy#cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl px-6 py-14 sm:px-10"
      >
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label="KeyFerret home">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                <Image src="/logo.png" alt="" fill sizes="32px" className="object-contain" />
              </span>
              <span className="text-lg font-bold tracking-tight text-text-main">KeyFerret</span>
            </Link>
            <p className="mt-3 max-w-[26ch] text-sm text-text-muted">
              Compare game prices across multiple stores and find the cheapest available deal.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-text-main">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-text-main">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-text-muted">© 2026 KeyFerret.</p>
          <p className="text-xs text-text-muted">Game information powered by IGDB.</p>
        </div>
      </motion.div>
    </footer>
  );
}

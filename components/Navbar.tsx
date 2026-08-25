"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/games", label: "Browse" },
  { href: "/deals", label: "Deals" },
  { href: "/#trending", label: "Popular" },
  { href: "/watchlist", label: "Watchlist" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("#hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#hero");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const select = (hash: string) => {
    setActiveHash(hash);
    setMenuOpen(false);
  };

  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => select("#hero")}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="KeyFerret home"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <Image src="/logo.png" alt="" fill sizes="40px" className="object-contain" priority />
          </span>
          <span className="text-xl font-bold tracking-tight text-text-main">KeyFerret</span>
        </Link>

        <div className="flex flex-1 items-center justify-between">
          {/* Center pill nav (desktop) — glassmorphic, with an animated sliding
              highlight. Stays mounted and evenly spaced regardless of search
              state — it used to get replaced entirely while searching, which
              hid Browse/Deals/Popular/Watchlist and let the search input
              stretch across the whole bar. */}
          <nav
            aria-label="Main links"
            className="hidden flex-1 items-center justify-center gap-1 md:flex"
          >
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href === "/#trending" && activeHash === "#trending");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "location" : undefined}
                    onClick={() => select(item.href)}
                    className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      active ? "text-text-main" : "text-text-muted hover:text-text-main"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full border border-white/15 bg-white/10 shadow-[0_2px_14px_rgba(0,0,0,0.4)] backdrop-blur-sm"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right actions — the search box, when open, is confined here
              (capped width) instead of taking over the whole bar. */}
          <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
            <AnimatePresence mode="wait" initial={false}>
              {searchOpen ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-55 sm:max-w-xs"
                >
                  <SearchBar onClose={() => setSearchOpen(false)} className="w-full" />
                </motion.div>
              ) : (
                <motion.button
                  key="icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  type="button"
                  aria-label="Search games"
                  onClick={openSearch}
                  className="flex items-center gap-2 rounded-lg py-1.5 pl-2 pr-1.5 text-text-muted transition-colors hover:text-text-main sm:pl-2.5"
                >
                  <Search size={19} strokeWidth={2} aria-hidden="true" />
                  <span className="hidden items-center gap-0.5 rounded-md border border-border bg-white/5 px-1.5 py-0.5 text-[11px] font-medium text-text-muted sm:flex">
                    <span className="text-xs">⌘</span>K
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Mobile menu toggle */}
            <button
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text-main md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, scale: 0.82 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.82 }}
                  transition={{ duration: 0.14 }}
                  className="flex"
                >
                  {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {menuOpen && !searchOpen && (
          <motion.nav
            id="mobile-nav-menu"
            aria-label="Mobile links"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href === "/#trending" && activeHash === "#trending");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "location" : undefined}
                    onClick={() => select(item.href)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-white/15 bg-white/10 text-text-main backdrop-blur-sm"
                        : "border-transparent text-text-muted hover:text-text-main"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

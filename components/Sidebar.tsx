"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { AnimatePresence, motion } from "motion/react";
import {
  Binoculars,
  Flame,
  Heart,
  KeyRound,
  Menu,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import styles from "./Sidebar.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const primaryItems: NavItem[] = [
  { href: "#search", label: "Search games", icon: Search },
  { href: "/games", label: "Browse games", icon: Binoculars },
  { href: "/#trending", label: "Popular games", icon: Flame },
  { href: "/watchlist", label: "Watchlist", icon: Heart },
];

const mobileSecondaryItems = primaryItems.slice(1, 3);

function NavIcon({ item, active, onSelect }: { item: NavItem; active: boolean; onSelect?: () => void }) {
  const Icon = item.icon;

  return (
    <motion.div whileHover={{ x: 2, scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "location" : undefined}
        className={`${styles.navLink} ${active ? styles.active : ""}`}
        onClick={onSelect}
      >
        <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
        <span role="tooltip" className={styles.tooltip}>{item.label}</span>
      </Link>
    </motion.div>
  );
}

export default function Sidebar() {
  const [activeHash, setActiveHash] = useState("#search");
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash || "#search");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    if (!mobileMenuRef.current) return;

    const context = gsap.context(() => {
      const links = mobileMenuRef.current?.querySelectorAll("[data-mobile-link]");
      const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
      timeline.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.22 },
      );
      if (links) {
        timeline.fromTo(links, { x: -5, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.045, duration: 0.16 }, "-=0.1");
      }
    }, mobileMenuRef);

    return () => context.revert();
  }, [menuOpen]);

  const select = (hash: string) => {
    setActiveHash(hash);
    setMenuOpen(false);
  };

  return (
    <motion.aside
      aria-label="Primary navigation"
      className={styles.sidebar}
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" aria-label="KeyFerret home" className={styles.logo}>
        <span className={styles.logoMark}>
          <KeyRound aria-hidden="true" size={21} strokeWidth={2} />
        </span>
        <span className={styles.logoName}>KeyFerret</span>
        <span role="tooltip" className={styles.tooltip}>KeyFerret home</span>
      </Link>

      <nav className={styles.desktopNav} aria-label="Main links">
        {primaryItems.map((item) => (
          <NavIcon key={item.href} item={item} active={activeHash === item.href} onSelect={() => select(item.href)} />
        ))}
      </nav>

      <nav className={styles.mobileNav} aria-label="Mobile links">
        <NavIcon item={primaryItems[0]} active={activeHash === "#search"} onSelect={() => select("#search")} />
        <NavIcon item={primaryItems[3]} active={activeHash === "#watchlist"} onSelect={() => select("#watchlist")} />

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="sidebar-mobile-menu"
          className={styles.menuButton}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? "close" : "menu"}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.82 }}
              transition={{ duration: 0.14 }}
            >
              {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </motion.span>
          </AnimatePresence>
          <span role="tooltip" className={styles.tooltip}>{menuOpen ? "Close menu" : "Browse menu"}</span>
        </button>

        {menuOpen && (
          <div ref={mobileMenuRef} id="sidebar-mobile-menu" className={styles.mobileMenu}>
            {mobileSecondaryItems.map((item) => (
              <div data-mobile-link key={item.href}>
                <NavIcon item={item} active={activeHash === item.href} onSelect={() => select(item.href)} />
              </div>
            ))}
          </div>
        )}
      </nav>
    </motion.aside>
  );
}

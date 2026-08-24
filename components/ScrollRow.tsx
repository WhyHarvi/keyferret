"use client";

import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ScrollRowProps = {
  id?: string;
  ariaLabel: string;
  eyebrow: string;
  title: ReactNode;
  description?: string;
  itemSelector?: string;
  className?: string;
  children: ReactNode;
};

// Shared horizontal-scroll-row shell: snap-scroll track, hover-reveal chevron
// controls (measured against the actual card width so a step lines up with
// the snap points), and mouse-only click-and-drag scrolling. Trending, Deals,
// and Watchlist all render through this so their scroll behavior — and the
// way each row looks doing it — stays identical.
export default function ScrollRow({
  id,
  ariaLabel,
  eyebrow,
  title,
  description,
  itemSelector = "[data-scroll-item]",
  className = "",
  children,
}: ScrollRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  // "tracking" starts on every mouse-down; "dragging" only turns on past a
  // small movement threshold. Pointer capture is deferred until that point
  // too — capturing immediately on down was swallowing plain clicks on the
  // cards (a Link never got its click event once the scroller took over the
  // gesture), which broke navigation for anyone who moved the mouse even a
  // pixel between mousedown and mouseup. A real drag still scrolls; a real
  // click still navigates.
  const drag = useRef({ tracking: false, dragging: false, startX: 0, startScrollLeft: 0, pointerId: 0 });
  const DRAG_THRESHOLD_PX = 6;

  const rowReveal = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const scrollByAmount = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const card = scroller.querySelector<HTMLElement>(itemSelector);
    const step = card ? card.offsetWidth + 12 : 360;
    scroller.scrollBy({ left: direction * step * 2, behavior: "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !scrollerRef.current) return;
    drag.current = {
      tracking: true,
      dragging: false,
      startX: e.clientX,
      startScrollLeft: scrollerRef.current.scrollLeft,
      pointerId: e.pointerId,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.tracking || !scrollerRef.current) return;
    const delta = e.clientX - drag.current.startX;
    if (!drag.current.dragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      drag.current.dragging = true;
      scrollerRef.current.setPointerCapture(drag.current.pointerId);
    }
    scrollerRef.current.scrollLeft = drag.current.startScrollLeft - delta;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.dragging) {
      scrollerRef.current?.releasePointerCapture(e.pointerId);
    }
    drag.current.tracking = false;
    drag.current.dragging = false;
  };

  return (
    <motion.section
      id={id}
      className={`group/row scroll-mt-24 ${className}`}
      aria-label={ariaLabel}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={rowReveal}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">{eyebrow}</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-text-main">
            {title}
          </h2>
          {description && <p className="mt-2 max-w-md text-sm text-text-muted">{description}</p>}
        </div>

        <div className="hidden items-center gap-2 opacity-0 transition-opacity duration-200 group-hover/row:opacity-100 sm:flex">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-1)}
            className="rounded-full border border-border bg-surface p-1.5 text-text-main transition-colors hover:bg-white/10"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollByAmount(1)}
            className="rounded-full border border-border bg-surface p-1.5 text-text-main transition-colors hover:bg-white/10"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 cursor-grab active:cursor-grabbing"
      >
        {children}
      </div>
    </motion.section>
  );
}

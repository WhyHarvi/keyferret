"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Images, Play } from "lucide-react";
import { gsap } from "gsap";
import type { Game } from "@/lib/types";

export default function GameMedia({ game }: { game: Game }) {
  const [activeVideo, setActiveVideo] = useState(game.videos[0] ?? null);
  const [playing, setPlaying] = useState(false);
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gsap.fromTo(section.querySelectorAll("[data-media-reveal]"), { opacity: 0, y: 18 }, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: "power2.out",
        clearProps: "opacity,transform",
      });
      observer.disconnect();
    }, { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  if (!activeVideo && game.screenshots.length === 0) return null;

  const moveGallery = (direction: -1 | 1) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const card = gallery.querySelector<HTMLElement>("[data-screenshot-card]");
    const distance = (card?.offsetWidth ?? gallery.clientWidth * 0.8) + 20;
    const target = gallery.scrollLeft + distance * direction;
    gallery.scrollTo({
      left: target,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const syncActiveScreenshot = () => {
    const gallery = galleryRef.current;
    const card = gallery?.querySelector<HTMLElement>("[data-screenshot-card]");
    if (!gallery || !card) return;
    const nextIndex = Math.min(game.screenshots.length - 1, Math.round(gallery.scrollLeft / (card.offsetWidth + 20)));
    setActiveScreenshot((currentIndex) => currentIndex === nextIndex ? currentIndex : nextIndex);
  };

  return (
    <section ref={sectionRef} aria-labelledby="game-media-title" className="w-full min-w-0">
      <div data-media-reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">Media</p>
          <div className="mt-1 flex items-center gap-2">
            <Images size={20} className="text-accent" aria-hidden="true" />
            <h2 id="game-media-title" className="text-2xl font-semibold tracking-tight text-text-main">Trailers and gameplay</h2>
          </div>
          <p className="mt-2 text-sm text-text-muted">Watch the trailer and explore gameplay captured for this title.</p>
        </div>
      </div>

      {activeVideo && (
        <div data-media-reveal className="mt-6 w-full min-w-0 overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-black/30">
          <div className="relative w-full shrink-0 overflow-hidden bg-black" style={{ aspectRatio: "16 / 9" }}>
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&controls=1&rel=0`}
                title={activeVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 block h-full w-full border-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
                aria-label={`Play ${activeVideo.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail for the selected IGDB video */}
                <img src={`https://i.ytimg.com/vi/${activeVideo.videoId}/maxresdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-65" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-xl transition-transform group-hover:scale-105">
                    <Play size={25} className="ml-1 fill-current" aria-hidden="true" />
                  </span>
                </span>
              </button>
            )}
          </div>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-text-main">{activeVideo.name}</p>
            {game.videos.length > 1 && (
              <div className="flex flex-wrap gap-2" aria-label="Available trailers">
                {game.videos.map((video, index) => (
                  <button key={`${video.videoId}-${index}`} type="button" aria-pressed={video.videoId === activeVideo.videoId} onClick={() => { setActiveVideo(video); setPlaying(false); }} className="min-h-11 cursor-pointer rounded-xl border border-border px-3 text-sm font-medium text-text-main transition-colors hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent/10">
                    Trailer {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {game.screenshots.length > 0 && (
        <div data-media-reveal className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-text-main">Gameplay screenshots</h3>
              <p className="mt-1 text-sm text-text-muted">{activeScreenshot + 1} of {game.screenshots.length}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveGallery(-1)} disabled={activeScreenshot === 0} aria-label="Previous screenshot" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-main transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => moveGallery(1)} disabled={activeScreenshot === game.screenshots.length - 1} aria-label="Next screenshot" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-text-main transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div ref={galleryRef} onScroll={syncActiveScreenshot} className="hide-scrollbar mt-5 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain pb-4 pr-[12vw]">
            {game.screenshots.map((screenshot, index) => (
              <a key={screenshot} data-screenshot-card href={screenshot.replace("t_screenshot_big", "t_1080p")} target="_blank" rel="noopener noreferrer" className="group relative aspect-video w-[88%] shrink-0 snap-start snap-always overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-[74%] lg:w-[62%]" aria-label={`Open ${game.title} gameplay screenshot ${index + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- external, dynamic IGDB screenshot */}
                <img src={screenshot} alt={`${game.title} gameplay screenshot ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

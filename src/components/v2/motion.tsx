"use client";

/**
 * v2 client motion: the only two islands left on the home page and case studies.
 *
 *   Filmstrip  a pinned horizontal track on large screens, a snap scroller elsewhere
 *              (it measures the track, and moves keyboard focus into view)
 *   ActiveToc  highlights the case-study contents link for the section in view
 *
 * Every other scroll effect (scenes, cues, reveals, sweeps, word reveal, progress bar) is a
 * CSS scroll timeline: see cue.tsx, ui.tsx and theme.css. They ship no JavaScript.
 */

import { m, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type ReactNode } from "react";
import { useMotionPreference } from "@/components/shared/MotionToggle";

/** Scenes pin only where the stage fits: keep in sync with the media query in theme.css. */
export const PIN_QUERY = "(min-width: 1024px) and (min-height: 700px)";

const SPRING = { stiffness: 170, damping: 32, mass: 0.35 };

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];
const PINNED_OFFSET: ScrollOffset = ["start start", "end end"];

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

/** `pinned` is true on large screens when motion is allowed. */
export function useStage(): { pinned: boolean; reduced: boolean } {
  const { reduced } = useMotionPreference();
  const wide = useMedia(PIN_QUERY);
  return { pinned: wide && !reduced, reduced };
}

export interface FilmstripProps {
  id: string;
  labelledBy: string;
  /** Accessible name of the scrollable region on small screens. */
  regionLabel: string;
  /** Title block: beside the track while pinned, above it elsewhere. */
  header: ReactNode;
  children: ReactNode;
}

/**
 * On large screens the section pins and vertical scroll drives the track sideways
 * (1px of scroll per 1px of travel). Elsewhere the track is a native snap scroller.
 * Keyboard focus inside the pinned track scrolls the page so the focused card is in view.
 */
export function Filmstrip({ id, labelledBy, regionLabel, header, children }: FilmstripProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { pinned } = useStage();
  const [distance, setDistance] = useState(0);
  const dist = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: PINNED_OFFSET });
  const smooth = useSpring(scrollYProgress, SPRING);
  const x = useTransform(() => -smooth.get() * dist.get());

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!pinned || !viewport || !track) {
      dist.set(0);
      setDistance(0);
      return;
    }
    const measure = () => {
      const d = Math.max(0, track.scrollWidth - viewport.clientWidth);
      dist.set(d);
      setDistance(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [pinned, dist]);

  function onFocus(e: FocusEvent<HTMLDivElement>) {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!pinned || !section || !track || distance === 0) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-film-card]");
    if (!card) return;
    const ratio = Math.min(1, Math.max(0, (card.offsetLeft - track.offsetLeft) / distance));
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ratio * travel, behavior: "instant" as ScrollBehavior });
  }

  const style = pinned && distance > 0 ? ({ height: `calc(100svh + ${distance}px)` } as CSSProperties) : undefined;

  return (
    <section ref={sectionRef} id={id} aria-labelledby={labelledBy} className="v2-scene v2-film" style={style}>
      <div className="v2-stage v2-film-stage">
        <div className="v2-film-head">{header}</div>
        <div
          ref={viewportRef}
          className="v2-film-viewport"
          role="region"
          aria-label={regionLabel}
          tabIndex={pinned ? undefined : 0}
          onFocus={onFocus}
        >
          <m.div ref={trackRef} className="v2-film-track v2-fx" style={pinned ? { x } : undefined}>
            {children}
          </m.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Highlights the table-of-contents link for the section in view.
 * Renders the nav itself so the page stays a server component.
 */
export function ActiveToc({ items, label }: { items: { id: string; no: string; title: string }[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label} className="v2-toc">
      <p className="v2-eyebrow mb-3">Contents</p>
      <ol className="grid">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
              <span className="v2-toc-no">{i.no}</span>
              <span>{i.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

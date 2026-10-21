"use client";

/**
 * The only motion code on the cover. HeroStage wraps the wordmark alone and tracks the
 * scroll of the cover section around it; the small leaves below read that progress.
 * The rest of the cover (standfirst, intro, buttons) is server HTML outside this island,
 * so the largest text on a phone never waits on hydration.
 * Under reduced motion each leaf remounts with a static key, so no transform is left behind.
 */
import { m, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { createContext, useContext, useLayoutEffect, useRef, type ReactNode } from "react";
import { useMotionPreference } from "@/components/shared/MotionToggle";
import { EASE_OUT, SCROLL_SPRING } from "./motion";

const ProgressContext = createContext<MotionValue<number> | null>(null);

function useHeroProgress(): MotionValue<number> {
  const p = useContext(ProgressContext);
  if (!p) throw new Error("Hero motion leaves must sit inside HeroStage");
  return p;
}

interface HeroStageProps {
  children: ReactNode;
  className?: string;
}

/**
 * The wordmark block. Progress runs from the top of the enclosing cover section to when
 * that section leaves the viewport, so the plates travel across the whole cover.
 */
export function HeroStage({ children, className }: HeroStageProps) {
  const own = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLElement | null>(null);
  // Declared before useScroll so the cover ref resolves before scroll tracking starts.
  useLayoutEffect(() => {
    cover.current = own.current?.closest("section") ?? own.current;
  }, []);
  const { scrollYProgress } = useScroll({ target: cover, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  return (
    <div ref={own} className={className}>
      <ProgressContext.Provider value={p}>{children}</ProgressContext.Provider>
    </div>
  );
}

interface PlateShiftProps {
  children: ReactNode;
  className?: string;
  /** Horizontal travel across the cover's scroll, as a percentage string such as "-24%". */
  to: string;
}

/** A line of the wordmark sliding sideways, like a printing plate pulled out of the press. */
export function PlateShift({ children, className, to }: PlateShiftProps) {
  const { reduced } = useMotionPreference();
  const p = useHeroProgress();
  const x = useTransform(p, [0, 1], ["0%", to]);
  return reduced ? (
    <span key="static" className={className}>
      {children}
    </span>
  ) : (
    <m.span key="live" className={className} style={{ x }}>
      {children}
    </m.span>
  );
}

/** The red plate behind the family name, drifting further out of register as the page scrolls. */
export function GhostPlate({ children, className }: { children: ReactNode; className?: string }) {
  const { reduced } = useMotionPreference();
  const p = useHeroProgress();
  const x = useTransform(p, [0, 0.6], ["0.035em", "0.16em"]);
  const y = useTransform(p, [0, 0.6], ["0.02em", "0.07em"]);
  return reduced ? (
    <span key="static" aria-hidden="true" className={className} style={{ transform: "translate(0.035em, 0.02em)" }}>
      {children}
    </span>
  ) : (
    <m.span key="live" aria-hidden="true" className={className} style={{ x, y }}>
      {children}
    </m.span>
  );
}

/** Registration target: turns as the plate moves. */
export function RegistrationMark({ className }: { className?: string }) {
  const { reduced } = useMotionPreference();
  const p = useHeroProgress();
  const rotate = useTransform(p, [0, 1], [0, 240]);
  return (
    <m.svg
      key={reduced ? "static" : "live"}
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={className}
      style={reduced ? undefined : { rotate }}
    >
      <circle cx="32" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 2 V62 M2 32 H62" stroke="currentColor" strokeWidth="1.5" />
    </m.svg>
  );
}

/** The red rule between the two lines of the name, drawn once on load. */
export function WordmarkRule({ className }: { className?: string }) {
  const { reduced } = useMotionPreference();
  return (
    <m.span
      aria-hidden="true"
      className={className}
      initial={reduced ? false : { scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 1.1, delay: 0.35, ease: EASE_OUT }}
    />
  );
}

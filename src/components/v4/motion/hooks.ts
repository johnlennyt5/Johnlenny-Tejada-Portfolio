"use client";

import { useMotionValue, type MotionValue } from "framer-motion";
import { useEffect, useState, type RefObject } from "react";
import { useMotionPreference } from "@/components/shared/MotionToggle";

/** False on the server and during hydration, true right after. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * True when motion should be reduced (OS setting or the site's motion toggle).
 * Always false until mounted, so the hydration render matches the server HTML exactly;
 * components then switch to their static final state on the next render.
 */
export function useReduced(): boolean {
  const { reduced } = useMotionPreference();
  const mounted = useMounted();
  return mounted && reduced;
}

/**
 * Entrance animations are "armed" only for elements that start below the fold once the page
 * has hydrated. Everything renders visible on the server, so nothing is hidden without
 * JavaScript, and nothing above the fold (the LCP) ever starts invisible.
 */
export function useArmed(ref: RefObject<Element | null>): boolean {
  const { reduced } = useMotionPreference();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) setArmed(true);
  }, [ref, reduced]);

  return armed && !reduced;
}

/**
 * A boolean as a MotionValue (1 or 0). Scroll-linked styles combine it with their progress,
 * so a change (for example motion turned off) re-renders the transform through Framer Motion
 * itself. Swapping the `style` prop between motion values and plain values leaves stale transforms.
 */
export function useFlag(flag: boolean): MotionValue<number> {
  const mv = useMotionValue(flag ? 1 : 0);
  useEffect(() => {
    mv.set(flag ? 1 : 0);
  }, [flag, mv]);
  return mv;
}

/** matchMedia as state. False on the server and until mounted. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

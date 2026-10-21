"use client";

import { useSyncExternalStore } from "react";
import { useMotionPreference } from "@/components/shared";

const noopSubscribe = () => () => undefined;

/** False on the server and during hydration, true afterwards. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * True only after hydration and only when motion is allowed (OS setting and the site toggle).
 * The server and the first client render always get the static final state, so the HTML
 * never ships hidden content and hydration never mismatches.
 */
export function useMotionEnabled(): boolean {
  const { reduced } = useMotionPreference();
  const mounted = useMounted();
  return mounted && !reduced;
}

/** Tracks a media query. False on the server. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

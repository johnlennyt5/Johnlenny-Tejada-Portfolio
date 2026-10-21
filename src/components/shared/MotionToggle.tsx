"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/** localStorage key. The inline script in the root layout reads the same key before paint. */
export const MOTION_STORAGE_KEY = "jt-motion";

export type MotionPref = "on" | "off";

/** Non-breaking space, so flex layouts keep the gap between label and state. */
const NBSP = String.fromCharCode(160);

interface MotionPrefValue {
  /** The viewer's explicit choice on this site. */
  pref: MotionPref;
  setPref: (pref: MotionPref) => void;
  /** True when motion should be reduced: the OS asks for it or the viewer turned it off. */
  reduced: boolean;
}

const MotionPrefContext = createContext<MotionPrefValue | null>(null);

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => undefined;
  const mql = window.matchMedia(REDUCE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function readReduced(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(REDUCE_QUERY).matches;
}

/**
 * The OS reduced-motion setting, hydration safe: the server snapshot and the first client
 * render both report false, then React re-renders with the real value right after hydration.
 * (framer-motion's useReducedMotion reads the media query during the first render, which makes
 * any markup that branches on it differ from the static HTML.)
 */
function useOsReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, readReduced, () => false);
}

const loadFeatures = () => import("@/lib/motion-features").then((m) => m.default);

function readStored(): MotionPref | null {
  try {
    const v = window.localStorage.getItem(MOTION_STORAGE_KEY);
    return v === "on" || v === "off" ? v : null;
  } catch {
    return null;
  }
}

function writeStored(pref: MotionPref): void {
  try {
    window.localStorage.setItem(MOTION_STORAGE_KEY, pref);
  } catch {
    // Storage can be blocked (private mode, previews). The choice still applies for this visit.
  }
}

/**
 * Wraps the app in LazyMotion (domAnimation, loaded lazily, strict: use `m.*` components only)
 * and MotionConfig. reducedMotion is "user" by default and "always" once the viewer turns motion off.
 * Also mirrors the choice to <html data-motion="on|off"> for CSS animations.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  const [pref, setPrefState] = useState<MotionPref>("on");
  const osReduced = useOsReducedMotion();

  useEffect(() => {
    const stored = readStored();
    if (stored) setPrefState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = pref;
  }, [pref]);

  const setPref = useCallback((next: MotionPref) => {
    setPrefState(next);
    writeStored(next);
  }, []);

  const value = useMemo<MotionPrefValue>(
    () => ({ pref, setPref, reduced: osReduced || pref === "off" }),
    [pref, setPref, osReduced],
  );

  return (
    <MotionPrefContext.Provider value={value}>
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig reducedMotion={pref === "off" ? "always" : "user"}>{children}</MotionConfig>
      </LazyMotion>
    </MotionPrefContext.Provider>
  );
}

/** Read the motion preference. Works without a provider (falls back to the OS setting). */
export function useMotionPreference(): MotionPrefValue {
  const ctx = useContext(MotionPrefContext);
  const osReduced = useOsReducedMotion();
  if (ctx) return ctx;
  return { pref: "on", setPref: () => undefined, reduced: osReduced };
}

export interface MotionToggleProps {
  className?: string;
  /** Visible text. Defaults to "Motion". The on or off state is shown next to it. */
  label?: string;
  onText?: string;
  offText?: string;
}

/**
 * A visible switch for animations. Persists to localStorage (wrapped in try/catch),
 * sets html[data-motion] and drives MotionConfig through MotionProvider.
 * Unstyled apart from layout; style it with className.
 */
export function MotionToggle({ className, label = "Motion", onText = "on", offText = "off" }: MotionToggleProps) {
  const { pref, setPref } = useMotionPreference();
  const on = pref === "on";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setPref(on ? "off" : "on")}
      className={className ?? "jt-motion-toggle"}
      data-state={on ? "on" : "off"}
    >
      <span>{label}</span>
      <span aria-hidden="true">{NBSP + (on ? onText : offText)}</span>
    </button>
  );
}

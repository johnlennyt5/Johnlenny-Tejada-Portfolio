"use client";

import { useEffect, useRef } from "react";
import { useMotionEnabled } from "./hooks";

interface Parsed {
  prefix: string;
  target: number;
  decimals: number;
  grouped: boolean;
  suffix: string;
}

/** Splits "5,000+" into prefix "", 5000, suffix "+". Returns null when there is no number to count. */
function parse(value: string): Parsed | null {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(value);
  if (!match) return null;
  const [, prefix = "", num = "", suffix = ""] = match;
  const target = Number(num.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  const decimals = num.includes(".") ? (num.split(".")[1]?.length ?? 0) : 0;
  return { prefix, target, decimals, grouped: num.includes(","), suffix };
}

function format(p: Parsed, v: number): string {
  const fixed = v.toFixed(p.decimals);
  const [int = "0", frac] = fixed.split(".");
  const intOut = p.grouped ? int.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : int;
  return `${p.prefix}${intOut}${frac ? `.${frac}` : ""}${p.suffix}`;
}

export interface CounterProps {
  /** The exact evidence value, for example "800+" or "7.3 MB". */
  value: string;
  className?: string;
  /** Tick every time it mounts while on screen (used by the job inspector). */
  always?: boolean;
}

/**
 * Ticks a number up like a test runner the first time it scrolls into view.
 * No animation library: one IntersectionObserver and a short requestAnimationFrame loop that
 * rewrites a single text node. The HTML always carries the exact value, and screen readers read
 * the hidden copy, never the ticking one. Numbers already on screen at load never tick.
 */
export function Counter({ value, className, always = false }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const enabled = useMotionEnabled();

  useEffect(() => {
    if (!enabled) return;
    const parsed = parse(value);
    const el = ref.current;
    const text = el?.firstChild;
    if (!parsed || !el || !text || text.nodeType !== 3) return;
    const set = (s: string) => {
      text.nodeValue = s;
    };
    let frame = 0;
    let first = true;
    const run = () => {
      const start = performance.now();
      const duration = Math.min(1600, 600 + parsed.target / 2);
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        set(t < 1 ? format(parsed, parsed.target * (1 - Math.pow(1 - t, 4))) : value);
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    // The first callback reports the starting position without forcing a layout.
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (first) {
          first = false;
          if (!always && entry.boundingClientRect.top <= window.innerHeight * 0.92) {
            io.disconnect();
            return;
          }
          if (!entry.isIntersecting) set(format(parsed, 0));
        }
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      set(value);
    };
  }, [enabled, value, always]);

  return (
    <>
      <span ref={ref} aria-hidden="true" className={className}>
        {value}
      </span>
      <span className="jt-sr-only">{value}</span>
    </>
  );
}

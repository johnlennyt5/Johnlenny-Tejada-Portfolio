"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { useMedia, useMotionEnabled } from "./hooks";
import type { RunbookStep } from "./runbook-geometry";

type Live = ComponentType<{ steps: RunbookStep[] }>;

/**
 * Keeps the server-rendered static runbook until it is worth animating: desktop width, motion on,
 * and the section within one screen below the viewport. Only then is the pinned stage fetched
 * (its own chunk) and swapped in, so phones never download or hydrate it. The swap happens
 * off screen, and never once the section is already above the viewport.
 */
export function RunbookGate({ steps, children }: { steps: RunbookStep[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useMotionEnabled();
  const wide = useMedia("(min-width: 1024px)");
  const [Live, setLive] = useState<Live | null>(null);
  const want = enabled && wide;

  useEffect(() => {
    if (!want || Live) return;
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || entry.boundingClientRect.top <= 0) return;
        io.disconnect();
        void import("./RunbookLive").then((mod) => {
          if (!cancelled) setLive(() => mod.RunbookLive);
        });
      },
      { rootMargin: "0px 0px 100% 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [want, Live]);

  return <div ref={ref}>{want && Live ? <Live steps={steps} /> : children}</div>;
}

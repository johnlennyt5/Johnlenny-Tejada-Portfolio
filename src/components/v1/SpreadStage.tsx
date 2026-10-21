"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionPreference } from "@/components/shared/MotionToggle";

/**
 * The pinned, scroll-driven spread ships in its own chunk, fetched only on wide screens and
 * only once the reader is within about a screen and a half of the figures. Until then (and
 * always on phones and under reduced motion) the figures are a plain server-rendered grid,
 * so none of the pinning work competes with the first paint or with hydration of the cover.
 */
const PinnedSpread = lazy(() => import("./PinnedSpread").then((mod) => ({ default: mod.PinnedSpread })));

export interface SpreadStageProps {
  head: ReactNode;
  plates: ReactNode[];
  note?: ReactNode;
}

function GridSpread({ head, plates, note }: SpreadStageProps) {
  return (
    <div>
      {head}
      <div className="v1-wrap">
        <div className="grid grid-cols-1 gap-x-[var(--v1-gap)] gap-y-12 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {plates}
        </div>
        {note ? <div className="mt-12">{note}</div> : null}
      </div>
    </div>
  );
}

/** Picks the layout of the figures: a plain grid first (and always on phones), the pinned spread when there is room. */
export function SpreadStage(props: SpreadStageProps) {
  const { reduced } = useMotionPreference();
  const anchor = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = anchor.current;
    if (!el || near || reduced || !wide) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, reduced, wide]);

  const grid = <GridSpread {...props} />;
  return (
    <div ref={anchor}>
      {!wide || reduced || !near ? (
        grid
      ) : (
        <Suspense fallback={grid}>
          <PinnedSpread {...props} />
        </Suspense>
      )}
    </div>
  );
}

"use client";

import { m, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SCROLL_SPRING } from "./motion";
import type { SpreadStageProps } from "./SpreadStage";

/**
 * Wide screens only, loaded on demand by SpreadStage: the section pins and vertical
 * scroll slides the plates sideways, each number counting up once as it arrives.
 */
export function PinnedSpread({ head, plates, note }: SpreadStageProps) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const dist = useMotionValue(0);
  const [index, setIndex] = useState(1);
  const count = plates.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const d = Math.max(0, el.scrollWidth - el.clientWidth);
      setDistance(d);
      dist.set(d);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dist]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, SCROLL_SPRING);
  const x = useTransform(() => -smooth.get() * dist.get());
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIndex(Math.min(count, Math.max(1, Math.round(v * (count - 1)) + 1)));
  });

  return (
    <div ref={outer} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-[var(--v1-mast)] flex h-[calc(100vh-var(--v1-mast))] flex-col overflow-hidden">
        <div className="shrink-0">{head}</div>
        <div className="flex min-h-0 flex-1 flex-col justify-center py-8">
          <div ref={track} className="overflow-hidden">
            <m.ol
              className="flex w-max gap-[clamp(32px,5vw,96px)] pl-[max(var(--v1-gutter),calc((100vw-1440px)/2+var(--v1-gutter)))] pr-[16vw]"
              style={{ x }}
            >
              {plates.map((plate, i) => (
                <li key={i} className="w-[min(29vw,440px)] shrink-0">
                  {plate}
                </li>
              ))}
            </m.ol>
          </div>
          <div className="v1-wrap">
            <div className="mt-8 flex items-center gap-4" aria-hidden="true">
              <span className="v1-label v1-tabular text-fg">
                {String(index).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
              <span className="relative block h-px flex-1 bg-line">
                <m.span className="v1-rule v1-rule-accent absolute inset-0 h-[3px] -translate-y-px" style={{ scaleX: smooth }} />
              </span>
            </div>
            {note ? <div className="mt-6">{note}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

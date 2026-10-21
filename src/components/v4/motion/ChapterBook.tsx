"use client";

import { m, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MotionFeatures } from "@/components/shared/MotionFeatures";
import { useFlag, useReduced } from "./hooks";

export interface ChapterMark {
  id: string;
  numeral: string;
  years: string;
}

/** The reading line: a chapter counts as "reached" once its top passes this share of the viewport. */
const LINE = 0.55;

/**
 * The year spine. A terracotta thread fills down the left edge of the chapters as you read,
 * each chapter's bead fills when the thread reaches it, and (on wide screens) a sticky label
 * crossfades to the current chapter and its years.
 * Reduced motion: the thread still fills (it is information) but jumps chapter by chapter.
 */
export function ChapterBook({ marks, children }: { marks: ChapterMark[]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const [active, setActive] = useState(-1);
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${LINE * 100}%`, `end ${LINE * 100}%`] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.4 });
  const jump = useMotionValue(0);
  const still = useFlag(reduced);
  const fill = useTransform([smooth, jump, still], ([sm, j, s]: number[]) => (s ? (j ?? 0) : (sm ?? 0)));

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = marks
      .map((mk) => document.getElementById(mk.id))
      .filter((el): el is HTMLElement => el !== null);

    const update = () => {
      const line = window.innerHeight * LINE;
      let idx = -1;
      els.forEach((el, i) => {
        const reached = el.getBoundingClientRect().top <= line;
        el.dataset.reached = reached ? "true" : "false";
        if (reached) idx = i;
      });
      setActive(idx);
      const rootRect = root.getBoundingClientRect();
      const current = idx >= 0 ? els[idx] : undefined;
      if (current && rootRect.height > 0) {
        const beadY = current.getBoundingClientRect().top - rootRect.top + 120;
        jump.set(Math.min(1, Math.max(0, beadY / rootRect.height)));
      } else {
        jump.set(0);
      }
    };

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    // First read on the next frame, not during hydration, so it never forces a layout of its own.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [marks, jump]);

  return (
    <MotionFeatures>
      <div ref={ref} className="v4-book">
        <div className="v4-book-aside" aria-hidden="true">
          <div className="v4-book-label">
            {marks.map((mk, i) => (
              <m.div
                key={mk.id}
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, y: reduced || i === active ? 0 : i < active ? -18 : 18 }}
                transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="v4-numeral block text-4xl leading-none">{mk.numeral}</span>
                <span className="v4-smallcaps mt-2 block text-base text-muted">{mk.years}</span>
              </m.div>
            ))}
          </div>
        </div>
        <div className="v4-thread" aria-hidden="true">
          <div className="v4-thread-track" />
          <m.div className="v4-thread-fill" style={{ scaleY: fill }} />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </MotionFeatures>
  );
}

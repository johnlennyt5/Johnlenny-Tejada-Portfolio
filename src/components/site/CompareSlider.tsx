"use client";

import { useEffect, useRef, useState } from "react";
import { solveCompare } from "@/content/showcase";

/**
 * Before and after: drag (or use arrow keys on) the handle to wipe from the manual process to
 * the automated one. On first view it sweeps once to show it can be dragged.
 */
export function CompareSlider() {
  const [which, setWhich] = useState(0);
  const [split, setSplit] = useState(50);
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || touched.current) return;
        io.disconnect();
        const start = performance.now();
        const run = (t: number) => {
          if (touched.current) return;
          const p = Math.min((t - start) / 2200, 1);
          // 50 -> 82 -> 50: a gentle hint that the handle moves.
          setSplit(50 + Math.sin(p * Math.PI) * 32);
          if (p < 1) raf = requestAnimationFrame(run);
        };
        raf = requestAnimationFrame(run);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const c = solveCompare[which]!;

  return (
    <div>
      <div className="compare-tabs" role="tablist" aria-label="Automation examples">
        {solveCompare.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={i === which}
            onClick={() => {
              setWhich(i);
              setSplit(50);
            }}
          >
            {x.title.en}
          </button>
        ))}
      </div>

      <div className="compare" ref={root} style={{ ["--split" as string]: `${split}%` }}>
        <div className="cmp-side cmp-manual">
          <span className="cmp-label">Before: manual</span>
          <div className="cmp-value">{c.manual.value}</div>
          <div className="cmp-unit">{c.manual.unit.en}</div>
          <ol className="cmp-steps">
            {c.manual.steps.map((s, i) => (
              <li key={s.en}>
                <span>0{i + 1}</span>
                {s.en}
              </li>
            ))}
          </ol>
        </div>

        <div className="cmp-side cmp-auto" aria-hidden={split > 96 ? true : undefined}>
          <span className="cmp-label">After: automated</span>
          <div className="cmp-value">{c.auto.value}</div>
          <div className="cmp-unit">{c.auto.unit.en}</div>
          <ol className="cmp-steps">
            {c.auto.steps.map((s, i) => (
              <li key={s.en}>
                <span>0{i + 1}</span>
                {s.en}
              </li>
            ))}
          </ol>
        </div>

        <input
          className="cmp-range"
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(split)}
          aria-label="Compare manual and automated"
          onChange={(e) => {
            touched.current = true;
            setSplit(Number(e.target.value));
          }}
          onPointerDown={() => {
            touched.current = true;
          }}
        />
        <div className="cmp-handle" aria-hidden="true" />
      </div>
    </div>
  );
}

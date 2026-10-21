"use client";

import { m, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef, type CSSProperties } from "react";
import {
  BOX_H,
  BOX_W,
  CENTERS,
  END,
  H,
  START,
  W,
  connectorPoints,
  pathData,
  polyline,
  stepNum,
  type RunbookStep,
} from "./runbook-geometry";

function StepText({ step, i, n, progress }: { step: RunbookStep; i: number; n: number; progress: MotionValue<number> }) {
  const s = i / n;
  const e = (i + 1) / n;
  const first = i === 0;
  const last = i === n - 1;
  const range = [s - 0.025, s + 0.01, e - 0.01, e + 0.025];
  const opacity = useTransform(progress, range, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  const y = useTransform(progress, range, [first ? 0 : 28, 0, 0, last ? 0 : -28]);
  return (
    <m.li style={{ opacity, y }} className="max-w-xl">
      <div className="flex items-end gap-4">
        <span className="v3-step-num" aria-hidden="true">
          {stepNum(i)}
        </span>
        <span className="pb-1 font-mono text-xs text-muted">seen in {step.source}</span>
      </div>
      <h3 className="mt-3 font-display text-3xl leading-none font-bold tracking-tight sm:text-4xl">{step.title}</h3>
      <p className="mt-4 text-lg leading-relaxed">{step.detail}</p>
    </m.li>
  );
}

function StateNode({ i, n, title, progress }: { i: number; n: number; title: string; progress: MotionValue<number> }) {
  const s = i / n;
  const e = (i + 1) / n;
  const running = useTransform(progress, [s, s + 0.01, e - 0.01, e], [0, 1, 1, 0]);
  const done = useTransform(progress, [e - 0.01, e], [0, 1]);
  const [cx, cy] = CENTERS[i] as [number, number];
  const x = cx - BOX_W / 2;
  const y = cy - BOX_H / 2;
  return (
    <g>
      <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={12} fill="var(--c-bg)" stroke="var(--c-line-strong)" strokeWidth={1.5} />
      <m.rect x={x} y={y} width={BOX_W} height={BOX_H} rx={12} fill="none" stroke="var(--c-run)" strokeWidth={2.5} style={{ opacity: running }} />
      <m.rect x={x} y={y} width={BOX_W} height={BOX_H} rx={12} fill="none" stroke="var(--c-ok)" strokeWidth={2} style={{ opacity: done }} />
      <text x={x + 16} y={y + 27} className="v3-sm-num" fontSize={12} fill="var(--c-ok)">
        {stepNum(i)}
      </text>
      <text x={x + 16} y={y + 50} fontSize={14} fontWeight={600} fill="var(--c-fg)">
        {title}
      </text>
    </g>
  );
}

/**
 * The pinned runbook stage. Loaded on demand by RunbookGate (desktop, motion on, section close):
 * the section pins for a few screens while the JT token walks the six-step state machine and the
 * step text crossfades.
 */
export function RunbookLive({ steps }: { steps: RunbookStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const n = steps.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });

  const points = connectorPoints(n);
  const { cum, total, at } = polyline(points);
  // Token sits on each activity for the middle of its scroll slice.
  const pStops = [0];
  const dStops = [0];
  for (let i = 0; i < n; i += 1) {
    const c = cum[i + 1] as number;
    pStops.push((i + 0.25) / n, (i + 0.75) / n);
    dStops.push(c, c);
  }
  pStops.push(1);
  dStops.push(total);
  const dist = useTransform(progress, pStops, dStops);
  const tx = useTransform(dist, (d) => at(d)[0]);
  const ty = useTransform(dist, (d) => at(d)[1]);
  const drawn = useTransform(dist, (d) => d / total);
  const d = pathData(points);

  return (
    <div ref={ref} className="v3-pin" data-pin="on" style={{ "--steps": n } as CSSProperties}>
      <div className="v3-pin-stage">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
          <ol className="v3-steps">
            {steps.map((s, i) => (
              <StepText key={s.title} step={s} i={i} n={n} progress={progress} />
            ))}
          </ol>
          <div aria-hidden="true">
            <svg viewBox={`0 0 ${W} ${H}`} className="v3-sm block h-auto w-full max-w-[30rem]" focusable="false">
              <path d={d} fill="none" stroke="var(--c-line-strong)" strokeWidth={2} strokeDasharray="6 6" />
              <m.path d={d} fill="none" stroke="var(--c-ok)" strokeWidth={2.5} style={{ pathLength: drawn }} />
              <circle cx={START[0]} cy={START[1]} r={11} fill="var(--c-bg)" stroke="var(--c-ok)" strokeWidth={2} />
              <circle cx={END[0]} cy={END[1]} r={13} fill="var(--c-bg)" stroke="var(--c-ok)" strokeWidth={4.5} />
              {steps.map((s, i) => (
                <StateNode key={s.title} i={i} n={n} title={s.title} progress={progress} />
              ))}
              <m.g style={{ x: tx, y: ty }}>
                <rect x={-15} y={-15} width={30} height={30} rx={7} fill="var(--c-bg)" stroke="var(--c-ok)" strokeWidth={2} />
                <text x={0} y={4.5} textAnchor="middle" fontSize={11} fontWeight={800} className="v3-sm-num" fill="var(--c-ok)">
                  JT
                </text>
              </m.g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

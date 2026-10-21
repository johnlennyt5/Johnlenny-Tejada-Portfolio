import type { CSSProperties } from "react";
import { BOX_H, BOX_W, CENTERS, END, H, START, W, connectorPoints, pathData, stepNum, type RunbookStep } from "./runbook-geometry";
import { RunbookGate } from "./RunbookGate";

export type { RunbookStep } from "./runbook-geometry";

/** The finished state machine: every activity done, the connector fully drawn. Server rendered. */
function StaticDiagram({ steps }: { steps: RunbookStep[] }) {
  const d = pathData(connectorPoints(steps.length));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="v3-sm block h-auto w-full max-w-[30rem]" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="var(--c-ok)" strokeWidth={2.5} />
      <circle cx={START[0]} cy={START[1]} r={11} fill="var(--c-bg)" stroke="var(--c-ok)" strokeWidth={2} />
      <circle cx={END[0]} cy={END[1]} r={13} fill="var(--c-bg)" stroke="var(--c-ok)" strokeWidth={4.5} />
      {steps.map((s, i) => {
        const [cx, cy] = CENTERS[i] as [number, number];
        const x = cx - BOX_W / 2;
        const y = cy - BOX_H / 2;
        return (
          <g key={s.title}>
            <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={12} fill="var(--c-bg)" stroke="var(--c-ok)" strokeWidth={2} />
            <text x={x + 16} y={y + 27} className="v3-sm-num" fontSize={12} fill="var(--c-ok)">
              {stepNum(i)}
            </text>
            <text x={x + 16} y={y + 50} fontSize={14} fontWeight={600} fill="var(--c-fg)">
              {s.title}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * The runbook. The HTML is a static list next to the all-done diagram; that is what phones,
 * reduced motion and the first paint get, with no client code. On desktop with motion on,
 * RunbookGate fetches the pinned stage (its own chunk) only as the section approaches.
 */
export function RunbookStage({ steps: all }: { steps: RunbookStep[] }) {
  const steps = all.slice(0, CENTERS.length);
  return (
    <RunbookGate steps={steps}>
      <div className="v3-pin" data-pin="off" style={{ "--steps": steps.length } as CSSProperties}>
        <div className="v3-pin-stage">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
            <ol className="v3-steps grid gap-12">
              {steps.map((s, i) => (
                <li key={s.title} className="max-w-xl">
                  <div className="flex items-end gap-4">
                    <span className="v3-step-num" aria-hidden="true">
                      {stepNum(i)}
                    </span>
                    <span className="pb-1 font-mono text-xs text-muted">seen in {s.source}</span>
                  </div>
                  <h3 className="mt-3 font-display text-3xl leading-none font-bold tracking-tight sm:text-4xl">{s.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed">{s.detail}</p>
                </li>
              ))}
            </ol>
            <div className="order-first lg:order-none lg:sticky lg:top-8 lg:self-start" aria-hidden="true">
              <StaticDiagram steps={steps} />
            </div>
          </div>
        </div>
      </div>
    </RunbookGate>
  );
}

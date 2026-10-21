"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { StatusPill, pad2 } from "../ui";
import { Counter } from "./Counter";
import { useMedia } from "./hooks";

export interface InspectorJob {
  /** Element id of the job card this panel follows. */
  target: string;
  name: string;
  role: string;
  dates: string;
  state: "running" | "done";
  metrics: { value: string; label: string; evidence: string }[];
  summary: string;
  steps: string[];
}

function Panel({ job, n }: { job: InspectorJob; n: number }) {
  return (
    <div className="v3-term overflow-hidden">
      <div className="v3-term-bar">
        <i />
        <i />
        <i />
        <span className="ml-2">inspector / job-{pad2(n)}</span>
      </div>
      <div className="relative p-6">
        <span className="v3-ghost absolute -top-2 right-3 text-[7.5rem]">{pad2(n)}</span>
        <StatusPill state={job.state} />
        <p className="relative mt-4 font-display text-5xl leading-none font-bold tracking-tight">{job.name}</p>
        <p className="relative mt-2 font-mono text-xs text-muted">
          {job.role}, {job.dates}
        </p>
        {job.metrics.length > 0 ? (
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
            {job.metrics.map((m) => (
              <div key={m.evidence} className="flex flex-col-reverse">
                <dt className="mt-1 font-mono text-[0.6875rem] text-muted">{m.label}</dt>
                <dd className="v3-metric-value v3-tone-ok">
                  <Counter value={m.value} always />
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-6 text-sm leading-relaxed text-muted">{job.summary}</p>
        )}
        {job.steps.length > 0 ? (
          <>
            <p className="v3-eyebrow mt-7">Process map</p>
            <ol className="v3-mini mt-3">
              {job.steps.map((title, i) => (
                <li key={title} className="v3-out v3-anim" style={{ "--delay": `${0.08 * i + 0.1}s` } as CSSProperties}>
                  <span className="mr-2 font-mono text-[0.6875rem] v3-tone-ok">{pad2(i + 1)}</span>
                  {title}
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A sticky inspector next to the job list (extra-wide screens only). Whichever job card crosses
 * the middle of the screen becomes the active transaction, and the inspector swaps to its panel.
 * It takes plain data, not pre-rendered panels, and renders nothing below 1280px, so phones get no
 * extra DOM or payload from it. It repeats what the cards say, so it is hidden from assistive tech.
 * The swap is a CSS entrance (opacity and transform), switched off with motion.
 */
export function JobInspector({ jobs }: { jobs: InspectorJob[] }) {
  const [active, setActive] = useState(0);
  const wide = useMedia("(min-width: 1280px)");

  useEffect(() => {
    if (!wide) return;
    const targets = jobs.map((j) => j.target);
    const els = targets.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = targets.indexOf(entry.target.id);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [jobs, wide]);

  const job = jobs[active];
  if (!wide || !job) return null;
  return (
    <div aria-hidden="true" className="relative">
      <div key={active} className="v3-out v3-anim">
        <Panel job={job} n={active + 1} />
      </div>
    </div>
  );
}

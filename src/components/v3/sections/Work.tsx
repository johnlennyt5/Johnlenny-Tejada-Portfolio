import Link from "next/link";
import { projects, type Project } from "@/content";
import { routes } from "@/lib/site";
import { JobInspector, type InspectorJob } from "../motion/JobInspector";
import { Node } from "../motion/Node";
import { Reveal } from "../motion/Reveal";
import { SectionHeading, StatusPill, countWord, pad2 } from "../ui";

const LANE: Record<string, string> = { automation: "automation lane", fullstack: "full-stack lane" };

export const jobState = (p: Project) => (p.dates.end === null ? "running" : "done") as "running" | "done";

function JobCard({ project, n }: { project: Project; n: number }) {
  const state = jobState(project);
  return (
    <article id={`job-${project.slug}`} className="v3-card v3-card-hover scroll-mt-24 p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-muted">
        <span className="font-bold text-fg">JOB-{pad2(n)}</span>
        <StatusPill state={state}>{state === "running" ? "running" : "done"}</StatusPill>
        <span>{project.dates.label}</span>
      </div>
      <h3 className="mt-4 font-display text-4xl leading-none font-bold tracking-tight sm:text-5xl">
        <Link href={routes.work("v3", project.slug)} className="v3-stretch no-underline">
          {project.name}
        </Link>
      </h3>
      <p className="mt-2 font-mono text-sm v3-tone-ok">{project.tagline}</p>
      <p className="mt-4 leading-relaxed">{project.oneLiner}</p>
      {project.metrics.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.name} numbers`}>
          {project.metrics.map((m) => (
            <li key={m.evidence} className="v3-chip">
              <strong>{m.value}</strong> {m.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line pt-4 font-mono text-xs text-muted">
        <span>
          {project.role} / {project.identities.map((i) => LANE[i]).join(", ")}
        </span>
        <span className="v3-tone-ok" aria-hidden="true">
          open run log &rarr;
        </span>
      </div>
    </article>
  );
}

/** Plain data for the inspector (it renders its own panels on extra-wide screens only). */
function inspectorJob(project: Project): InspectorJob {
  return {
    target: `job-${project.slug}`,
    name: project.name,
    role: project.role,
    dates: project.dates.label,
    state: jobState(project),
    metrics: project.metrics.slice(0, 4).map((m) => ({ value: m.value, label: m.label, evidence: m.evidence })),
    summary: project.summary,
    steps: project.caseStudy.decisions.slice(0, 4).map((d) => d.title),
  };
}

export function Work({ id, index }: { id: string; index: string }) {
  const list = [...projects].sort((a, b) => a.order - b.order);
  return (
    <Node
      id={id}
      index={index}
      label="Job queue"
      kind="Multi-instance"
      heading={
        <SectionHeading
          id={id}
          index={index}
          lead={
            <p>
              {countWord(list.length, true)} builds, each one written up as a run log, from the trigger to the caveats.
            </p>
          }
        >
          Shipped work, <em>logged like a robot run.</em>
        </SectionHeading>
      }
    >
      <div className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <ol className="grid gap-6" aria-label="Projects">
          {list.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={0.04}>
              <JobCard project={p} n={i + 1} />
            </Reveal>
          ))}
        </ol>
        <div className="hidden xl:block">
          <div className="sticky top-8">
            <JobInspector jobs={list.map(inspectorJob)} />
          </div>
        </div>
      </div>
    </Node>
  );
}

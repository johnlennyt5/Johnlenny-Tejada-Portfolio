import Link from "next/link";
import { CopyEmail } from "@/components/shared/CopyEmail";
import { ResumeButton } from "@/components/shared/ResumeButton";
import { diagramsById } from "@/components/shared/diagrams";
import { projects, type Project } from "@/content";
import { routes } from "@/lib/site";
import { Frame } from "./Frame";
import { Counter } from "./motion/Counter";
import { Flow } from "./motion/Flow";
import { Node } from "./motion/Node";
import { Reveal } from "./motion/Reveal";
import { Log, Prompt, SectionHeading, StatusPill, Window, pad2 } from "./ui";
import { jobState } from "./sections/Work";

const TEAM: Record<Project["team"], string> = {
  solo: "Solo build",
  team: "Team build",
  "co-founder": "Co-founder",
};

const LANE: Record<string, string> = { automation: "Automation", fullstack: "Full-stack" };

interface Part {
  id: string;
  label: string;
  title: string;
  kind: string;
}

/**
 * A case study as an Orchestrator run log: run header, process map, then Trigger, Inputs,
 * Steps, Exceptions, Tradeoffs, Result, Tests, Caveats and Dependencies as nodes on the canvas.
 * Empty arrays render nothing: no filler.
 */
export function CaseStudy({ project }: { project: Project }) {
  const cs = project.caseStudy;
  const ordered = [...projects].sort((a, b) => a.order - b.order);
  const at = ordered.findIndex((p) => p.slug === project.slug);
  const n = at + 1;
  const prev = ordered[(at - 1 + ordered.length) % ordered.length];
  const next = ordered[(at + 1) % ordered.length];
  const state = jobState(project);
  const DiagramView = project.diagram ? diagramsById[project.diagram] : null;

  const parts: Part[] = [
    { id: "trigger", label: "Trigger", title: "What started the run", kind: "Start event" },
    ...(cs.constraints.length ? [{ id: "inputs", label: "Inputs", title: "Inputs and constraints", kind: "Data input" }] : []),
    ...(cs.decisions.length ? [{ id: "steps", label: "Steps", title: "Steps and decisions", kind: "Sequence" }] : []),
    ...(cs.whatBroke.length ? [{ id: "exceptions", label: "Exceptions", title: "What broke", kind: "Error boundary" }] : []),
    ...(cs.tradeoffs.length ? [{ id: "tradeoffs", label: "Tradeoffs", title: "Tradeoffs", kind: "Gateway" }] : []),
    ...(cs.results.length ? [{ id: "result", label: "Result", title: "Result", kind: "Data output" }] : []),
    ...(cs.tests.length ? [{ id: "tests", label: "Tests", title: "Tests", kind: "Validation" }] : []),
    ...(cs.caveats.length ? [{ id: "caveats", label: "Caveats", title: "Caveats", kind: "Annotation" }] : []),
    { id: "stack", label: "Dependencies", title: "Dependencies", kind: "Packages" },
  ];
  const items = [{ id: "run", label: "Run header" }, ...parts.map((p) => ({ id: p.id, label: p.label }))];
  const ix = (id: string) => pad2(items.findIndex((it) => it.id === id) + 1);
  const part = (id: string) => parts.find((p) => p.id === id) as Part;
  const heading = (id: string) => (
    <SectionHeading id={id} index={ix(id)}>
      {part(id).title}
    </SectionHeading>
  );

  return (
    <Frame
      queue={`run-log/${project.slug}`}
      items={items}
      back={{ href: `${routes.home("v3")}#work`, label: "All jobs" }}
    >
      <main id="main" tabIndex={-1} className="outline-none">
        <section
          id="run"
          aria-labelledby="run-title"
          className="v3-node px-4 pt-8 pb-12 sm:px-8 lg:px-14 lg:pt-12"
        >
          <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href={routes.home("v3")} className="v3-link inline-flex min-h-9 items-center">
                  portfolio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`${routes.home("v3")}#work`} className="v3-link inline-flex min-h-9 items-center">
                  jobs
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-fg">
                {project.slug}
              </li>
            </ol>
          </nav>

          <Prompt cmd={`orchestrator logs job-${pad2(n)}`} typed delay={0.1} className="mt-6" />
          <p className="v3-eyebrow mt-6 flex flex-wrap items-center gap-3">
            <span>Run log</span>
            <span aria-hidden="true">/</span>
            <span>JOB-{pad2(n)}</span>
            <StatusPill state={state}>{state === "running" ? "running" : "done"}</StatusPill>
          </p>
          <h1 id="run-title" className="v3-hero-name mt-4 max-w-[14ch] text-[clamp(3rem,1.5rem+7vw,8rem)]">
            {project.name}
          </h1>
          <p className="mt-4 font-mono text-base font-bold sm:text-xl v3-tone-ok">{project.tagline}</p>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed sm:text-xl">{project.oneLiner}</p>

          <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6 font-mono text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted">role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">team</dt>
              <dd className="mt-1">{TEAM[project.team]}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">window</dt>
              <dd className="mt-1">{project.dates.label}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">lane</dt>
              <dd className="mt-1">{project.identities.map((i) => LANE[i]).join(", ")}</dd>
            </div>
          </dl>

          {project.links.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-3">
              {project.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="v3-btn">
                    {l.label} <span aria-hidden="true">{"↗"}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {project.linkNote ? <p className="mt-4 font-mono text-sm text-muted">{`// ${project.linkNote}`}</p> : null}

          {project.metrics.length > 0 ? (
            <dl className="mt-10 grid max-w-5xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
              {project.metrics.map((m) => (
                <div key={m.evidence} className="flex flex-col-reverse border-l-2 border-[color:var(--c-ok)] pl-4">
                  <dt className="mt-2 font-mono text-xs leading-snug text-muted">{m.label}</dt>
                  <dd className="v3-metric-value text-[clamp(2.25rem,1.6rem+2.4vw,3.75rem)]">
                    <Counter value={m.value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>

        {DiagramView ? (
          <div className="v3-cv px-4 pb-8 sm:px-8 lg:px-14">
            <Reveal>
              <Window title="process-map.svg" className="max-w-6xl" bodyClassName="p-4 sm:p-8">
                <DiagramView caption={`${project.name}: how the pieces connect.`} />
              </Window>
            </Reveal>
          </div>
        ) : null}

        <div className="px-4 pt-16 pb-24 sm:px-8 lg:px-14">
          <Flow>
            <div className="grid max-w-5xl gap-28 sm:gap-36">
              <Node id="trigger" index={ix("trigger")} label="Trigger" kind={part("trigger").kind} shape="event" heading={heading("trigger")}>
                <p className="mt-8 max-w-3xl text-xl leading-relaxed sm:text-2xl">{cs.problem}</p>
              </Node>

              {cs.constraints.length ? (
                <Node id="inputs" index={ix("inputs")} label="Inputs" kind={part("inputs").kind} heading={heading("inputs")}>
                  <ul className="mt-8 grid max-w-3xl gap-3">
                    {cs.constraints.map((c) => (
                      <li key={c} className="grid grid-cols-[1.5rem_1fr] gap-2 text-lg leading-relaxed">
                        <span className="font-mono v3-tone-queue" aria-hidden="true">
                          &rsaquo;
                        </span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </Node>
              ) : null}

              {cs.decisions.length ? (
                <Node id="steps" index={ix("steps")} label="Steps" kind={part("steps").kind} heading={heading("steps")}>
                  <ol className="mt-10 grid gap-5">
                    {cs.decisions.map((d, i) => (
                      <Reveal as="li" key={d.title} delay={0.03}>
                        <article className="v3-card p-5 sm:p-6" aria-labelledby={`step-${i}`}>
                          <p className="v3-tag v3-tone-ok">[step {pad2(i + 1)}]</p>
                          <h3 id={`step-${i}`} className="mt-2 font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                            {d.title}
                          </h3>
                          <p className="mt-3 max-w-3xl leading-relaxed">{d.detail}</p>
                        </article>
                      </Reveal>
                    ))}
                  </ol>
                </Node>
              ) : null}

              {cs.whatBroke.length ? (
                <Node id="exceptions" index={ix("exceptions")} label="Exceptions" kind={part("exceptions").kind} heading={heading("exceptions")}>
                  <ol className="mt-10 grid gap-5 md:grid-cols-2">
                    {cs.whatBroke.map((d, i) => (
                      <Reveal as="li" key={d.title} delay={(i % 2) * 0.06}>
                        <article
                          className="v3-card h-full border-[color:var(--c-exc)] p-5 sm:p-6"
                          aria-labelledby={`exc-${i}`}
                        >
                          <p className="v3-tag v3-tone-exc">[exception]</p>
                          <h3 id={`exc-${i}`} className="mt-2 font-display text-2xl leading-tight font-bold tracking-tight">
                            {d.title}
                          </h3>
                          <p className="mt-3 leading-relaxed">{d.detail}</p>
                        </article>
                      </Reveal>
                    ))}
                  </ol>
                </Node>
              ) : null}

              {cs.tradeoffs.length ? (
                <Node id="tradeoffs" index={ix("tradeoffs")} label="Tradeoffs" kind={part("tradeoffs").kind} heading={heading("tradeoffs")}>
                  <Log
                    className="mt-8 max-w-3xl text-lg"
                    entries={cs.tradeoffs.map((t) => ({ key: t, tag: "trade", tone: "run" as const, body: t }))}
                  />
                </Node>
              ) : null}

              {cs.results.length ? (
                <Node id="result" index={ix("result")} label="Result" kind={part("result").kind} heading={heading("result")}>
                  <Window title={`job-${pad2(n)}.result`} className="mt-8 max-w-4xl">
                    <Log entries={cs.results.map((r) => ({ key: r, tag: " ok ", tone: "ok" as const, body: r }))} />
                  </Window>
                </Node>
              ) : null}

              {cs.tests.length ? (
                <Node id="tests" index={ix("tests")} label="Tests" kind={part("tests").kind} heading={heading("tests")}>
                  <Window title="test-runner" className="mt-8 max-w-4xl">
                    <Prompt cmd="run tests --summary" />
                    <Log
                      className="mt-3"
                      entries={cs.tests.map((t) => ({ key: t, tag: "test", tone: "queue" as const, body: t }))}
                    />
                  </Window>
                </Node>
              ) : null}

              {cs.caveats.length ? (
                <Node id="caveats" index={ix("caveats")} label="Caveats" kind={part("caveats").kind} heading={heading("caveats")}>
                  <Log
                    className="mt-8 max-w-3xl text-lg"
                    entries={cs.caveats.map((c) => ({ key: c, tag: "note", tone: "muted" as const, body: c }))}
                  />
                </Node>
              ) : null}

              <Node id="stack" index={ix("stack")} label="Dependencies" kind={part("stack").kind} shape="event" heading={heading("stack")}>
                <ul className="mt-8 flex max-w-4xl flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <li key={s} className="v3-chip text-sm">
                      <strong>{s}</strong>
                    </li>
                  ))}
                </ul>

                <Reveal className="mt-16">
                  <Window title={`job-${pad2(n)}: ${state === "running" ? "still running" : "run complete"}`}>
                    <p className="flex flex-wrap items-center gap-3 font-mono text-sm">
                      <StatusPill state={state}>{state === "running" ? "running" : "done"}</StatusPill>
                      <span className="text-muted">
                        {state === "running" ? "This job is still running. The log grows with it." : "End of run log."}
                      </span>
                    </p>
                    <nav aria-label="More run logs" className="mt-6 grid gap-3 sm:grid-cols-2">
                      {prev ? (
                        <Link href={routes.work("v3", prev.slug)} className="v3-card v3-card-hover block p-4 no-underline">
                          <span className="block font-mono text-xs text-muted">&larr; previous job</span>
                          <span className="mt-1 block font-display text-2xl font-bold">{prev.name}</span>
                        </Link>
                      ) : null}
                      {next ? (
                        <Link href={routes.work("v3", next.slug)} className="v3-card v3-card-hover block p-4 text-right no-underline">
                          <span className="block font-mono text-xs text-muted">next job &rarr;</span>
                          <span className="mt-1 block font-display text-2xl font-bold">{next.name}</span>
                        </Link>
                      ) : null}
                    </nav>
                    <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
                      <CopyEmail className="v3-btn v3-btn-primary" label="Copy email address" copiedLabel="Copied to clipboard" />
                      <ResumeButton className="v3-btn">Download resume (PDF)</ResumeButton>
                      <Link href={`${routes.home("v3")}#work`} className="v3-btn">
                        All jobs
                      </Link>
                    </div>
                  </Window>
                </Reveal>
              </Node>
            </div>
          </Flow>
        </div>
      </main>
    </Frame>
  );
}

export default CaseStudy;

import Link from "next/link";
import type { ReactNode } from "react";
import { diagramsById } from "@/components/shared/diagrams";
import type { Project } from "@/content";
import { routes } from "@/lib/site";
import { ProjectArtifact } from "./artifacts/Artifacts";
import { Footer, Header } from "./Header";
import { ReadingThread } from "./motion/ReadingThread";
import { RiseWords } from "./motion/RiseWords";
import { Settle } from "./motion/Settle";
import { Letter } from "./Parts";
import { roman, teamLabel } from "./story";
import { orderedProjects } from "./Work";

const MARKS = ["*", "†", "‡", "§", "¶", "‖"];

function Part({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t border-[var(--c-rule)] pt-10 pb-12">
      <RiseWords as="h2" id={`${id}-title`} text={title} className="v4-italic text-[clamp(2rem,4.6vw,3.25rem)] leading-[1.02]" />
      <div className="mt-6">{children}</div>
    </section>
  );
}

function DashList({ items }: { items: string[] }) {
  return (
    <ul className="v4-list-dash max-w-[42rem] space-y-3 p-0 text-lg leading-relaxed">
      {items.map((i) => (
        <li key={i} className="list-none">
          {i}
        </li>
      ))}
    </ul>
  );
}

function ProofList({ items }: { items: string[] }) {
  return (
    <ul className="max-w-[42rem] list-none space-y-3 p-0 text-lg leading-relaxed">
      {items.map((i) => (
        <li key={i} className="flex gap-3">
          <svg viewBox="0 0 20 20" className="mt-1.5 h-5 w-5 shrink-0 text-accent-2" aria-hidden="true" focusable="false">
            <path d="M3.5 10.5 L8 15 L16.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}

/** A case study set like a chapter of a book: title page, margin notes, numbered decisions, errata and fine print. */
export function CaseStudy({ project }: { project: Project }) {
  const cs = project.caseStudy;
  const index = Math.max(0, orderedProjects.findIndex((p) => p.slug === project.slug));
  const plate = roman(index + 1);
  const total = orderedProjects.length;
  const prev = orderedProjects[(index - 1 + total) % total];
  const next = orderedProjects[(index + 1) % total];
  const DiagramView = project.diagram ? diagramsById[project.diagram] : null;

  return (
    <>
      <ReadingThread />
      <Header />
      <main id="main">
        <section aria-labelledby="cs-title" className="v4-wrap pt-8 pb-14 sm:pt-10">
          <nav aria-label="Breadcrumb">
            <ol className="v4-smallcaps m-0 flex list-none flex-wrap items-center gap-x-2 p-0 text-base text-muted">
              <li>
                <Link href={routes.home("v4")} className="inline-flex min-h-11 items-center hover:text-accent">
                  Portfolio
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`${routes.home("v4")}#work`} className="inline-flex min-h-11 items-center hover:text-accent">
                  The work
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Plate {plate}</li>
            </ol>
          </nav>

          <div className="mt-6 grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="v4-eyebrow flex flex-wrap gap-x-3">
                <span className="text-accent">Plate {plate}</span>
                <span aria-hidden="true">·</span>
                <span>{project.dates.label}</span>
                <span aria-hidden="true">·</span>
                <span>{teamLabel[project.team]}</span>
              </p>
              <h1 id="cs-title" className="v4-italic mt-4 text-[clamp(3.1rem,11vw,7.5rem)] leading-[0.88] tracking-[-0.02em]">
                {project.name}
              </h1>
              <p className="v4-display mt-5 text-[clamp(1.35rem,2.6vw,1.9rem)] leading-snug text-accent">{project.tagline}</p>
              <p className="v4-prose mt-6 text-xl">{project.oneLiner}</p>
            </div>
            <div className="flex items-center justify-center lg:col-span-5">
              <div className="w-full" style={{ transform: "rotate(-1.2deg)" }}>
                <ProjectArtifact project={project} />
              </div>
            </div>
          </div>

          {project.metrics.length > 0 ? (
            <dl className="mt-14 flex flex-wrap border-y-[3px] border-double border-[var(--c-strong-line)]">
              {project.metrics.map((mt) => (
                <div key={mt.evidence} className="flex min-w-[9.5rem] flex-1 flex-col-reverse border-r border-[var(--c-rule)] px-3 py-5 last:border-r-0">
                  <dt className="mt-1 text-sm leading-snug text-muted">{mt.label}</dt>
                  <dd className="v4-display m-0 text-[clamp(2rem,4vw,2.75rem)] leading-none font-semibold">{mt.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>

        <div className="v4-wrap grid gap-12 pb-10 lg:grid-cols-12">
          <aside className="lg:col-span-3" aria-label="Project details">
            <div className="v4-margin lg:sticky lg:top-8">
              <dl className="m-0">
                <dt>Role</dt>
                <dd>{project.role}</dd>
                <dt>Team</dt>
                <dd>{teamLabel[project.team]}</dd>
                <dt>When</dt>
                <dd>{project.dates.label}</dd>
                <dt>Links</dt>
                <dd>
                  {project.links.length > 0 ? (
                    <ul className="m-0 list-none p-0">
                      {project.links.map((l) => (
                        <li key={l.href}>
                          <a className="v4-link inline-flex min-h-11 items-center" href={l.href} rel="noopener">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {project.linkNote ? <p className="mt-1 text-[0.95rem] text-muted">{project.linkNote}</p> : null}
                </dd>
                <dt>Stack</dt>
                <dd>
                  <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                    {project.stack.map((s) => (
                      <li key={s} className="v4-sort">
                        {s}
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9">
            <Part id="problem" title="The problem">
              <p className="v4-dropcap v4-prose !max-w-[42rem] text-xl">{cs.problem}</p>
            </Part>

            {cs.constraints.length > 0 ? (
              <Part id="constraints" title="What I was up against">
                <DashList items={cs.constraints} />
              </Part>
            ) : null}

            {DiagramView ? (
              <Part id="diagram" title="How it fits together">
                <Settle from={-1} rest={0} to={0.6} drift={16}>
                  <div className="v4-figure-frame">
                    <DiagramView caption={`Plate ${plate}, figure. ${project.name} at a glance.`} />
                  </div>
                </Settle>
              </Part>
            ) : null}

            {cs.decisions.length > 0 ? (
              <Part id="decisions" title="Decisions">
                <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-2">
                  {cs.decisions.map((d, i) => (
                    <li key={d.title} className="v4-paper p-6">
                      <p className="v4-numeral text-2xl leading-none" aria-hidden="true">
                        {roman(i + 1)}
                      </p>
                      <h3 className="v4-display mt-2 text-xl leading-snug font-semibold">{d.title}</h3>
                      <p className="mt-2 leading-relaxed">{d.detail}</p>
                    </li>
                  ))}
                </ol>
              </Part>
            ) : null}

            {cs.tradeoffs.length > 0 ? (
              <Part id="tradeoffs" title="Tradeoffs">
                <DashList items={cs.tradeoffs} />
              </Part>
            ) : null}

            {cs.whatBroke.length > 0 ? (
              <Part id="what-broke" title="Errata: what broke">
                <ul className="m-0 list-none space-y-4 p-0">
                  {cs.whatBroke.map((w) => (
                    <li key={w.title} className="v4-errata px-5 py-4">
                      <h3 className="v4-italic text-2xl leading-snug">{w.title}</h3>
                      <p className="mt-1 max-w-[42rem] leading-relaxed">{w.detail}</p>
                    </li>
                  ))}
                </ul>
              </Part>
            ) : null}

            {cs.results.length > 0 ? (
              <Part id="results" title="Results">
                <DashList items={cs.results} />
              </Part>
            ) : null}

            {cs.tests.length > 0 ? (
              <Part id="tests" title="Tests">
                <ProofList items={cs.tests} />
              </Part>
            ) : null}

            {cs.caveats.length > 0 ? (
              <Part id="caveats" title="Fine print">
                <ol className="m-0 max-w-[42rem] list-none space-y-2 p-0 text-[1.02rem] leading-relaxed text-muted">
                  {cs.caveats.map((c, i) => (
                    <li key={c} className="flex gap-3">
                      <span className="v4-numeral w-6 shrink-0 text-lg" aria-hidden="true">
                        {MARKS[i % MARKS.length]}
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ol>
              </Part>
            ) : null}
          </div>
        </div>

        {prev && next ? (
          <nav aria-label="More plates" className="v4-wrap">
            <ul className="m-0 grid list-none gap-4 border-y-[3px] border-double border-[var(--c-strong-line)] p-0 py-6 sm:grid-cols-2">
              <li>
                <Link href={routes.work("v4", prev.slug)} className="group block min-h-11 py-2 no-underline">
                  <span className="v4-smallcaps block text-sm text-muted">Previous plate</span>
                  <span className="v4-italic block text-3xl leading-tight group-hover:text-accent">{prev.name}</span>
                </Link>
              </li>
              <li className="sm:text-right">
                <Link href={routes.work("v4", next.slug)} className="group block min-h-11 py-2 no-underline">
                  <span className="v4-smallcaps block text-sm text-muted">Next plate</span>
                  <span className="v4-italic block text-3xl leading-tight group-hover:text-accent">{next.name}</span>
                </Link>
              </li>
            </ul>
          </nav>
        ) : null}

        <Letter eyebrow="After the last page" />
      </main>
      <Footer />
    </>
  );
}

export default CaseStudy;

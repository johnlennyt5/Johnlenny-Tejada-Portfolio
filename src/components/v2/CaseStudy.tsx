import Link from "next/link";
import type { ReactNode } from "react";
import { diagramsById } from "@/components/shared/diagrams";
import { projects, type Project } from "@/content";
import { routes } from "@/lib/site";
import { Contact } from "./Contact";
import { Footer, Header } from "./Header";
import { Cue, Reveal, Scene } from "./cue";
import { ActiveToc } from "./motion";
import { BTN_GHOST, CheckIcon, Eyebrow, ExternalArrow, Frame, Poster, WordReveal, no, teamLabel } from "./ui";

interface Chapter {
  id: string;
  title: string;
  body: ReactNode;
}

function Dot() {
  return <span className="mt-[0.6rem] h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />;
}

/** A v2 case study: a launch page for one project. Empty content arrays render nothing. */
export function CaseStudy({ project }: { project: Project }) {
  const cs = project.caseStudy;
  const order = [...projects].sort((a, b) => a.order - b.order);
  const index = order.findIndex((p) => p.slug === project.slug);
  const next = order[(index + 1) % order.length] ?? order[0];
  const DiagramView = project.diagram ? diagramsById[project.diagram] : null;

  const chapters: Chapter[] = [];
  chapters.push({
    id: "problem",
    title: "The problem",
    body: <WordReveal text={cs.problem} className="v2-words-sm" />,
  });
  if (cs.constraints.length > 0) {
    chapters.push({
      id: "constraints",
      title: "Constraints",
      body: (
        <ul className="grid gap-3">
          {cs.constraints.map((c, i) => (
            <Reveal as="li" key={c} delay={i * 0.04} className="flex gap-4 rounded-2xl border border-line bg-surface/60 p-4 sm:p-5">
              <span className="font-mono text-xs text-accent" aria-hidden="true">
                {no(i + 1)}
              </span>
              <span className="leading-relaxed">{c}</span>
            </Reveal>
          ))}
        </ul>
      ),
    });
  }
  if (cs.decisions.length > 0) {
    chapters.push({
      id: "decisions",
      title: "Decisions",
      body: (
        <ol className="grid gap-4 md:grid-cols-2">
          {cs.decisions.map((d, i) => (
            <Reveal as="li" key={d.title} delay={(i % 2) * 0.06} className="v2-panel">
              <p className="font-mono text-xs tracking-[0.16em] text-accent" aria-hidden="true">
                {no(i + 1)}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">{d.title}</h3>
              <p className="v2-body mt-3">{d.detail}</p>
            </Reveal>
          ))}
        </ol>
      ),
    });
  }
  if (cs.tradeoffs.length > 0) {
    chapters.push({
      id: "tradeoffs",
      title: "Tradeoffs",
      body: (
        <ul className="grid gap-4">
          {cs.tradeoffs.map((t) => (
            <Reveal as="li" key={t} className="flex gap-4 text-lg leading-relaxed">
              <Dot />
              <span>{t}</span>
            </Reveal>
          ))}
        </ul>
      ),
    });
  }
  if (cs.whatBroke.length > 0) {
    chapters.push({
      id: "what-broke",
      title: "What broke",
      body: (
        <ol className="grid gap-4">
          {cs.whatBroke.map((w, i) => (
            <Reveal as="li" key={w.title} className="v2-panel grid grid-cols-1 gap-2 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-2">Incident {no(i + 1)}</p>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight">{w.title}</h3>
                <p className="v2-body mt-2">{w.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      ),
    });
  }
  if (cs.results.length > 0) {
    chapters.push({
      id: "results",
      title: "Results",
      body: (
        <ul className="grid gap-4">
          {cs.results.map((r) => (
            <Reveal as="li" key={r} className="flex gap-4 text-lg leading-relaxed">
              <CheckIcon />
              <span>{r}</span>
            </Reveal>
          ))}
        </ul>
      ),
    });
  }
  if (cs.tests.length > 0) {
    chapters.push({
      id: "tests",
      title: "Tests",
      body: (
        <Reveal>
          <Frame title={`${project.slug} · test coverage`}>
            <ul className="grid gap-3 font-mono text-sm leading-relaxed">
              {cs.tests.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="text-accent-2" aria-hidden="true">
                    ›
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Frame>
        </Reveal>
      ),
    });
  }
  if (cs.caveats.length > 0) {
    chapters.push({
      id: "caveats",
      title: "Caveats",
      body: (
        <Reveal className="rounded-3xl border border-dashed border-[rgb(237_238_243/0.2)] p-5 sm:p-7">
          <p className="v2-eyebrow">What it is not</p>
          <ul className="mt-5 grid gap-3">
            {cs.caveats.map((c) => (
              <li key={c} className="flex gap-4 leading-relaxed text-muted">
                <Dot />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      ),
    });
  }
  chapters.push({
    id: "stack",
    title: "Stack",
    body: (
      <ul className="flex flex-wrap gap-2">
        {project.stack.map((s) => (
          <li key={s} className="v2-tag text-fg">
            {s}
          </li>
        ))}
      </ul>
    ),
  });

  const toc = chapters.map((c, i) => ({ id: c.id, no: no(i + 1), title: c.title }));

  return (
    <>
      <Header />
      <main id="main">
        <Scene id="launch" length={180} labelledBy="v2-cs-title">
          <div className="v2-layers" aria-hidden="true">
            <Cue when="always" exit={{ at: [0, 1], y: -160 }} className="v2-glow v2-glow-a" decorative />
            <Cue when="always" exit={{ at: [0, 1], y: -260 }} className="v2-glow v2-glow-b v2-glow-sm" decorative />
          </div>
          <div className="v2-container v2-split">
            <Cue exit={{ at: [0.6, 1], y: -60, opacity: 0.4 }}>
              <p>
                <Link href={`${routes.home("v2")}#work`} className="v2-link inline-flex min-h-11 items-center font-mono text-sm text-muted">
                  <span aria-hidden="true">←&nbsp;</span>All launches
                </Link>
              </p>
              <Eyebrow className="mt-8">{`Case study · ${teamLabel(project)}`}</Eyebrow>
              <h1 id="v2-cs-title" className="v2-case-title mt-5">
                <span className="v2-grad">{project.name}</span>
              </h1>
              <p className="mt-4 font-display text-xl font-medium tracking-tight text-accent sm:text-2xl">{project.tagline}</p>
              <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                {project.role} · {project.dates.label}
              </p>
            </Cue>
            <Cue enter={{ at: [0, 0.35], y: 90, scale: 0.9 }} exit={{ at: [0.35, 1], y: -20, scale: 0.98 }} className="v2-frame-fit">
              <Frame title={`fig ${no(1)} · ${project.slug} · ${DiagramView ? "architecture" : "title card"}`}>
                {DiagramView ? (
                  <DiagramView caption={`Fig ${no(1)}. ${project.name} at a glance.`} />
                ) : (
                  <figure>
                    <Poster project={project} large showName={false} />
                    <figcaption className="v2-caption mt-4">
                      Fig {no(1)}. {project.name}: {project.tagline}.
                    </figcaption>
                  </figure>
                )}
              </Frame>
            </Cue>
          </div>
        </Scene>

        <section aria-labelledby="v2-brief-title" className="relative py-16 sm:py-20">
          <div className="v2-container grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div>
              <h2 id="v2-brief-title" className="v2-eyebrow">
                The brief
              </h2>
              <p className="mt-6 font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">{project.oneLiner}</p>
              <p className="v2-lead mt-6 text-muted">{project.summary}</p>
            </div>
            <div className="flex flex-col gap-6">
              {project.metrics.length > 0 ? (
                <Reveal>
                  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line">
                    {project.metrics.map((mt) => (
                      <div key={mt.evidence} className="bg-bg p-5">
                        <dt className="text-sm leading-snug text-muted">{mt.label}</dt>
                        <dd className="mt-2 font-mono text-2xl text-accent-2 sm:text-3xl">{mt.value}</dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              ) : null}
              {project.links.length > 0 ? (
                <ul className="flex flex-wrap gap-3">
                  {project.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} className={BTN_GHOST} rel="noopener">
                        {l.label} <ExternalArrow />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
              {project.linkNote ? <p className="text-sm leading-relaxed text-muted">{project.linkNote}</p> : null}
            </div>
          </div>
        </section>

        <div className="v2-container grid grid-cols-1 gap-10 pb-16 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <div className="sticky top-[calc(var(--v2-header-h)+2rem)]">
              <ActiveToc items={toc} label={`${project.name} case study contents`} />
            </div>
          </aside>
          <div className="max-w-4xl">
            {chapters.map((c, i) => (
              <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className={`py-14 sm:py-16 ${i > 0 ? "border-t border-line" : ""}`}>
                <h2 id={`${c.id}-title`} className="flex items-baseline gap-4">
                  <span className="v2-toc-no" aria-hidden="true">
                    {no(i + 1)}
                  </span>
                  <span className="v2-h3">{c.title}</span>
                </h2>
                <div className="mt-8">{c.body}</div>
              </section>
            ))}
          </div>
        </div>

        {next && next.slug !== project.slug ? (
          <section aria-label="Next case study" className="v2-container pb-10">
            <Link href={routes.work("v2", next.slug)} className="v2-next">
              <span className="v2-eyebrow">Next launch</span>
              <span className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
                <span className="v2-display-md">{next.name}</span>
                <span className="v2-next-arrow font-display text-4xl text-accent" aria-hidden="true">
                  →
                </span>
              </span>
              <span className="mt-4 block max-w-2xl text-lg text-muted">{next.tagline}</span>
            </Link>
          </section>
        ) : null}

        <Contact eyebrow="Like what you see" />
      </main>
      <Footer />
    </>
  );
}

export default CaseStudy;

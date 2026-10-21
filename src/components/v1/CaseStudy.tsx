import Link from "next/link";
import type { ReactNode } from "react";
import { diagramsById } from "@/components/shared/diagrams";
import { profile, type Project } from "@/content";
import { routes } from "@/lib/site";
import { CaseContents, PlateHeader, type ContentsItem } from "./CaseParts";
import { indexNumber, nextProject, teamLabel } from "./data";
import { Masthead } from "./Masthead";
import { CountUp, DrawRule, Reveal, SetTitle } from "./motion";
import { Colophon, ContactSection } from "./sections";

function Block({ item, kicker, children }: { item: ContentsItem; kicker?: string; children: ReactNode }) {
  return (
    <section id={item.id} aria-labelledby={`${item.id}-title`} className="pb-14 pt-4 md:pb-20">
      <DrawRule offset={["start end", "start 70%"]} />
      <div className="flex items-baseline justify-between gap-4 pt-3">
        <p className="v1-label">
          <span className="text-accent">§</span> {item.num}
        </p>
        {kicker ? <p className="v1-label">{kicker}</p> : null}
      </div>
      <SetTitle
        as="h2"
        id={`${item.id}-title`}
        text={item.label}
        className="mt-4 font-display text-[clamp(2rem,4.6vw,3.75rem)] font-black leading-[0.95] tracking-[-0.045em]"
      />
      <div className="mt-8">{children}</div>
    </section>
  );
}

function NumberedList({ items, marker = "num" }: { items: string[]; marker?: "num" | "arrow" }) {
  return (
    <ol className="border-t border-line">
      {items.map((t, i) => (
        <li key={t} className="grid grid-cols-[2.75rem_1fr] gap-x-3 border-b border-line py-4">
          <span className="v1-label pt-1 text-accent" aria-hidden={marker === "arrow" ? true : undefined}>
            {marker === "num" ? String(i + 1).padStart(2, "0") : "→"}
          </span>
          <span className="leading-relaxed">{t}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * v1 case study: a magazine spread. Plate title, a meta strip, the figures, Fig. 1,
 * then the story in numbered sections beside a sticky contents rail.
 * Empty sections are skipped rather than padded.
 */
export function CaseStudy({ project }: { project: Project }) {
  const cs = project.caseStudy;
  const no = indexNumber(project.slug);
  const next = nextProject(project.slug);
  const DiagramView = project.diagram ? diagramsById[project.diagram] : null;

  const all: (ContentsItem & { show: boolean })[] = [
    { id: "problem", label: "Problem", show: Boolean(cs.problem) },
    { id: "constraints", label: "Constraints", show: cs.constraints.length > 0 },
    { id: "decisions", label: "Decisions", show: cs.decisions.length > 0 },
    { id: "tradeoffs", label: "Tradeoffs", show: cs.tradeoffs.length > 0 },
    { id: "what-broke", label: "What broke", show: cs.whatBroke.length > 0 },
    { id: "results", label: "Results", show: cs.results.length > 0 },
    { id: "tests", label: "Tests", show: cs.tests.length > 0 },
    { id: "caveats", label: "Caveats", show: cs.caveats.length > 0 },
    { id: "stack", label: "Stack", show: project.stack.length > 0 },
  ].map((x) => ({ ...x, num: "" }));
  const items: ContentsItem[] = all
    .filter((x) => x.show)
    .map((x, i) => ({ id: x.id, label: x.label, num: String(i + 1).padStart(2, "0") }));
  const item = (id: string) => items.find((x) => x.id === id);
  const contactNum = String(items.length + 1).padStart(2, "0");

  const problem = item("problem");
  const constraints = item("constraints");
  const decisions = item("decisions");
  const tradeoffs = item("tradeoffs");
  const broke = item("what-broke");
  const results = item("results");
  const tests = item("tests");
  const caveats = item("caveats");
  const stack = item("stack");

  return (
    <>
      <Masthead name={profile.name} context={`Case study No. ${no}: ${project.name}`} />
      <main id="main">
        <PlateHeader
          numeral={no}
          title={project.name}
          titleId="case-title"
          top={
            <nav aria-label="Breadcrumb" className="v1-label border-b border-fg pb-3">
              <ol className="flex flex-wrap items-center gap-x-2">
                <li>
                  <Link href={routes.home("v1")} className="inline-flex min-h-11 items-center hover:text-fg">
                    The Index
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`${routes.home("v1")}#work`} className="inline-flex min-h-11 items-center hover:text-fg">
                    Work
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <span aria-current="page" className="text-fg">
                    No. {no}
                  </span>
                </li>
              </ol>
            </nav>
          }
        >
          <p className="v1-standfirst mt-6 max-w-[24ch] text-muted">{project.tagline}</p>
        </PlateHeader>

        <div className="v1-wrap mt-12 md:mt-16">
          <dl className="grid grid-cols-2 gap-x-[var(--v1-gap)] border-t border-fg md:grid-cols-4">
            <div className="border-b border-line py-4 pr-2">
              <dt className="v1-label">Role</dt>
              <dd className="mt-1 font-semibold">{project.role}</dd>
            </div>
            <div className="border-b border-line py-4 pr-2">
              <dt className="v1-label">Team</dt>
              <dd className="mt-1 font-semibold">{teamLabel[project.team]}</dd>
            </div>
            <div className="border-b border-line py-4 pr-2">
              <dt className="v1-label">Dates</dt>
              <dd className="mt-1 font-semibold">{project.dates.label}</dd>
            </div>
            <div className="border-b border-line py-4 pr-2">
              <dt className="v1-label">Links</dt>
              <dd className="mt-1">
                {project.links.length > 0 ? (
                  <ul className="space-y-1">
                    {project.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} className="v1-link font-semibold">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {project.linkNote ? (
                  <p className={`text-sm text-muted ${project.links.length > 0 ? "mt-2" : ""}`}>{project.linkNote}</p>
                ) : null}
              </dd>
            </div>
          </dl>

          <div className="v1-grid mt-12 gap-y-10 md:mt-16">
            <Reveal className="col-span-12 lg:col-span-8">
              <p className="font-display text-[clamp(1.5rem,3vw,2.6rem)] font-extrabold leading-[1.08] tracking-[-0.03em]">
                {project.oneLiner}
              </p>
            </Reveal>
            {project.metrics.length > 0 ? (
              <dl className="col-span-12 grid grid-cols-2 gap-x-[var(--v1-gap)] gap-y-8 sm:grid-cols-3 lg:col-span-4 lg:grid-cols-2">
                {project.metrics.map((x) => (
                  <div key={x.evidence} className="border-t-4 border-fg pt-2">
                    <dt className="jt-sr-only">{x.label}</dt>
                    <dd>
                      <CountUp value={x.value} className="v1-num block text-[clamp(2.6rem,5vw,3.6rem)]" />
                      <span className="mt-1 block text-sm text-muted">{x.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>

        {DiagramView ? (
          <div className="v1-wrap mt-16 md:mt-24">
            <div className="border-y-4 border-fg py-8 md:py-12">
              <DiagramView className="v1-figure" caption={`Fig. 1. ${project.name}, the system at a glance.`} />
            </div>
          </div>
        ) : null}

        <div className="v1-wrap mt-16 md:mt-24">
          <div className="v1-grid gap-y-10">
            <aside className="col-span-12 lg:col-span-3">
              <CaseContents items={items} />
            </aside>
            <article aria-labelledby="case-title" className="col-span-12 lg:col-span-8 lg:col-start-5">
              {problem ? (
                <Block item={problem}>
                  <p className="v1-prose-lg v1-dropcap">{cs.problem}</p>
                </Block>
              ) : null}

              {constraints ? (
                <Block item={constraints}>
                  <NumberedList items={cs.constraints} />
                </Block>
              ) : null}

              {decisions ? (
                <Block item={decisions}>
                  <ol className="grid gap-x-[var(--v1-gap)] gap-y-10 md:grid-cols-2">
                    {cs.decisions.map((d, i) => (
                      <li key={d.title} className="border-t-4 border-fg pt-3">
                        <Reveal delay={(i % 2) * 0.08}>
                          <p className="v1-label text-accent">{String(i + 1).padStart(2, "0")}</p>
                          <h3 className="mt-2 font-display text-[1.6rem] font-extrabold leading-[1.02] tracking-[-0.03em]">
                            {d.title}
                          </h3>
                          <p className="mt-3 leading-relaxed">{d.detail}</p>
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                </Block>
              ) : null}

              <Reveal className="my-6 md:my-10">
                <figure className="border-l-[6px] border-accent py-2 pl-5 md:-ml-[6px] md:pl-10">
                  <blockquote className="font-display text-[clamp(1.6rem,3.4vw,3rem)] font-black leading-[1.02] tracking-[-0.04em]">
                    <p>{project.summary}</p>
                  </blockquote>
                  <figcaption className="v1-label mt-4">In brief</figcaption>
                </figure>
              </Reveal>

              {tradeoffs ? (
                <Block item={tradeoffs}>
                  <NumberedList items={cs.tradeoffs} marker="arrow" />
                </Block>
              ) : null}

              {broke ? (
                <Block item={broke} kicker="Errata">
                  <ol className="space-y-8">
                    {cs.whatBroke.map((w, i) => (
                      <li key={w.title} className="grid gap-x-6 gap-y-2 border-t border-fg pt-4 md:grid-cols-[9rem_1fr]">
                        <p className="v1-label text-accent">Erratum {String(i + 1).padStart(2, "0")}</p>
                        <div>
                          <h3 className="font-display text-[1.45rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
                            {w.title}
                          </h3>
                          <p className="mt-2 leading-relaxed">{w.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Block>
              ) : null}

              {results ? (
                <Block item={results}>
                  <NumberedList items={cs.results} />
                </Block>
              ) : null}

              {tests ? (
                <Block item={tests} kicker="Audit notes">
                  <ul className="border-t border-line font-mono text-[0.875rem] leading-relaxed">
                    {cs.tests.map((t) => (
                      <li key={t} className="flex gap-3 border-b border-line py-3">
                        <span aria-hidden="true" className="text-accent">
                          ✓
                        </span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </Block>
              ) : null}

              {caveats ? (
                <Block item={caveats} kicker="Footnotes">
                  <ol className="space-y-3 text-[0.9375rem] leading-relaxed text-muted">
                    {cs.caveats.map((c, i) => (
                      <li key={c} className="grid grid-cols-[2rem_1fr] gap-x-2">
                        <span className="font-mono text-xs text-fg">{String(i + 1).padStart(2, "0")}</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ol>
                </Block>
              ) : null}

              {stack ? (
                <Block item={stack} kicker="Index of terms">
                  <ul className="flex flex-wrap gap-2">
                    {project.stack.map((t) => (
                      <li key={t} className="border border-fg px-3 py-1.5 text-sm font-medium">
                        {t}
                      </li>
                    ))}
                  </ul>
                </Block>
              ) : null}
            </article>
          </div>
        </div>

        <div className="v1-wrap mt-8">
          <Link href={routes.work("v1", next.slug)} className="v1-next block border-y-4 border-fg py-10 no-underline md:py-16">
            <span className="v1-label">Next in the index, No. {indexNumber(next.slug)}</span>
            <span className="mt-4 flex items-end justify-between gap-6">
              <span className="v1-h2 block">{next.name}</span>
              <span className="v1-arrow font-display text-[clamp(2.5rem,7vw,6rem)] font-black leading-none" aria-hidden="true">
                →
              </span>
            </span>
            <span className="mt-4 block text-lg text-muted">{next.tagline}</span>
          </Link>
        </div>

        <ContactSection s={{ id: "contact", num: contactNum, label: "Contact", title: "Correspondence" }} />
      </main>
      <Colophon />
    </>
  );
}

export default CaseStudy;

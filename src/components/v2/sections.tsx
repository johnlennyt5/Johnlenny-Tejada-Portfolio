import Link from "next/link";
import {
  beyondCode,
  community,
  education,
  experience,
  getProject,
  nowBuilding,
  primaryIdentity,
  profile,
  skills,
  type ProjectSlug,
} from "@/content";
import { routes } from "@/lib/site";
import { Reveal } from "./cue";
import { Eyebrow, ExternalArrow, WordReveal, no } from "./ui";

/* ------------------------------------------------------------------ */
/* How I work: principles pulled from real case-study decisions        */
/* ------------------------------------------------------------------ */

const PRINCIPLES: [ProjectSlug, string][] = [
  ["ilop", "Deterministic orchestration, non-deterministic reasoning"],
  ["ilop", "People where judgment matters"],
  ["prismshift", "Tenant isolation proven, not promised"],
  ["truckwhat", "Security enforced in the database"],
  ["ilop", "Where AI deliberately is not"],
  ["prismshift", "Answer keys in CI"],
];

function principles() {
  return PRINCIPLES.flatMap(([slug, title]) => {
    const project = getProject(slug);
    const decision = project?.caseStudy.decisions.find((d) => d.title === title);
    return project && decision ? [{ project, decision }] : [];
  });
}

export function SkillsSheet({ headingLevel = "h3" }: { headingLevel?: "h3" | "h4" }) {
  const H = headingLevel;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {skills.map((g, i) => (
        <Reveal key={g.id} delay={(i % 3) * 0.06} className="v2-panel">
          <div className="flex items-baseline justify-between gap-4">
            <H className="font-display text-lg font-semibold tracking-tight">{g.title}</H>
            <span className="font-mono text-xs text-muted" aria-hidden="true">
              {no(i + 1)}
            </span>
          </div>
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {g.items.map((item) => (
              <li key={item} className="v2-tag text-fg">
                {item}
              </li>
            ))}
          </ul>
          {g.note ? <p className="mt-4 text-sm leading-relaxed text-muted">{g.note}</p> : null}
        </Reveal>
      ))}
    </div>
  );
}

export function HowIWork({ n }: { n: number }) {
  const list = principles();
  return (
    <section id="how" aria-labelledby="v2-how-title" className="relative py-24 sm:py-32">
      <div className="v2-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--v2-header-h)+2rem)] lg:self-start">
            <Eyebrow>{`Scene ${no(n)} · How I work`}</Eyebrow>
            <h2 id="v2-how-title" className="v2-h2 mt-5">
              Rules I build by.
            </h2>
            <p className="v2-lead mt-6 text-muted">{primaryIdentity.pitch}</p>
            <p className="v2-body mt-4 text-sm">Each rule is a decision from a real build. Follow the link for the full story.</p>
          </div>
          <ol className="v2-stack">
            {list.map(({ project, decision }, i) => (
              <li key={decision.title} className="v2-stack-card" style={{ ["--i" as string]: i }}>
                <p className="v2-stack-no" aria-hidden="true">
                  {no(i + 1)}
                </p>
                <h3 className="v2-h3 mt-4 max-w-[24ch]">{decision.title}</h3>
                <p className="v2-body mt-4 max-w-2xl">{decision.detail}</p>
                <Link href={routes.work("v2", project.slug)} className="v2-link mt-5 inline-flex min-h-11 items-center text-sm font-medium text-fg">
                  From {project.name}
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-24 sm:mt-32">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="v2-display-md">Spec sheet.</h3>
            <p className="max-w-md text-sm leading-relaxed text-muted">
              The tools I work with, with scope notes where they matter.
            </p>
          </div>
          <div className="mt-10">
            <SkillsSheet headingLevel="h4" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Before the code: the whole person                                   */
/* ------------------------------------------------------------------ */

const PEOPLE_IDS = ["tedxprovidence", "bryant-hackathon", "teaching", "speaking-society"];

export function BeyondCode({ n }: { n: number }) {
  const people = PEOPLE_IDS.flatMap((id) => community.filter((c) => c.id === id));
  return (
    <section id="about" aria-labelledby="v2-beyond-title" className="relative overflow-clip py-24 sm:py-32">
      <div className="v2-layers" aria-hidden="true">
        <div className="v2-glow v2-glow-a v2-glow-sm" style={{ left: "auto", right: "-18vmax", top: "8%" }} />
      </div>
      <div className="v2-container">
        <Eyebrow>{`Scene ${no(n)} · Before the code`}</Eyebrow>
        <h2 id="v2-beyond-title" className="v2-h2 mt-5 max-w-4xl">
          The business side came first.
        </h2>
        <div className="mt-12 max-w-5xl">
          <WordReveal text={profile.bio[2] ?? ""} />
        </div>

        <ul className="mt-14 flex flex-wrap gap-2.5" aria-label="Beyond code">
          {beyondCode.map((b) => (
            <li key={b} className="v2-chip v2-chip-quiet">
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-16 grid gap-4 md:grid-cols-2">
          {people.map((c, i) => (
            <Reveal key={c.id} delay={(i % 2) * 0.08} className="v2-panel">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-2">
                {c.org}
                {c.dates ? ` · ${c.dates}` : ""}
              </p>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">{c.title}</h3>
              <p className="v2-body mt-3">{c.detail}</p>
              {c.link ? (
                <a className="v2-link mt-3 inline-flex min-h-11 items-center gap-1 text-sm" href={c.link.href} rel="noopener">
                  {c.link.label} <ExternalArrow />
                </a>
              ) : null}
            </Reveal>
          ))}
        </div>

        <p className="mt-12">
          <Link href={routes.about("v2")} className="v2-btn v2-btn-ghost">
            Read the full story
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Credits: experience and education, set like film credits            */
/* ------------------------------------------------------------------ */

export function Credits({ n }: { n: number }) {
  return (
    <section id="credits" aria-labelledby="v2-credits-title" className="relative py-24 sm:py-32">
      <div className="v2-narrow text-center">
        <Eyebrow className="justify-center">{`Scene ${no(n)} · Credits`}</Eyebrow>
        <h2 id="v2-credits-title" className="v2-h2 mt-5">
          Experience.
        </h2>
        <ol className="mt-10">
          {experience.map((e) => (
            <Reveal as="li" key={e.id} className="v2-credit border-b border-line last:border-b-0">
              <p className="v2-credit-role">{e.role}</p>
              <h3 className="v2-credit-name">{e.company}</h3>
              <p className="font-mono text-xs text-muted">
                {e.formerly ? `Formerly ${e.formerly} · ` : ""}
                {e.dates.label} · {e.location}
              </p>
              <p className="v2-body mt-2 max-w-2xl">{e.highlights[0]}</p>
            </Reveal>
          ))}
        </ol>

        <h3 className="v2-credit-role mt-16">Education</h3>
        <ul className="mt-6 grid gap-6">
          {education.map((ed) => (
            <Reveal as="li" key={ed.id}>
              <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{ed.credential}</p>
              <p className="mt-1 text-muted">
                {ed.school}, {ed.dates}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Now building                                                        */
/* ------------------------------------------------------------------ */

export function NowBuilding({ n }: { n: number }) {
  return (
    <section id="now" aria-labelledby="v2-now-title" className="relative py-24 sm:py-28">
      <div className="v2-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{`Scene ${no(n)} · In production`}</Eyebrow>
            <h2 id="v2-now-title" className="v2-h2 mt-5">
              Now building.
            </h2>
          </div>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {nowBuilding.map((item, i) => (
            <Reveal as="li" key={item.id} delay={i * 0.08} className="v2-panel flex flex-col">
              <span className="v2-tag v2-tag-live self-start">In progress</span>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{item.title}</h3>
              <p className="v2-body mt-3">{item.detail}</p>
              {item.project ? (
                <Link href={routes.work("v2", item.project)} className="v2-link mt-auto inline-flex min-h-11 items-center pt-4 text-sm font-medium text-fg">
                  Case study<span className="jt-sr-only">: {getProject(item.project)?.name}</span>
                </Link>
              ) : null}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

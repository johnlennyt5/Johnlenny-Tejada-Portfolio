import Link from "next/link";
import { CopyEmail, Monogram, ResumeButton } from "@/components/shared";
import { ilopSpec, prismShiftSpec, truckWhatSpec, type DiagramLayout, type DiagramSpec } from "@/components/shared/diagrams";
import {
  awards,
  community,
  getEvidence,
  getExperience,
  profile,
  projects,
  secondaryIdentity,
  timeline,
  type DiagramId,
  type EvidenceId,
  type Project,
} from "@/content";
import { getVersion, routes } from "@/lib/site";
import { LazyDiagram } from "./LazyDiagram";
import { Cue, Scene, type Leg } from "./cue";
import { Filmstrip } from "./motion";
import { BTN_GHOST, BTN_PRIMARY, Eyebrow, ExternalArrow, Frame, Poster, ProofChip, metricFor, no, teamLabel } from "./ui";

/* ------------------------------------------------------------------ */
/* Scene 01: the keynote opens                                         */
/* ------------------------------------------------------------------ */

const HERO_PROOF: EvidenceId[] = ["hx-stp", "tw-vitest", "ps-pgtap", "tw-rls"];

/**
 * The headline is set on two fixed lines ("Automation and" / "AI engineer.") so the line count
 * does not depend on which font has loaded: wrapping that changed when Space Grotesk swapped in
 * was the hero's layout shift.
 */
function headlineLines(text: string): [string, string] {
  const words = text.split(" ");
  if (words.length < 3) return [text, ""];
  return [words.slice(0, -2).join(" "), words.slice(-2).join(" ")];
}

/**
 * The hero is server-rendered end to end: no client wrapper sits above the headline, so the
 * LCP text paints from the static HTML before hydration. Its three beats cross-fade on a CSS
 * scroll timeline while the stage is pinned (theme.css), and stack in flow everywhere else.
 */
export function Hero() {
  const [line1, line2] = headlineLines(`${profile.headline}.`);
  return (
    <Scene id="top" length={270} labelledBy="v2-hero-title" stageClassName="v2-hero-stage min-h-[100svh]">
      <div className="v2-layers" aria-hidden="true">
        <Cue exit={{ at: [0, 1], y: -140 }} className="v2-glow v2-glow-a" decorative />
        <Cue exit={{ at: [0, 1], y: -300 }} className="v2-glow v2-glow-b" decorative />
        <Cue exit={{ at: [0, 1], y: 160 }} className="v2-floor-wrap" decorative>
          <div className="v2-floor" />
        </Cue>
      </div>

      <div className="v2-container relative">
        <Cue
          exit={{ at: [0, 1], y: -120, scale: 0.78, opacity: 0.3 }}
          className="pointer-events-none mb-8 w-24 sm:w-32 lg:absolute lg:top-1/2 lg:right-[var(--v2-gutter)] lg:mb-0 lg:-mt-[min(13rem,13vw)] lg:w-[min(26rem,26vw)]"
          decorative
        >
          <Monogram variant="cinematic" size="100%" duration={0.32} delay={0.15} decorative />
        </Cue>

        <div className="v2-beats">
          <Cue exit={{ at: [0.26, 0.42], y: -80, scale: 0.97, opacity: 0 }} className="v2-beat-lead relative">
            <Eyebrow>{`Scene ${no(1)} · ${getVersion("v2").name}`}</Eyebrow>
            <h1 id="v2-hero-title" className="mt-6">
              <span className="block font-display text-xl font-medium tracking-tight text-fg sm:text-2xl">{profile.name}</span>
              <span className="v2-display mt-3 block">
                <span className="v2-grad">
                  {line1}
                  {line2 ? (
                    <>
                      <br />
                      {line2}
                    </>
                  ) : null}
                </span>
              </span>
            </h1>
            <p className="v2-lead mt-7 max-w-xl text-muted">{profile.subhead}</p>
            <div className="v2-hero-cta mt-9 flex flex-wrap gap-3">
              <a href="#work" className={BTN_PRIMARY}>
                See the work
              </a>
              <ResumeButton className={BTN_GHOST}>Resume (PDF)</ResumeButton>
              <CopyEmail className={BTN_GHOST} label="Copy email" copiedLabel="Email copied" addressClassName="v2-mono basis-full text-sm" />
            </div>
          </Cue>

          <Cue enter={{ at: [0.34, 0.48], y: 80, opacity: 0 }} exit={{ at: [0.64, 0.76], y: -80, opacity: 0 }}>
            <Eyebrow>Second act</Eyebrow>
            <p className="v2-display-md mt-6 max-w-[10em]">{profile.secondaryHeadline}</p>
            <p className="v2-lead mt-6 max-w-2xl text-muted">{secondaryIdentity.pitch}</p>
          </Cue>

          <Cue enter={{ at: [0.7, 0.84], y: 80, opacity: 0 }}>
            <Eyebrow>Proof before the pitch</Eyebrow>
            <p className="v2-display-md mt-6 max-w-[9.5em]">Real numbers, from work I shipped.</p>
            <ul className="mt-8 flex max-w-3xl flex-wrap gap-2.5">
              {HERO_PROOF.map((id) => (
                <li key={id}>
                  <ProofChip metric={metricFor(id)} />
                </li>
              ))}
            </ul>
            <a href="#humanixos" className="v2-link mt-8 inline-flex min-h-11 items-center font-medium">
              Start the show
            </a>
          </Cue>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:block" aria-hidden="true">
        <Cue exit={{ at: [0, 0.08], opacity: 0 }} className="flex flex-col items-center gap-3" decorative>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted">Scroll</span>
          <span className="v2-scroll-hint-line" />
        </Cue>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 02: the day job, as a before and after readout                */
/* ------------------------------------------------------------------ */

function To() {
  return (
    <>
      <span className="v2-arrow" aria-hidden="true">
        →
      </span>
      <span className="jt-sr-only"> to </span>
    </>
  );
}

const ev = (id: EvidenceId) => getEvidence(id).value;

export function DayJob() {
  const hx = getExperience("humanixos");
  const rows = [
    {
      k: "Import bot",
      v: (
        <>
          <b>{ev("hx-import")}</b> manual import <To /> <b>zero-touch</b>
        </>
      ),
    },
    {
      k: "Verification",
      v: (
        <>
          <b>{ev("hx-verify-before")}</b> <To /> <b>{ev("hx-verify-after")}</b>, with people reviewing in Action Center
        </>
      ),
    },
    {
      k: "Form triage",
      v: (
        <>
          <b>{ev("hx-stp")}</b> straight-through processing, with fuzzy-match deduplication
        </>
      ),
    },
    {
      k: "Data migration",
      v: (
        <>
          <b>{ev("hx-records")}</b> records per import, <b>{ev("hx-mapping")}</b> less manual mapping with AI
        </>
      ),
    },
  ];
  const platform: EvidenceId[] = ["hx-tenants", "hx-users", "hx-years"];

  return (
    <Scene id="humanixos" length={280} labelledBy="v2-hx-title">
      <div className="v2-layers" aria-hidden="true">
        <Cue exit={{ at: [0, 1], y: -180 }} className="v2-glow v2-glow-b" style={{ translate: "0 60px" }} decorative />
      </div>
      <div className="v2-container v2-split">
        <div>
          <Eyebrow>{`Scene ${no(2)} · Day job`}</Eyebrow>
          <h2 id="v2-hx-title" className="v2-h2 mt-5">
            Manual work, made <span className="v2-grad">exception-only.</span>
          </h2>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {hx.role}, {hx.company} (formerly {hx.formerly}) · {hx.dates.label}
          </p>
          <p className="v2-lead mt-5 text-muted">{hx.highlights[0]}</p>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {platform.map((id, i) => (
              <Cue as="li" key={id} enter={{ at: [0.08 + i * 0.06, 0.16 + i * 0.06], y: 18, opacity: 0 }}>
                <ProofChip metric={metricFor(id)} quiet />
              </Cue>
            ))}
          </ul>
          {hx.url ? (
            <p className="mt-7 text-sm text-muted">
              <a className="v2-link inline-flex min-h-11 items-center gap-1" href={hx.url} rel="noopener">
                {hx.links[0]?.label ?? hx.company} <ExternalArrow />
              </a>
            </p>
          ) : null}
        </div>

        <Cue enter={{ at: [0, 0.28], y: 90, scale: 0.9 }} exit={{ at: [0.85, 1], y: -30, scale: 0.97 }}>
          <Frame title={`fig ${no(2)} · humanixos · automation results`}>
            <figure>
              <ul>
                {rows.map((r, i) => (
                  <Cue as="li" key={r.k} enter={{ at: [0.18 + i * 0.12, 0.3 + i * 0.12], y: 24, opacity: 0 }} className="v2-readout-row">
                    <span className="v2-readout-k">{r.k}</span>
                    <span className="v2-readout-v">{r.v}</span>
                  </Cue>
                ))}
              </ul>
              <figcaption className="v2-caption mt-4 border-t border-line pt-4">
                Fig {no(2)}. Results from UiPath robots and AI-assisted imports I built at {hx.company}. No product
                screenshots and no client data: the platform stays private.
              </figcaption>
            </figure>
          </Frame>
        </Cue>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* The lineup: a quick index before the flagship scenes                */
/* ------------------------------------------------------------------ */

export const STAGE_PROJECTS = projects.filter((p) => p.diagram).sort((a, b) => a.order - b.order);
export const FILM_PROJECTS = projects.filter((p) => !p.diagram).sort((a, b) => a.order - b.order);

export function Lineup() {
  const all = [...projects].sort((a, b) => a.order - b.order);
  const first = 3;
  const last = first + STAGE_PROJECTS.length;
  return (
    <section id="work" aria-labelledby="v2-work-title" className="relative py-24 sm:py-32">
      <div className="v2-container">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <Eyebrow>{`Scenes ${no(first)} to ${no(last)} · Featured work`}</Eyebrow>
            <h2 id="v2-work-title" className="v2-h2 mt-5">
              The launches.
            </h2>
            <p className="v2-lead mt-6 text-muted">
              The flagship builds get the full stage, with the architecture on screen. Every project has a case
              study with its constraints, decisions, failures and caveats.
            </p>
          </div>
          <ol className="grid content-start border-t border-line">
            {all.map((p) => (
              <li key={p.slug} className="border-b border-line">
                <Link
                  href={routes.work("v2", p.slug)}
                  className="group grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 no-underline"
                >
                  <span className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
                    {p.name}
                  </span>
                  <span className="font-mono text-xs text-muted">{p.dates.label}</span>
                  <span className="col-span-2 text-sm text-muted">{p.tagline}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Scenes 03 to 05: one flagship per scene, diagram in a device frame  */
/* ------------------------------------------------------------------ */

const SPECS: Record<DiagramId, DiagramSpec> = {
  prismshift: prismShiftSpec,
  ilop: ilopSpec,
  truckwhat: truckWhatSpec,
};

/** The SVG canvas ratio of one layout (same arithmetic as the shared diagram engine). */
function ratio(l: DiagramLayout): string {
  const w = l.pad * 2 + l.cols * l.colWidth + (l.cols - 1) * l.colGap;
  const h = l.pad * 2 + l.rowHeights.reduce((a, b) => a + b, 0) + (l.rowHeights.length - 1) * l.rowGap;
  return `${w} / ${h}`;
}

const CAPTIONS: Record<DiagramId, string> = {
  prismshift: "PrismShift pipeline. Release exports are parsed in the browser, and redaction guards check everything that leaves it.",
  ilop: "ILOP intake flow on UiPath Maestro. AI agents are outlined in blue, the human review step in teal.",
  truckwhat: "truckWhat architecture. The web app and the mobile app share one Supabase core, with row-level security in Postgres.",
};

export function ProjectScene({ project, n, flip = false }: { project: Project; n: number; flip?: boolean }) {
  const spec = project.diagram ? SPECS[project.diagram] : null;
  const titleId = `v2-${project.slug}-title`;
  const chips = project.metrics.slice(0, 4);
  const repo = project.links.find((l) => l.kind === "repo");
  return (
    <Scene id={project.slug} length={270} labelledBy={titleId}>
      <div className="v2-layers" aria-hidden="true">
        <Cue exit={{ at: [0, 1], y: -260 }} className={`v2-glow ${flip ? "v2-glow-b" : "v2-glow-a"}`} style={{ translate: "0 100px" }} decorative />
      </div>
      <div className="v2-container v2-split" data-flip={flip ? "true" : "false"}>
        <div>
          <Eyebrow>{`Scene ${no(n)} · ${teamLabel(project)}`}</Eyebrow>
          <h2 id={titleId} className="v2-display-md mt-5">
            {project.name}
          </h2>
          <p className="mt-3 font-display text-lg font-medium tracking-tight text-accent sm:text-xl">{project.tagline}</p>
          <p className="mt-5 leading-relaxed text-muted sm:text-lg">{project.oneLiner}</p>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {project.role} · {project.dates.label}
          </p>
          {chips.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {chips.map((mt, i) => (
                <Cue as="li" key={mt.evidence} enter={{ at: [0.12 + i * 0.07, 0.2 + i * 0.07], y: 18, opacity: 0 }}>
                  <ProofChip metric={mt} />
                </Cue>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={routes.work("v2", project.slug)} className={BTN_PRIMARY}>
              Read the case study<span className="jt-sr-only">: {project.name}</span>
            </Link>
            {repo ? (
              <a href={repo.href} className={BTN_GHOST} rel="noopener">
                {repo.label} <ExternalArrow />
              </a>
            ) : null}
          </div>
          {!repo && project.linkNote ? <p className="mt-4 text-sm text-muted">{project.linkNote}</p> : null}
        </div>

        <Cue enter={{ at: [0, 0.3], y: 100, scale: 0.88 }} exit={{ at: [0.85, 1], y: -30, scale: 0.97 }} className="v2-frame-fit">
          <Frame title={`fig ${no(n)} · ${project.slug} · architecture`}>
            {spec && project.diagram ? (
              <LazyDiagram
                id={project.diagram}
                caption={`Fig ${no(n)}. ${CAPTIONS[project.diagram]}`}
                label={`${spec.title}. ${spec.description}`}
                wide={ratio(spec.wide)}
                tall={ratio(spec.tall)}
              />
            ) : (
              <Poster project={project} large />
            )}
          </Frame>
        </Cue>
      </div>
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 06: more launches on a filmstrip                              */
/* ------------------------------------------------------------------ */

export function MoreWork({ n }: { n: number }) {
  return (
    <Filmstrip
      id="more-work"
      labelledBy="v2-more-title"
      regionLabel="More projects, scrolls sideways"
      header={
        <>
          <Eyebrow>{`Scene ${no(n)} · More launches`}</Eyebrow>
          <h2 id="v2-more-title" className="v2-h2 mt-5">
            AI on stage, agents in a team, an app in two stores.
          </h2>
          <p className="v2-body mt-5 max-w-md">
            A keynote avatar, agents built with the yconic team, a small-model challenge and a gym app shipped to both stores.
          </p>
        </>
      }
    >
      {FILM_PROJECTS.map((p) => (
        <article key={p.slug} className="v2-film-card" data-film-card="" aria-labelledby={`v2-film-${p.slug}`}>
          <Poster project={p} showName={false} />
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {teamLabel(p)} · {p.dates.label}
          </p>
          <h3 id={`v2-film-${p.slug}`} className="v2-h3 -mt-1">
            {p.name}
          </h3>
          <p className="-mt-2 text-accent">{p.tagline}</p>
          <p className="text-sm leading-relaxed text-muted">{p.oneLiner}</p>
          {p.metrics.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {p.metrics.slice(0, 3).map((mt) => (
                <li key={mt.evidence}>
                  <ProofChip metric={mt} quiet />
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-2 text-sm">
            <Link href={routes.work("v2", p.slug)} className="v2-link inline-flex min-h-11 items-center font-semibold text-fg">
              Case study<span className="jt-sr-only">: {p.name}</span>
            </Link>
            {p.links.slice(0, 2).map((l) => (
              <a key={l.href} href={l.href} className="v2-link inline-flex min-h-11 items-center gap-1 text-muted" rel="noopener">
                {l.label} <ExternalArrow />
              </a>
            ))}
          </div>
        </article>
      ))}
    </Filmstrip>
  );
}

/* ------------------------------------------------------------------ */
/* Scene 07: on stage. Beats cross-fade under a moving spotlight       */
/* ------------------------------------------------------------------ */

interface Beat {
  key: string;
  label: string;
  title: string;
  detail: string;
  link?: { href: string; label: string; internal?: boolean };
}

/** Each beat fades up into its window and out of it; the first is on stage at the start. */
function beatLegs(i: number, count: number): { enter?: Leg; exit?: Leg } {
  const start = 0.04;
  const span = (0.96 - start) / count;
  const s = start + i * span;
  const e = s + span;
  if (count === 1) return {};
  const enter: Leg = { at: [s - 0.01, s + 0.05], y: 50, opacity: 0 };
  const exit: Leg = { at: [e - 0.05, e], y: -50, opacity: 0 };
  if (i === 0) return { exit };
  if (i === count - 1) return { enter };
  return { enter, exit };
}

export function Spotlight({ n }: { n: number }) {
  const award = awards[0];
  const eve = timeline.find((t) => t.id === "eve-2026");
  const tedx = community.find((c) => c.id === "tedxprovidence");
  const bryant = community.find((c) => c.id === "bryant-hackathon");
  const teaching = community.find((c) => c.id === "teaching");

  const beats: Beat[] = [];
  if (award) {
    beats.push({
      key: award.id,
      label: "Recognition",
      title: award.wording,
      detail: award.detail,
      link: award.link ? { href: award.link.href, label: award.link.label } : undefined,
    });
  }
  if (eve) {
    beats.push({
      key: eve.id,
      label: `Keynote · ${eve.when}`,
      title: eve.title,
      detail: eve.body,
      link: { href: routes.work("v2", "eve"), label: "Read the Eve case study", internal: true },
    });
  }
  if (tedx) {
    beats.push({ key: tedx.id, label: `Leadership · ${tedx.dates ?? tedx.org}`, title: tedx.title, detail: tedx.detail, link: tedx.link ? { href: tedx.link.href, label: tedx.link.label } : undefined });
  }
  if (bryant) {
    beats.push({
      key: bryant.id,
      label: "Community",
      title: bryant.title,
      detail: teaching ? `${bryant.detail} ${teaching.detail}` : bryant.detail,
    });
  }

  return (
    <Scene id="on-stage" length={110 + beats.length * 70} labelledBy="v2-stage-title" className="v2-spot-scene">
      <div className="v2-layers" aria-hidden="true">
        {/* The beam roams on its own keyframes (theme.css) across the pinned scene. */}
        <div className="v2-spot" />
        <div className="v2-spot-floor" />
      </div>
      <div className="v2-container">
        <h2 id="v2-stage-title" className="v2-eyebrow">
          {`Scene ${no(n)} · On stage`}
        </h2>
        <div className="v2-beats mt-10 lg:min-h-[52svh]">
          {beats.map((b, i) => {
            const legs = beatLegs(i, beats.length);
            return (
              <Cue key={b.key} enter={legs.enter} exit={legs.exit} className="max-w-5xl">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-2">{b.label}</p>
                <h3 className="v2-display-md mt-5">{b.title}</h3>
                <p className="v2-lead mt-6 max-w-3xl text-muted">{b.detail}</p>
                {b.link ? (
                  b.link.internal ? (
                    <Link href={b.link.href} className="v2-link mt-6 inline-flex min-h-11 items-center font-medium">
                      {b.link.label}
                    </Link>
                  ) : (
                    <a href={b.link.href} className="v2-link mt-6 inline-flex min-h-11 items-center gap-1 font-medium" rel="noopener">
                      {b.link.label} <ExternalArrow />
                    </a>
                  )
                ) : null}
              </Cue>
            );
          })}
        </div>
      </div>
    </Scene>
  );
}

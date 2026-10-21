import Link from "next/link";
import { CopyEmail, Monogram, MotionToggle, ResumeButton, VersionSwitcher } from "@/components/shared";
import {
  awards,
  community,
  education,
  experience,
  getEvidence,
  identities,
  nowBuilding,
  profile,
  skills,
  type Experience,
} from "@/content";
import { routes } from "@/lib/site";
import type { SectionInfo } from "./data";
import { CountUp, DrawRule, Parallax, Reveal } from "./motion";
import { SectionHead } from "./SectionHead";

/* ---------- 02 Systems: the two practices and the index of terms ---------- */

export function SystemsSection({ s }: { s: SectionInfo }) {
  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} data-running-head={`${s.num} ${s.label}`}>
      <SectionHead
        num={s.num}
        label={s.label}
        title={s.title}
        titleId={`${s.id}-title`}
        deck="Two practices, one habit: build the thing, prove it works, and write down what it cannot do yet."
      />
      <div className="v1-wrap mt-16 md:mt-24">
        {identities.map((idn, i) => (
          <article
            key={idn.id}
            aria-labelledby={`practice-${idn.id}`}
            className="v1-grid border-t border-fg py-10 md:py-16"
          >
            <div className="col-span-12 md:col-span-4 lg:col-span-5">
              <div className="md:sticky md:top-[calc(var(--v1-mast)+24px)]">
                <p className="v1-label">{idn.rank === "primary" ? "Primary practice" : "Secondary practice"}</p>
                <p
                  aria-hidden="true"
                  className={`v1-num mt-2 text-[clamp(7rem,22vw,20rem)] leading-[0.78] ${i === 0 ? "text-accent" : "text-accent-2"}`}
                >
                  {i === 0 ? "A" : "B"}
                </p>
              </div>
            </div>
            <div className="col-span-12 md:col-span-8 lg:col-span-7">
              <h3 id={`practice-${idn.id}`} className="v1-h3 text-[clamp(2rem,4.6vw,4rem)]">
                {idn.title}
              </h3>
              <Reveal className="mt-6">
                <p className="v1-prose-lg">{idn.pitch}</p>
              </Reveal>
              <ol className="mt-10 border-t border-line">
                {idn.proof.map((p, j) => (
                  <li key={p} className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-line py-4">
                    <span className="v1-label pt-1 text-accent">{String(j + 1).padStart(2, "0")}</span>
                    <span className="leading-relaxed">{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>

      <div className="v1-wrap mt-8">
        <div className="v1-grid border-t-4 border-fg pt-4">
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <h3 className="v1-label v1-label-ink">Appendix</h3>
            <p className="mt-2 font-display text-3xl font-black tracking-[-0.04em]">Index of terms</p>
          </div>
          <div className="v1-index-cols col-span-12 mt-8 md:col-span-9 md:mt-0 lg:col-span-10">
            {skills.map((g) => (
              <div key={g.id} className="mb-8">
                <h4 className="border-b border-fg pb-1 font-display text-lg font-extrabold tracking-[-0.02em]">
                  {g.title}
                </h4>
                <ul className="mt-2 space-y-0.5 text-[0.9375rem] leading-relaxed">
                  {g.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {g.note ? <p className="mt-2 text-sm italic text-muted">{g.note}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- 04 Record: employment, a statement of change, education ---------- */

function ExperienceEntry({ e, lead }: { e: Experience; lead: boolean }) {
  const caseHref = e.relatedProject ? routes.work("v1", e.relatedProject) : null;
  return (
    <article aria-labelledby={`exp-${e.id}`} className="v1-grid gap-y-6 border-t border-fg py-10 md:py-14">
      <div className="col-span-12 md:col-span-4 lg:col-span-3">
        <p className="v1-label v1-label-ink">{e.dates.label}</p>
        <h3 id={`exp-${e.id}`} className="v1-h3 mt-3">
          {e.company}
        </h3>
        {e.formerly ? <p className="mt-1 text-sm text-muted">formerly {e.formerly}</p> : null}
        <p className="mt-3 font-semibold">{e.role}</p>
        <p className="text-sm text-muted">{e.location}</p>
        {e.url ? (
          <p className="mt-3 text-sm">
            <a href={e.url} className="v1-link">
              {e.url.replace("https://", "")}
            </a>
          </p>
        ) : null}
        {caseHref ? (
          <p className="mt-3 text-sm">
            <Link href={caseHref} className="v1-link">
              Read the case study
            </Link>
          </p>
        ) : null}
      </div>
      <div className="col-span-12 md:col-span-8 lg:col-span-9">
        <p className={lead ? "v1-prose-lg" : "v1-prose text-muted"}>{e.about}</p>
        <ol className={`mt-8 grid gap-x-[var(--v1-gap)] ${lead ? "lg:grid-cols-2" : ""}`}>
          {e.highlights.map((h, j) => (
            <li key={h} className="grid grid-cols-[2.5rem_1fr] gap-x-3 border-t border-line py-3">
              <span className="v1-label pt-1">{String(j + 1).padStart(2, "0")}</span>
              <span className="leading-relaxed">{h}</span>
            </li>
          ))}
        </ol>
        {e.metrics.length > 0 ? (
          <dl className="mt-8 grid grid-cols-2 gap-x-[var(--v1-gap)] gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {e.metrics.map((x) => (
              <div key={x.evidence} className="border-t-4 border-fg pt-2">
                <dt className="jt-sr-only">{x.label}</dt>
                <dd>
                  <CountUp value={x.value} className="v1-num block text-[2.6rem]" />
                  <span className="mt-1 block text-xs text-muted">{x.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </article>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The HumanixOS before and after, set as an accounting statement. Values come from evidence rows. */
function StatementOfChange() {
  const rows = [
    {
      process: "Unattended UiPath import bot (REFramework)",
      before: `${getEvidence("hx-import").value} manual import`,
      after: "Zero-touch",
    },
    {
      process: "Nonprofit verification, human in the loop",
      before: cap(getEvidence("hx-verify-before").value),
      after: cap(getEvidence("hx-verify-after").value),
    },
    {
      process: `AI-assisted column mapping, ${getEvidence("hx-records").value} record imports`,
      before: "Manual mapping",
      after: `${getEvidence("hx-mapping").value} less manual mapping`,
    },
  ];
  return (
    <Reveal className="v1-grid py-10 md:py-14">
      <div className="col-span-12 md:col-span-4 lg:col-span-3">
        <p className="v1-label v1-label-ink">Statement of change</p>
        <p className="mt-3 max-w-[28ch] text-sm leading-relaxed text-muted">
          What three HumanixOS automations replaced, booked the way I used to keep books.
        </p>
      </div>
      <div className="col-span-12 mt-6 md:col-span-8 md:mt-0 lg:col-span-9">
        <table className="v1-ledger">
          <caption className="jt-sr-only">Before and after three HumanixOS automations</caption>
          <thead>
            <tr>
              <th scope="col" className="v1-label v1-label-ink">
                Process
              </th>
              <th scope="col" className="v1-label v1-label-ink">
                Before
              </th>
              <th scope="col" className="v1-label v1-label-ink">
                After
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.process}>
                <th scope="row" className="w-[44%] font-semibold">
                  {r.process}
                </th>
                <td className="v1-ledger-num text-muted line-through decoration-accent decoration-2">{r.before}</td>
                <td className="v1-ledger-num">{r.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Reveal>
  );
}

export function RecordSection({ s }: { s: SectionInfo }) {
  const [lead, ...rest] = experience;
  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} data-running-head={`${s.num} ${s.label}`}>
      <SectionHead
        num={s.num}
        label={s.label}
        title={s.title}
        titleId={`${s.id}-title`}
        deck="Most recent first: the day job, the company I co-founded, and the chapter before software."
      />
      <div className="v1-wrap mt-16">
        {lead ? <ExperienceEntry e={lead} lead /> : null}
        <StatementOfChange />
        {rest.map((e) => (
          <ExperienceEntry key={e.id} e={e} lead={false} />
        ))}
        <div className="v1-grid gap-y-6 border-t-4 border-fg py-10">
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <h3 className="v1-label v1-label-ink">Education</h3>
          </div>
          <ul className="col-span-12 md:col-span-8 lg:col-span-9">
            {education.map((ed) => (
              <li key={ed.id} className="grid gap-x-[var(--v1-gap)] gap-y-1 border-b border-line py-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-display text-2xl font-extrabold tracking-[-0.03em]">{ed.credential}</p>
                  <p className="text-muted">
                    {ed.school}, {ed.location}
                  </p>
                  {ed.detail ? <p className="mt-1 text-sm">{ed.detail}</p> : null}
                </div>
                <p className="v1-label v1-label-ink sm:text-right">{ed.dates}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 05 Off the books: award, community, the business side, two languages ---------- */

export function PeopleSection({ s }: { s: SectionInfo }) {
  const award = awards[0];
  const businessSide = profile.bio[2];
  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} data-running-head={`${s.num} ${s.label}`}>
      <SectionHead
        num={s.num}
        label={s.label}
        title={s.title}
        titleId={`${s.id}-title`}
        deck="The parts of the record that are not code: rooms I helped build, people I managed, and a win I share with a team."
      />

      <div className="v1-wrap mt-16 md:mt-24">
        {award ? (
          <Reveal>
            <figure className="v1-grid gap-y-6 border-y-4 border-fg py-10 md:py-14">
              <p className="v1-label v1-label-ink col-span-12 md:col-span-3 lg:col-span-2">
                <span className="text-accent">★</span> Award
              </p>
              <div className="col-span-12 md:col-span-9 lg:col-span-10">
                <blockquote className="border-l-[6px] border-accent pl-5 font-display text-[clamp(1.6rem,3.6vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] md:pl-8">
                  <p>{award.wording}</p>
                </blockquote>
                <figcaption className="mt-6 max-w-[60ch] leading-relaxed text-muted">
                  {award.detail}{" "}
                  {award.link ? (
                    <a href={award.link.href} className="v1-link text-fg">
                      {award.link.label}
                    </a>
                  ) : null}
                </figcaption>
              </div>
            </figure>
          </Reveal>
        ) : null}
      </div>

      <div className="v1-wrap mt-16 md:mt-24">
        <div aria-hidden="true" className="select-none overflow-hidden">
          <Parallax axis="x" distance={70}>
            <p className="v1-num whitespace-nowrap text-[clamp(4.5rem,17vw,16rem)]">Hello.</p>
          </Parallax>
          <Parallax axis="x" distance={-70}>
            <p className="v1-num whitespace-nowrap text-right text-[clamp(4.5rem,17vw,16rem)] text-accent">Hola.</p>
          </Parallax>
        </div>
        <div className="v1-grid mt-10 gap-y-6">
          <p className="v1-label v1-label-ink col-span-12 md:col-span-3 lg:col-span-2">Working languages</p>
          <p className="v1-standfirst col-span-12 md:col-span-9 lg:col-span-10">
            {profile.languages.join(" and ")}.
          </p>
        </div>
        {businessSide ? (
          <div className="v1-grid mt-12 gap-y-6">
            <p className="v1-label v1-label-ink col-span-12 md:col-span-3 lg:col-span-2">The business side</p>
            <Reveal className="col-span-12 md:col-span-9 lg:col-span-7">
              <p className="v1-prose-lg v1-dropcap">{businessSide}</p>
            </Reveal>
          </div>
        ) : null}
      </div>

      <div className="v1-wrap mt-16 md:mt-24">
        <DrawRule />
        <ul className="grid gap-x-[var(--v1-gap)] sm:grid-cols-2 lg:grid-cols-3">
          {community.map((c) => (
            <li key={c.id} className="border-b border-line py-6 pr-2">
              <p className="v1-label">
                {c.kind}
                {c.dates ? <span className="text-fg">, {c.dates}</span> : null}
              </p>
              <h3 className="mt-3 font-display text-[1.45rem] font-extrabold leading-[1.05] tracking-[-0.03em]">
                {c.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-muted">{c.org}</p>
              <p className="mt-3 leading-relaxed">{c.detail}</p>
              {c.link ? (
                <p className="mt-3 text-sm">
                  <a href={c.link.href} className="v1-link">
                    {c.link.label}
                  </a>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 06 Now ---------- */

export function NowSection({ s }: { s: SectionInfo }) {
  return (
    <section id={s.id} aria-labelledby={`${s.id}-title`} data-running-head={`${s.num} ${s.label}`}>
      <SectionHead num={s.num} label={s.label} title={s.title} titleId={`${s.id}-title`} />
      <div className="v1-wrap mt-12 md:mt-16">
        <ol className="grid gap-x-[var(--v1-gap)] gap-y-10 md:grid-cols-3">
          {nowBuilding.map((n, i) => (
            <li key={n.id} className="border-t-4 border-fg pt-4">
              <Reveal delay={i * 0.08}>
                <p className="v1-label flex items-center gap-2">
                  <span aria-hidden="true" className="inline-block h-2.5 w-2.5 bg-accent" /> In progress
                </p>
                <h3 className="v1-h3 mt-4">{n.title}</h3>
                <p className="mt-3 leading-relaxed">{n.detail}</p>
                {n.project ? (
                  <p className="mt-4 text-sm">
                    <Link href={routes.work("v1", n.project)} className="v1-link">
                      Case study<span className="jt-sr-only">: {n.title}</span>
                    </Link>
                  </p>
                ) : null}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- 07 Contact ---------- */

export function ContactSection({ s }: { s: SectionInfo }) {
  return (
    <section
      id={s.id}
      aria-labelledby={`${s.id}-title`}
      data-running-head={`${s.num} ${s.label}`}
      className="pb-24 md:pb-36"
    >
      <SectionHead num={s.num} label={s.label} title={s.title} titleId={`${s.id}-title`} deck={profile.availability} />
      <div className="v1-wrap mt-12 md:mt-16">
        <div className="v1-grid">
          <div className="col-span-12 md:col-span-9 md:col-start-4 lg:col-span-10 lg:col-start-3">
            <div className="v1-copy-wide">
              <CopyEmail
                className="v1-cta-row"
                label={
                  <>
                    Copy my email <span className="v1-arrow" aria-hidden="true">→</span>
                  </>
                }
                copiedLabel={
                  <>
                    Copied. Talk soon <span aria-hidden="true">✓</span>
                  </>
                }
                addressClassName="v1-email-address"
              />
            </div>
            <ResumeButton className="v1-cta-row">
              Download the resume <span className="v1-arrow v1-arrow-down" aria-hidden="true">↓</span>
            </ResumeButton>
            <a href={profile.links.linkedin.href} className="v1-cta-row">
              LinkedIn <span className="v1-arrow" aria-hidden="true">↗</span>
            </a>
            <a href={profile.links.github.href} className="v1-cta-row border-b">
              GitHub <span className="v1-arrow" aria-hidden="true">↗</span>
            </a>
            <p className="v1-label mt-4">
              {profile.location.label}. {profile.languages.join(" and ")}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Colophon (footer) ---------- */

export function Colophon() {
  return (
    <footer className="v1-colophon border-t-4 border-fg bg-surface">
      <div className="v1-wrap v1-grid gap-y-10 py-12 md:py-16">
        <div className="col-span-12 md:col-span-5">
          <Monogram variant="editorial" size={88} animate={false} decorative />
          <p className="mt-4 font-display text-3xl font-black tracking-[-0.04em]">{profile.name}</p>
          <p className="mt-1 text-muted">
            {profile.headline}, {profile.location.short}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <li>
              <Link href={routes.home("v1")} className="v1-link inline-flex min-h-11 items-center">
                The index
              </Link>
            </li>
            <li>
              <Link href={routes.about("v1")} className="v1-link inline-flex min-h-11 items-center">
                About Johnlenny
              </Link>
            </li>
            <li>
              <a href={profile.links.linkedin.href} className="v1-link inline-flex min-h-11 items-center">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.links.github.href} className="v1-link inline-flex min-h-11 items-center">
                GitHub
              </a>
            </li>
          </ul>
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <h2 className="v1-label v1-label-ink">Colophon</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Set in Inter Tight, Inter and JetBrains Mono on a twelve-column grid. Built with Next.js and Framer
            Motion. One set of facts, four editions.
          </p>
          <div className="mt-5">
            <MotionToggle className="v1-toggle" label="Motion" />
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-4">
          <h2 className="v1-label v1-label-ink">Editions of this site</h2>
          <div className="mt-3">
            <VersionSwitcher display="full" label="Editions of this site" />
          </div>
          <p className="mt-2 text-sm">
            <Link href={routes.compare} className="v1-link inline-flex min-h-11 items-center">
              All versions
            </Link>
          </p>
        </div>
      </div>
      <div className="v1-wrap flex flex-wrap justify-between gap-2 border-t border-line py-4">
        <p className="v1-label">© 2026 {profile.name}</p>
        <a href="#main" className="v1-label v1-link inline-flex min-h-11 items-center">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}

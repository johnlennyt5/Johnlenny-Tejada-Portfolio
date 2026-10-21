import Link from "next/link";
import { CopyEmail } from "@/components/shared/CopyEmail";
import { ResumeButton } from "@/components/shared/ResumeButton";
import { awards, community, education, experience, identities, profile, skills } from "@/content";
import type { Experience } from "@/content";
import { Ribbon } from "./motion/Ribbon";
import { SealStamp } from "./motion/SealStamp";
import { Settle } from "./motion/Settle";
import { chapters, houseRules, roman } from "./story";

/* ---------- Preface: the short version and the contents ---------- */

const BACK_MATTER = [
  { label: "The work, plate by plate", href: "#work", tag: "Part two" },
  { label: "House rules and the type case", href: "#how", tag: "Part three" },
  { label: "At work, and beyond it", href: "#at-work", tag: "Part four" },
  { label: "Dear reader", href: "#contact", tag: "Last page" },
];

export function Preface() {
  const ribbonItems = skills
    .filter((g) => g.id === "automation" || g.id === "ai" || g.id === "languages" || g.id === "web")
    .flatMap((g) => g.items);
  return (
    <>
      <section aria-labelledby="preface-title" className="v4-wrap pt-6 pb-16 sm:pb-20">
        <div className="v4-double-rule grid gap-14 pt-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="v4-eyebrow">Preface</p>
            <h2 id="preface-title" className="v4-section-title mt-3">
              The short version
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {identities.map((idn, i) => (
                <Settle key={idn.id} from={i === 0 ? -2 : 2} rest={i === 0 ? -0.8 : 0.8} to={i === 0 ? 0.5 : -0.5} drift={18}>
                  <article className="v4-paper v4-tape h-full p-6" aria-labelledby={`identity-${idn.id}`}>
                    <p className="v4-smallcaps text-sm text-muted">{idn.rank === "primary" ? "First and foremost" : "And also"}</p>
                    <h3 id={`identity-${idn.id}`} className="v4-italic mt-1 text-[1.75rem] leading-tight">
                      {idn.title}
                    </h3>
                    <p className="mt-3">{idn.pitch}</p>
                    <ul className="v4-list-dash mt-5 space-y-2.5 p-0 text-[0.98rem] leading-relaxed">
                      {idn.proof.map((pr) => (
                        <li key={pr} className="list-none">
                          {pr}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Settle>
              ))}
            </div>
          </div>
          <nav aria-labelledby="contents-title" className="lg:col-span-5">
            <h2 id="contents-title" className="v4-eyebrow">
              Contents
            </h2>
            <ol className="mt-4 list-none p-0">
              {chapters.map((c) => (
                <li key={c.id} className="border-b border-[var(--c-rule)]">
                  <a href={`#${c.id}`} className="v4-toc-row group flex min-h-12 items-baseline gap-3 py-2 no-underline">
                    <span className="v4-numeral w-10 shrink-0 text-xl">{c.numeral}</span>
                    <span className="v4-italic text-xl leading-snug group-hover:text-accent">{c.title}</span>
                    <span className="v4-smallcaps shrink-0 text-sm text-muted">{c.years}</span>
                  </a>
                </li>
              ))}
              {BACK_MATTER.map((b) => (
                <li key={b.href} className="border-b border-[var(--c-rule)]">
                  <a href={b.href} className="v4-toc-row group flex min-h-12 items-baseline gap-3 py-2 no-underline">
                    <span className="v4-numeral w-10 shrink-0 text-xl" aria-hidden="true">
                      ¶
                    </span>
                    <span className="v4-display text-xl leading-snug font-semibold group-hover:text-accent">{b.label}</span>
                    <span className="v4-smallcaps shrink-0 text-sm text-muted">{b.tag}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>
      <div className="py-6">
        <Ribbon items={ribbonItems} label="Tools I work with" />
      </div>
    </>
  );
}

/* ---------- Type case: every skill, sorted into drawers ---------- */

export function TypeCase({ headingLevel = 4 }: { headingLevel?: 3 | 4 }) {
  const H = headingLevel === 3 ? "h3" : "h4";
  return (
    <div className="v4-typecase">
      {skills.map((g) => (
        <section key={g.id} aria-labelledby={`tc-${g.id}`}>
          <H id={`tc-${g.id}`} className="v4-smallcaps text-base">
            {g.title}
          </H>
          <ul className="mt-3 flex list-none flex-wrap gap-1.5 p-0">
            {g.items.map((it) => (
              <li key={it} className="v4-sort">
                {it}
              </li>
            ))}
          </ul>
          {g.note ? <p className="mt-3 text-sm text-muted">{g.note}</p> : null}
        </section>
      ))}
    </div>
  );
}

/* ---------- Part three: house rules ---------- */

const SIGN_TILTS = [-1.2, 0.8, -0.5, 1.1, -0.9, 0.6];

export function HouseRules() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-4 py-20 sm:py-28">
      <div className="v4-wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="v4-eyebrow">Part three</p>
            <h2 id="how-title" className="v4-section-title mt-3">
              House rules
            </h2>
          </div>
          <p className="self-end text-lg text-muted lg:col-span-5">
            How I work, posted by the register the way a shop posts its rules. Each one comes with a receipt from the
            record.
          </p>
        </div>
        <ol className="mt-14 grid list-none gap-8 p-0 md:grid-cols-2 lg:grid-cols-3">
          {houseRules.map((r, i) => {
            const tilt = SIGN_TILTS[i % SIGN_TILTS.length] ?? 0;
            return (
              <li key={r.title}>
                <Settle className="h-full" from={tilt * 3} rest={tilt} to={-tilt} drift={26}>
                  <div className="v4-sign flex h-full flex-col">
                    <p className="v4-numeral text-3xl leading-none" aria-hidden="true">
                      {roman(i + 1)}
                    </p>
                    <h3 className="v4-display mt-2 text-2xl leading-tight font-semibold">{r.title}</h3>
                    <p className="mt-3">{r.text}</p>
                    <p className="mt-auto border-t border-dashed border-[var(--c-strong-line)] pt-3 text-[0.95rem] leading-relaxed text-muted">
                      <span className="v4-smallcaps text-fg">Receipt, {r.source}:</span> {r.proof}
                    </p>
                    {r.href ? (
                      <Link className="v4-link mt-2 inline-flex min-h-11 items-center" href={r.href}>
                        See {r.source}
                      </Link>
                    ) : null}
                  </div>
                </Settle>
              </li>
            );
          })}
        </ol>

        <div className="mt-24 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="v4-italic text-4xl leading-tight">The type case</h3>
            <p className="mt-3 text-muted">
              The tools I reach for, sorted into drawers the way a printer sorts type. Notes say where a tool is project
              work or past tense.
            </p>
          </div>
          <div className="lg:col-span-8">
            <TypeCase />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Part four: at work, and beyond it ---------- */

function ExperienceEntry({ e, full, level = 4 }: { e: Experience; full: boolean; level?: 3 | 4 }) {
  const H = level === 3 ? "h3" : "h4";
  const highlights = full || e.id !== "humanixos" ? e.highlights : e.highlights.slice(0, 5);
  return (
    <article className="mt-9 first:mt-6">
      <H className="v4-display text-[1.4rem] leading-snug font-semibold">
        {e.role}, {e.company}
        {e.formerly ? <span className="font-normal text-muted"> (formerly {e.formerly})</span> : null}
      </H>
      <p className="v4-smallcaps mt-1 text-base text-muted">
        {e.dates.label} <span aria-hidden="true">·</span> {e.location}
      </p>
      <p className="mt-3 leading-relaxed">{e.about}</p>
      <ul className="v4-list-dash mt-4 space-y-2.5 p-0 leading-relaxed">
        {highlights.map((h) => (
          <li key={h} className="list-none">
            {h}
          </li>
        ))}
      </ul>
      {e.url ? (
        <p className="mt-3">
          <a className="v4-link inline-flex min-h-11 items-center" href={e.url} rel="noopener">
            {e.url.replace(/^https?:\/\//, "")}
          </a>
        </p>
      ) : null}
    </article>
  );
}

export function BeyondWork({ level = 4 }: { level?: 3 | 4 }) {
  const H = level === 3 ? "h3" : "h4";
  return (
    <>
      <H className="v4-smallcaps mt-8 text-base">Recognition</H>
      <ul className="mt-3 list-none space-y-3 p-0">
        {awards.map((a) => (
          <li key={a.id} className="v4-kraft rounded-sm p-4">
            <p className="v4-italic text-xl leading-snug">{a.wording}</p>
            <p className="mt-2 text-[0.95rem] text-muted">{a.detail}</p>
            {a.link ? (
              <a className="v4-link mt-1 inline-flex min-h-11 items-center" href={a.link.href} rel="noopener">
                {a.link.label}
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      <H className="v4-smallcaps mt-10 text-base">Community</H>
      <ul className="v4-list-dash mt-3 space-y-3 p-0 leading-relaxed">
        {community.map((c) => (
          <li key={c.id} className="list-none">
            <span className="font-semibold">{c.title}</span>
            {c.dates ? <span className="text-muted">, {c.dates}</span> : null}. {c.detail}
          </li>
        ))}
      </ul>
      <H className="v4-smallcaps mt-10 text-base">Education</H>
      <ul className="mt-3 list-none space-y-3 p-0">
        {education.map((ed) => (
          <li key={ed.id}>
            <span className="v4-italic text-xl">{ed.credential}</span>
            <span className="block text-muted">
              {ed.school}, {ed.dates}
            </span>
            {ed.detail ? <span className="block text-[0.95rem]">{ed.detail}</span> : null}
          </li>
        ))}
      </ul>
      <H className="v4-smallcaps mt-10 text-base">Languages</H>
      <p className="mt-2">Bilingual: {profile.languages.join(" and ")}.</p>
    </>
  );
}

export function Spread() {
  return (
    <section id="at-work" aria-labelledby="spread-title" className="scroll-mt-4 py-20 sm:py-28">
      <div className="v4-wrap">
        <p className="v4-eyebrow">Part four</p>
        <h2 id="spread-title" className="v4-section-title mt-3 max-w-[16ch]">
          At work, and beyond it
        </h2>
        <div className="v4-spread mt-14">
          <section aria-labelledby="atwork-title">
            <h3 id="atwork-title" className="v4-italic text-4xl">
              At work
            </h3>
            {experience.map((e) => (
              <ExperienceEntry key={e.id} e={e} full={false} />
            ))}
          </section>
          <section aria-labelledby="beyond-title">
            <h3 id="beyond-title" className="v4-italic text-4xl">
              Beyond work
            </h3>
            <BeyondWork />
          </section>
        </div>
      </div>
    </section>
  );
}

export { ExperienceEntry };

/* ---------- The last page: a letter ---------- */

export function Letter({ eyebrow = "The last page" }: { eyebrow?: string }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-4 py-20 sm:py-28">
      <div className="v4-wrap">
        <Settle className="mx-auto max-w-3xl" from={2.5} rest={-0.6} to={-2} drift={30}>
          <div className="v4-paper v4-letter relative px-6 py-10 sm:px-12 sm:py-14">
            <div className="v4-postage absolute top-5 right-5 hidden sm:block" aria-hidden="true">
              <div className="flex w-[5.5rem] flex-col items-center bg-[var(--c-accent-2)] px-2 py-2 text-[var(--c-paper)]">
                <span className="v4-smallcaps text-[0.7rem] leading-none">Providence</span>
                <span className="mt-1 block h-14 w-14 rounded-full bg-[var(--c-paper)] p-1">
                  <SealStamp size="100%" spin={0} trigger="none" />
                </span>
                <span className="v4-smallcaps mt-1 text-[0.7rem] leading-none">Rhode Island</span>
              </div>
            </div>
            <p className="v4-eyebrow">{eyebrow}</p>
            <h2 id="contact-title" className="v4-italic mt-3 text-[clamp(2.6rem,7vw,4.75rem)] leading-none">
              Dear reader,
            </h2>
            <div className="mt-8 max-w-[34rem] space-y-[2rem] text-lg leading-[2rem]">
              <p>{profile.availability}</p>
              <p>
                If you are building automations, agents or the products around them, I would like to hear about it.
                Copy my email below, or find me on LinkedIn and GitHub. My resume is one click away.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <CopyEmail className="v4-btn" label="Copy my email" copiedLabel="Copied, thank you" />
              <ResumeButton className="v4-btn-ghost" />
              <a className="v4-btn-ghost" href={profile.links.linkedin.href} rel="me noopener">
                LinkedIn
              </a>
              <a className="v4-btn-ghost" href={profile.links.github.href} rel="me noopener">
                GitHub
              </a>
            </div>
            <div className="mt-12 flex items-end justify-between gap-6">
              <p className="leading-tight">
                <span className="block text-muted">Con cariño, warmly,</span>
                <span className="v4-italic block text-4xl">{profile.givenName}</span>
              </p>
              <SealStamp size={104} spin={0} trigger="view" />
            </div>
          </div>
        </Settle>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { awards, community, education, experience, getProject, identities, profile, timeline } from "@/content";
import { routes } from "@/lib/site";
import { Contact } from "./Contact";
import { Footer, Header } from "./Header";
import { Cue, Reveal, Scene } from "./cue";
import { SkillsSheet } from "./sections";
import { Eyebrow, ExternalArrow, ProofChip, no } from "./ui";

function SectionHead({ id, n, eyebrow, title }: { id: string; n: number; eyebrow: string; title: string }) {
  return (
    <div>
      <Eyebrow>{`${no(n)} · ${eyebrow}`}</Eyebrow>
      <h2 id={id} className="v2-h2 mt-5">
        {title}
      </h2>
    </div>
  );
}

/** v2 about page: behind the scenes of the launch. */
export function About() {
  const releases = [...timeline].reverse();
  const [lead, ...rest] = profile.bio;
  return (
    <>
      <Header />
      <main id="main">
        <Scene id="behind" length={170} labelledBy="v2-about-title">
          <div className="v2-layers" aria-hidden="true">
            <Cue when="always" exit={{ at: [0, 1], y: -160 }} className="v2-glow v2-glow-a" decorative />
            <Cue when="always" exit={{ at: [0, 1], y: -260 }} className="v2-glow v2-glow-b v2-glow-sm" decorative />
          </div>
          <div className="v2-container grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
            <Cue exit={{ at: [0.6, 1], y: -60, opacity: 0.4 }}>
              <Eyebrow>Behind the scenes</Eyebrow>
              <h1 id="v2-about-title" className="mt-6">
                <span className="block font-display text-xl font-medium tracking-tight text-muted sm:text-2xl">About</span>
                <span className="v2-display mt-2 block">
                  <span className="v2-grad">{profile.name}</span>
                </span>
              </h1>
              <p className="v2-lead mt-8 max-w-3xl">{lead}</p>
            </Cue>
            <Cue exit={{ at: [0, 1], y: -80, scale: 0.86 }} className="order-first lg:order-none lg:justify-self-end">
              <div className="v2-headshot">
                <Image
                  src={profile.headshot.src}
                  width={profile.headshot.width}
                  height={profile.headshot.height}
                  alt={profile.headshot.alt}
                  priority
                />
              </div>
              <p className="v2-caption mt-4 text-center">{profile.location.label}</p>
            </Cue>
          </div>
        </Scene>

        <section aria-labelledby="v2-words-title" className="py-20 sm:py-28">
          <div className="v2-container grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
            <SectionHead id="v2-words-title" n={1} eyebrow="In my words" title="Builder, manager, organizer." />
            <div className="grid gap-6">
              {rest.map((para, i) => (
                <Reveal key={para.slice(0, 40)} delay={i * 0.05}>
                  <p className={i === 0 ? "v2-lead" : "v2-lead text-muted"}>{para}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="v2-identity-title" className="py-20 sm:py-28">
          <div className="v2-container">
            <SectionHead id="v2-identity-title" n={2} eyebrow="Two roles, one engineer" title="What I do." />
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              {identities.map((idn) => (
                <Reveal key={idn.id} className="v2-panel flex flex-col">
                  <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-2">{idn.rank === "primary" ? "Primary" : "Also"}</p>
                  <h3 className="v2-h3 mt-3">{idn.title}</h3>
                  <p className="v2-body mt-4">{idn.pitch}</p>
                  <ul className="mt-5 grid gap-3">
                    {idn.proof.map((p) => (
                      <li key={p} className="flex gap-3 leading-relaxed">
                        <span className="mt-[0.6rem] h-1.5 w-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-6 text-sm">
                    {idn.projects.map((slug) => {
                      const p = getProject(slug);
                      return p ? (
                        <li key={slug}>
                          <Link href={routes.work("v2", slug)} className="v2-link inline-flex min-h-11 items-center">
                            {p.name}
                          </Link>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="v2-exp-title" className="py-20 sm:py-28">
          <div className="v2-container">
            <SectionHead id="v2-exp-title" n={3} eyebrow="Experience" title="Where I have worked." />
            <ol className="mt-12 grid gap-6">
              {experience.map((e) => (
                <Reveal as="li" key={e.id} className="v2-panel grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{e.dates.label}</p>
                    <h3 className="v2-h3 mt-3">{e.company}</h3>
                    <p className="mt-1 text-accent">{e.role}</p>
                    <p className="mt-1 text-sm text-muted">
                      {e.location}
                      {e.formerly ? `, formerly ${e.formerly}` : ""}
                    </p>
                    {e.metrics.length > 0 ? (
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {e.metrics.slice(0, 4).map((mt) => (
                          <li key={mt.evidence}>
                            <ProofChip metric={mt} quiet />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {e.links.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-x-4 text-sm">
                        {e.links.map((l) => (
                          <li key={l.href}>
                            <a href={l.href} className="v2-link inline-flex min-h-11 items-center gap-1" rel="noopener">
                              {l.label} <ExternalArrow />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div>
                    <p className="v2-body">{e.about}</p>
                    <ul className="mt-5 grid gap-3">
                      {e.highlights.map((h) => (
                        <li key={h} className="flex gap-3 leading-relaxed">
                          <span className="mt-[0.6rem] h-1.5 w-1.5 flex-none rounded-full bg-accent-2" aria-hidden="true" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={`${e.company} stack`}>
                      {e.stack.map((s) => (
                        <li key={s} className="v2-tag">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="v2-release-title" className="py-20 sm:py-28">
          <div className="v2-container grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
            <div className="lg:sticky lg:top-[calc(var(--v2-header-h)+2rem)] lg:self-start">
              <SectionHead id="v2-release-title" n={4} eyebrow="Release notes" title="The changelog." />
              <p className="v2-body mt-6">Newest first, all the way back to {timeline[0]?.when ?? "the start"}.</p>
            </div>
            <ol>
              {releases.map((t) => {
                const p = t.project ? getProject(t.project) : undefined;
                return (
                  <Reveal as="li" key={t.id} className="v2-release" y={18}>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      {t.when}
                    </p>
                    <div>
                      <h3 className="font-display text-xl font-semibold tracking-tight">{t.title}</h3>
                      <p className="v2-body mt-1">{t.body}</p>
                      {p ? (
                        <Link href={routes.work("v2", p.slug)} className="v2-link mt-1 inline-flex min-h-11 items-center text-sm text-fg">
                          {p.name} case study
                        </Link>
                      ) : null}
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </section>

        <section aria-labelledby="v2-community-title" className="py-20 sm:py-28">
          <div className="v2-container">
            <SectionHead id="v2-community-title" n={5} eyebrow="Community and recognition" title="Rooms full of builders." />
            {awards.map((a) => (
              <Reveal key={a.id} className="v2-next mt-12">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-2">Recognition</p>
                <h3 className="v2-display-md mt-4">{a.wording}</h3>
                <p className="v2-lead mt-5 max-w-3xl text-muted">{a.detail}</p>
                {a.link ? (
                  <a href={a.link.href} className="v2-link mt-4 inline-flex min-h-11 items-center gap-1" rel="noopener">
                    {a.link.label} <ExternalArrow />
                  </a>
                ) : null}
              </Reveal>
            ))}
            <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {community.map((c, i) => (
                <Reveal as="li" key={c.id} delay={(i % 3) * 0.06} className="v2-panel">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {c.org}
                    {c.dates ? ` · ${c.dates}` : ""}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{c.title}</h3>
                  <p className="v2-body mt-2 text-sm">{c.detail}</p>
                  {c.link ? (
                    <a href={c.link.href} className="v2-link mt-2 inline-flex min-h-11 items-center gap-1 text-sm" rel="noopener">
                      {c.link.label} <ExternalArrow />
                    </a>
                  ) : null}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="v2-skills-title" className="py-20 sm:py-28">
          <div className="v2-container">
            <SectionHead id="v2-skills-title" n={6} eyebrow="Skills" title="Spec sheet." />
            <div className="mt-12">
              <SkillsSheet />
            </div>
          </div>
        </section>

        <section aria-labelledby="v2-edu-title" className="py-20 sm:py-28">
          <div className="v2-container grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
            <SectionHead id="v2-edu-title" n={7} eyebrow="Education and languages" title="Training." />
            <ul className="grid gap-4 sm:grid-cols-2">
              {education.map((ed) => (
                <Reveal as="li" key={ed.id} className="v2-panel">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {ed.dates} · {ed.location}
                  </p>
                  <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">{ed.credential}</h3>
                  <p className="mt-1 text-accent">{ed.school}</p>
                  {ed.detail ? <p className="v2-body mt-3 text-sm">{ed.detail}</p> : null}
                </Reveal>
              ))}
              <Reveal as="li" className="v2-panel sm:col-span-2">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Languages</p>
                <p className="mt-3 font-display text-xl font-semibold tracking-tight">{profile.languages.join(" and ")}</p>
              </Reveal>
            </ul>
          </div>
        </section>

        <Contact eyebrow="Your move" />
      </main>
      <Footer />
    </>
  );
}

export default About;

import Image from "next/image";
import Link from "next/link";
import { CopyEmail, ResumeButton } from "@/components/shared";
import { awards, community, education, experience, profile, skills, timeline } from "@/content";
import { routes } from "@/lib/site";
import { Frame } from "./Frame";
import { Counter } from "./motion/Counter";
import { Flow } from "./motion/Flow";
import { Node } from "./motion/Node";
import { Reveal } from "./motion/Reveal";
import { Log, Out, Prompt, SectionHeading, StatusPill, Window, pad2 } from "./ui";

const QUEUE = [
  { id: "readme", label: "README" },
  { id: "history", label: "Production history" },
  { id: "packages", label: "Packages" },
  { id: "changelog", label: "Changelog" },
  { id: "community", label: "Community" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Handoff" },
];

const ix = (id: string) => pad2(QUEUE.findIndex((q) => q.id === id) + 1);

const KIND_TONE: Record<string, string> = {
  work: "v3-tone-ok",
  build: "v3-tone-queue",
  community: "v3-tone-run",
  education: "text-muted",
  award: "v3-tone-run",
};

/** About as the robot's README: a whole person, not only a stack. */
export function About() {
  const changelog = [...timeline].reverse();
  return (
    <Frame queue="about/README.md" items={QUEUE} back={{ href: routes.home("v3"), label: "Back to the queue" }}>
      <main id="main" tabIndex={-1} className="outline-none">
        <section id="readme" aria-labelledby="readme-title" className="v3-node px-4 pt-8 pb-12 sm:px-8 lg:px-14 lg:pt-12">
          <Prompt cmd="cat README.md" typed delay={0.1} />
          <h1 id="readme-title" className="v3-hero-name mt-4 text-[clamp(3rem,1.5rem+7vw,8rem)]">
            About {profile.givenName}
          </h1>
          <p className="mt-4 font-mono text-base font-bold sm:text-xl v3-tone-ok">{profile.headline}</p>

          <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="v3-prose max-w-3xl text-lg leading-relaxed">
              {profile.bio.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
            <Out delay={0.4}>
              <div className="v3-card overflow-hidden xl:sticky xl:top-8">
                <div className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-[0.6875rem] text-muted">
                  <span>operator badge</span>
                  <StatusPill state="done">open to roles</StatusPill>
                </div>
                <div className="p-5">
                  <Image
                    src={profile.headshot.src}
                    alt={profile.headshot.alt}
                    width={profile.headshot.width}
                    height={profile.headshot.height}
                    className="h-40 w-40 rounded-lg border border-line object-cover"
                    sizes="160px"
                  />
                  <p className="mt-4 font-display text-2xl leading-none font-bold">{profile.name}</p>
                  <dl className="mt-4 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1 font-mono text-xs">
                    <dt className="text-muted">based in</dt>
                    <dd>{profile.location.short}</dd>
                    <dt className="text-muted">speaks</dt>
                    <dd>{profile.languages.join(", ")}</dd>
                    <dt className="text-muted">github</dt>
                    <dd>
                      <a href={profile.links.github.href} className="v3-link">
                        johnlennyt5
                      </a>
                    </dd>
                    <dt className="text-muted">linkedin</dt>
                    <dd>
                      <a href={profile.links.linkedin.href} className="v3-link">
                        johnlennytejada
                      </a>
                    </dd>
                  </dl>
                  <div className="mt-5 flex flex-col gap-2">
                    <CopyEmail className="v3-btn v3-btn-primary w-full" label="Copy email address" copiedLabel="Copied to clipboard" />
                    <ResumeButton className="v3-btn w-full">Download resume (PDF)</ResumeButton>
                  </div>
                </div>
              </div>
            </Out>
          </div>
        </section>

        <div className="px-4 pt-16 pb-24 sm:px-8 lg:px-14">
          <Flow>
            <div className="grid gap-28 sm:gap-36">
              <Node
                id="history"
                index={ix("history")}
                label="Production history"
                kind="Sequence"
                heading={
                  <SectionHeading id="history" index={ix("history")}>
                    Where I have <em>run in production.</em>
                  </SectionHeading>
                }
              >
                <ol className="mt-10 grid gap-6">
                  {experience.map((e) => (
                    <Reveal as="li" key={e.id}>
                      <article className="v3-card p-5 sm:p-7" aria-labelledby={`about-xp-${e.id}`}>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-muted">
                          <StatusPill state={e.dates.end === null ? "running" : "done"}>
                            {e.dates.end === null ? "running" : "done"}
                          </StatusPill>
                          <span>{e.dates.label}</span>
                          <span>{e.location}</span>
                        </div>
                        <h3 id={`about-xp-${e.id}`} className="mt-4 font-display text-3xl leading-none font-bold tracking-tight sm:text-4xl">
                          {e.company}
                        </h3>
                        <p className="mt-2 font-mono text-sm">
                          <span className="v3-tone-ok">{e.role}</span>
                          {e.formerly ? <span className="text-muted">, formerly {e.formerly}</span> : null}
                        </p>
                        <p className="mt-4 max-w-3xl leading-relaxed text-muted">{e.about}</p>
                        {e.metrics.length > 0 ? (
                          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
                            {e.metrics.map((m) => (
                              <div key={m.evidence} className="flex flex-col-reverse border-l-2 border-[color:var(--c-ok)] pl-3">
                                <dt className="mt-1 font-mono text-[0.6875rem] leading-snug text-muted">{m.label}</dt>
                                <dd className="v3-metric-value text-3xl">
                                  <Counter value={m.value} />
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : null}
                        <Log
                          className="mt-6"
                          entries={e.highlights.map((h) => ({
                            key: h,
                            tag: /\bJava\b/.test(h) ? "past" : " ok ",
                            tone: /\bJava\b/.test(h) ? ("muted" as const) : ("ok" as const),
                            body: h,
                          }))}
                        />
                        {e.links.length > 0 ? (
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {e.links.map((l) => (
                              <li key={l.href}>
                                <a href={l.href} className="v3-btn">
                                  {l.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    </Reveal>
                  ))}
                </ol>
              </Node>

              <Node
                id="packages"
                index={ix("packages")}
                label="Packages"
                kind="Library"
                heading={
                  <SectionHeading id="packages" index={ix("packages")}>
                    What the robot <em>has installed.</em>
                  </SectionHeading>
                }
              >
                <div className="mt-10 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  {skills.map((g, i) => (
                    <Reveal key={g.id} delay={(i % 3) * 0.05}>
                      <section className="v3-card h-full p-5" aria-labelledby={`pkg-${g.id}`}>
                        <h3 id={`pkg-${g.id}`} className="font-mono text-sm font-bold v3-tone-queue">
                          @jt/{g.id}
                          <span className="ml-2 font-body font-semibold text-fg">{g.title}</span>
                        </h3>
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {g.items.map((item) => (
                            <li key={item} className="v3-chip">
                              <strong>{item}</strong>
                            </li>
                          ))}
                        </ul>
                        {g.note ? <p className="mt-4 font-mono text-xs text-muted">{`// ${g.note}`}</p> : null}
                      </section>
                    </Reveal>
                  ))}
                </div>
              </Node>

              <Node
                id="changelog"
                index={ix("changelog")}
                label="Changelog"
                kind="Event log"
                heading={
                  <SectionHeading id="changelog" index={ix("changelog")}>
                    git log <em>--career</em>
                  </SectionHeading>
                }
              >
                <Window title="git log --career --newest-first" className="mt-10 max-w-4xl">
                  <ol className="v3-gitlog">
                    {changelog.map((t) => (
                      <li key={t.id}>
                        <p className="flex flex-wrap items-baseline gap-x-3">
                          <span className="v3-tone-ok">{t.when}</span>
                          <span className={KIND_TONE[t.kind] ?? "text-muted"}>({t.kind})</span>
                        </p>
                        <p className="mt-1 font-body text-base font-semibold">
                          {t.project ? (
                            <Link href={routes.work("v3", t.project)} className="v3-link">
                              {t.title}
                            </Link>
                          ) : (
                            t.title
                          )}
                        </p>
                        <p className="mt-1 font-body text-[0.9375rem] leading-relaxed text-muted">{t.body}</p>
                      </li>
                    ))}
                  </ol>
                </Window>
              </Node>

              <Node
                id="community"
                index={ix("community")}
                label="Community"
                kind="User task"
                heading={
                  <SectionHeading id="community" index={ix("community")}>
                    Rooms full <em>of builders.</em>
                  </SectionHeading>
                }
              >
                <ul className="mt-10 grid gap-5 md:grid-cols-2">
                  {awards.map((a) => (
                    <Reveal as="li" key={a.id} className="md:col-span-2">
                      <article className="v3-card p-5 sm:p-8" aria-labelledby={`award-${a.id}`}>
                        <p className="v3-eyebrow v3-tone-run">Award</p>
                        <h3 id={`award-${a.id}`} className="mt-3 font-display text-3xl leading-[0.95] font-bold tracking-tight sm:text-4xl">
                          {a.wording}
                        </h3>
                        <p className="mt-4 max-w-3xl leading-relaxed">{a.detail}</p>
                        {a.link ? (
                          <p className="mt-4">
                            <a href={a.link.href} className="v3-link font-mono text-sm">
                              {a.link.label}
                            </a>
                          </p>
                        ) : null}
                      </article>
                    </Reveal>
                  ))}
                  {community.map((c, i) => (
                    <Reveal as="li" key={c.id} delay={(i % 2) * 0.05}>
                      <article className="v3-card h-full p-5 sm:p-6" aria-labelledby={`com-${c.id}`}>
                        <p className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.6875rem] text-muted">
                          <span className="font-bold tracking-[0.1em] uppercase v3-tone-queue">{c.kind}</span>
                          <span>{c.dates ?? c.org}</span>
                        </p>
                        <h3 id={`com-${c.id}`} className="mt-3 font-display text-2xl leading-tight font-bold tracking-tight">
                          {c.title}
                        </h3>
                        <p className="mt-3 leading-relaxed">{c.detail}</p>
                        {c.link ? (
                          <p className="mt-3">
                            <a href={c.link.href} className="v3-link font-mono text-sm">
                              {c.link.label}
                            </a>
                          </p>
                        ) : null}
                      </article>
                    </Reveal>
                  ))}
                </ul>
              </Node>

              <Node
                id="education"
                index={ix("education")}
                label="Education"
                kind="Sub-process"
                heading={
                  <SectionHeading id="education" index={ix("education")}>
                    From the books <em>to the bots.</em>
                  </SectionHeading>
                }
              >
                <ul className="mt-10 grid gap-5 md:grid-cols-2">
                  {education.map((ed) => (
                    <Reveal as="li" key={ed.id}>
                      <article className="v3-card h-full p-5 sm:p-6" aria-labelledby={`edu-${ed.id}`}>
                        <p className="font-mono text-xs text-muted">
                          {ed.dates}, {ed.location}
                        </p>
                        <h3 id={`edu-${ed.id}`} className="mt-3 font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                          {ed.credential}
                        </h3>
                        <p className="mt-1 font-mono text-sm v3-tone-ok">{ed.school}</p>
                        {ed.detail ? <p className="mt-3 leading-relaxed">{ed.detail}</p> : null}
                      </article>
                    </Reveal>
                  ))}
                </ul>
              </Node>

              <Node
                id="contact"
                index={ix("contact")}
                label="Handoff"
                kind="End event"
                shape="event"
                heading={
                  <SectionHeading id="contact" index={ix("contact")} lead={<p>{profile.availability}</p>}>
                    Hand me <em>the next process.</em>
                  </SectionHeading>
                }
              >
                <div className="mt-10 flex flex-wrap gap-3">
                  <CopyEmail className="v3-btn v3-btn-primary" label="Copy email address" copiedLabel="Copied to clipboard" />
                  <ResumeButton className="v3-btn">Download resume (PDF)</ResumeButton>
                  <a className="v3-btn" href={profile.links.linkedin.href}>
                    LinkedIn
                  </a>
                  <a className="v3-btn" href={profile.links.github.href}>
                    GitHub
                  </a>
                  <Link className="v3-btn" href={`${routes.home("v3")}#work`}>
                    See the run logs
                  </Link>
                </div>
              </Node>
            </div>
          </Flow>
        </div>
      </main>
    </Frame>
  );
}

export default About;

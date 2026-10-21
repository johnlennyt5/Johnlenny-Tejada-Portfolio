import { CopyEmail, ResumeButton } from "@/components/shared";
import { awards, community, education, experience, profile, skills } from "@/content";
import { Footer, Header } from "./Header";

const BTN = "inline-flex min-h-11 items-center rounded-full border border-line px-4 font-medium no-underline hover:border-accent";

/* Stub about page for v1. The v1 agent replaces this file. */
export function About() {
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <h1 className="py-10 font-display text-4xl font-extrabold">About {profile.givenName}</h1>
        <div className="space-y-4 leading-relaxed">
          {profile.bio.map((para) => (
            <p key={para.slice(0, 32)}>{para}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <CopyEmail className={BTN} />
          <ResumeButton className={BTN} />
        </div>

        <section aria-labelledby="exp-title" className="py-10">
          <h2 id="exp-title" className="font-display text-2xl font-bold">
            Experience
          </h2>
          {experience.map((e) => (
            <article key={e.id} className="mt-6">
              <h3 className="font-display text-xl font-bold">
                {e.role}, {e.company}
              </h3>
              <p className="font-mono text-sm text-muted">
                {e.dates.label}, {e.location}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {e.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section aria-labelledby="skills-title" className="py-10">
          <h2 id="skills-title" className="font-display text-2xl font-bold">
            Skills
          </h2>
          <dl className="mt-4 space-y-3">
            {skills.map((g) => (
              <div key={g.id}>
                <dt className="font-bold">{g.title}</dt>
                <dd className="text-muted">{g.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="community-title" className="py-10">
          <h2 id="community-title" className="font-display text-2xl font-bold">
            Community and awards
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {awards.map((a) => (
              <li key={a.id}>{a.wording}</li>
            ))}
            {community.map((c) => (
              <li key={c.id}>
                <strong>{c.title}.</strong> {c.detail}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="edu-title" className="py-10">
          <h2 id="edu-title" className="font-display text-2xl font-bold">
            Education
          </h2>
          <ul className="mt-4 space-y-2">
            {education.map((ed) => (
              <li key={ed.id}>
                {ed.credential}, {ed.school} ({ed.dates})
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default About;

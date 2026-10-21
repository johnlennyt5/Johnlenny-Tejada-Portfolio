import Link from "next/link";
import { CopyEmail, ResumeButton } from "@/components/shared";
import { experience, identities, nowBuilding, profile, projects } from "@/content";
import { getVersion, routes } from "@/lib/site";
import { Footer, Header } from "./Header";

const BTN = "inline-flex min-h-11 items-center rounded-full border border-line px-4 font-medium no-underline hover:border-accent";

/* Stub home for v2 (Launch). The v2 agent replaces this file. */
export function Home() {
  const version = getVersion("v2");
  const work = [...projects].sort((a, b) => a.order - b.order);
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <section aria-labelledby="hero-title" className="py-12">
          <p className="font-mono text-sm uppercase tracking-widest text-muted">{version.name}</p>
          <h1 id="hero-title" className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
            {profile.name}
          </h1>
          <p className="mt-4 text-2xl">{profile.headline}</p>
          <p className="mt-2 text-lg text-muted">{profile.subhead}</p>
          <p className="mt-6 max-w-2xl leading-relaxed">{profile.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CopyEmail className={BTN} />
            <ResumeButton className={BTN} />
            <a className={BTN} href={profile.links.linkedin.href}>
              LinkedIn profile
            </a>
            <a className={BTN} href={profile.links.github.href}>
              GitHub profile
            </a>
          </div>
        </section>

        <section aria-labelledby="identity-title" className="py-10">
          <h2 id="identity-title" className="font-display text-2xl font-bold">
            What I do
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {identities.map((i) => (
              <div key={i.id} className="rounded-xl border border-line p-5">
                <h3 className="font-display text-xl font-bold">{i.title}</h3>
                <p className="mt-2 leading-relaxed">{i.pitch}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
                  {i.proof.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="work-title" className="py-10">
          <h2 id="work-title" className="font-display text-2xl font-bold">
            Selected work
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {work.map((p) => (
              <li key={p.slug} className="rounded-xl border border-line p-5">
                <h3 className="font-display text-xl font-bold">
                  <Link href={routes.work("v2", p.slug)} className="underline underline-offset-4">
                    {p.name}: {p.tagline}
                  </Link>
                </h3>
                <p className="mt-1 font-mono text-sm text-muted">
                  {p.role}, {p.dates.label}
                </p>
                <p className="mt-3 leading-relaxed">{p.oneLiner}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="experience-title" className="py-10">
          <h2 id="experience-title" className="font-display text-2xl font-bold">
            Experience
          </h2>
          <ul className="mt-6 space-y-6">
            {experience.map((e) => (
              <li key={e.id}>
                <h3 className="font-display text-xl font-bold">
                  {e.role}, {e.company}
                  {e.formerly ? <span className="font-normal text-muted"> (formerly {e.formerly})</span> : null}
                </h3>
                <p className="font-mono text-sm text-muted">{e.dates.label}</p>
                <p className="mt-2 leading-relaxed">{e.highlights[0]}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="now-title" className="py-10">
          <h2 id="now-title" className="font-display text-2xl font-bold">
            Now
          </h2>
          <ul className="mt-4 space-y-2">
            {nowBuilding.map((n) => (
              <li key={n.id}>
                <strong>{n.title}.</strong> {n.detail}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;

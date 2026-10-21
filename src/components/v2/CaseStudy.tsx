import Link from "next/link";
import { diagramsById } from "@/components/shared/diagrams";
import type { Project } from "@/content";
import { routes } from "@/lib/site";
import { Footer, Header } from "./Header";

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-6">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </section>
  );
}

/* Stub case study for v2. The v2 agent replaces this file. */
export function CaseStudy({ project }: { project: Project }) {
  const cs = project.caseStudy;
  const DiagramView = project.diagram ? diagramsById[project.diagram] : null;
  return (
    <>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <p className="pt-8 font-mono text-sm text-muted">
          <Link href={routes.home("v2")} className="underline underline-offset-4">
            All work
          </Link>
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold">{project.name}</h1>
        <p className="mt-2 text-xl">{project.tagline}</p>
        <p className="mt-2 font-mono text-sm text-muted">
          {project.role}, {project.dates.label}
        </p>
        <p className="mt-6 text-lg leading-relaxed">{project.oneLiner}</p>
        {project.metrics.length > 0 ? (
          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div key={m.evidence} className="rounded-lg border border-line p-3">
                <dt className="text-sm text-muted">{m.label}</dt>
                <dd className="font-display text-2xl font-bold">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {project.links.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {project.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="underline underline-offset-4">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        {project.linkNote ? <p className="mt-2 text-sm text-muted">{project.linkNote}</p> : null}
        {DiagramView ? (
          <div className="my-10">
            <DiagramView caption={`${project.name} at a glance`} />
          </div>
        ) : null}
        <section className="py-6">
          <h2 className="font-display text-2xl font-bold">Problem</h2>
          <p className="mt-3 leading-relaxed">{cs.problem}</p>
        </section>
        <List title="Constraints" items={cs.constraints} />
        {cs.decisions.length > 0 ? (
          <section className="py-6">
            <h2 className="font-display text-2xl font-bold">Decisions</h2>
            {cs.decisions.map((d) => (
              <div key={d.title} className="mt-4">
                <h3 className="font-bold">{d.title}</h3>
                <p className="mt-1 leading-relaxed">{d.detail}</p>
              </div>
            ))}
          </section>
        ) : null}
        <List title="Tradeoffs" items={cs.tradeoffs} />
        {cs.whatBroke.length > 0 ? (
          <section className="py-6">
            <h2 className="font-display text-2xl font-bold">What broke</h2>
            {cs.whatBroke.map((d) => (
              <div key={d.title} className="mt-4">
                <h3 className="font-bold">{d.title}</h3>
                <p className="mt-1 leading-relaxed">{d.detail}</p>
              </div>
            ))}
          </section>
        ) : null}
        <List title="Results" items={cs.results} />
        <List title="Tests" items={cs.tests} />
        <List title="Caveats" items={cs.caveats} />
        <section className="py-6">
          <h2 className="font-display text-2xl font-bold">Stack</h2>
          <p className="mt-3 text-muted">{project.stack.join(", ")}</p>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CaseStudy;

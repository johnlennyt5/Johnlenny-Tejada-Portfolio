import Link from "next/link";
import { getProject } from "@/content";
import { featuredSlugs, projectCopy } from "@/content/showcase";
import { routes } from "@/lib/site";
import { ArrowLeft, ArrowRight, Check } from "./icons";
import { getArch, getCodeIndex, getShots } from "./media";
import { ProjectMedia } from "./ProjectMedia";
import { T, TBlock } from "./T";

/**
 * One project, told plainly: what and why, the working window (screens, code, architecture),
 * decisions, results, how it is tested, and honest caveats. Case-study prose is English only;
 * headings and the summary are bilingual.
 */
export async function CaseStudy({ slug }: { slug: string }) {
  const p = getProject(slug)!;
  const copy = projectCopy[slug]!;
  const [shots, code, arch] = [getShots(slug, p.name), getCodeIndex(slug), getArch(slug)];
  const cs = p.caseStudy;
  const nextSlug = featuredSlugs[(featuredSlugs.indexOf(slug as never) + 1) % featuredSlugs.length] ?? featuredSlugs[0]!;
  const next = getProject(nextSlug)!;

  const sections = [
    { id: "problem", en: "The problem", es: "El problema" },
    { id: "decisions", en: "How I built it", es: "Cómo lo construí" },
    ...(cs.whatBroke.length ? [{ id: "broke", en: "What broke", es: "Qué falló" }] : []),
    { id: "results", en: "Results", es: "Resultados" },
    ...(cs.tests.length ? [{ id: "tests", en: "How it is tested", es: "Cómo se prueba" }] : []),
    { id: "caveats", en: "Honest caveats", es: "Aclaraciones honestas" },
  ];

  return (
    <>
      <section className="cs-hero">
        <div className="wrap">
          <Link className="back" href="/#build">
            <ArrowLeft />
            <T en="All projects" es="Todos los proyectos" />
          </Link>
          <h1 className="reveal">{p.name}</h1>
          <p className="role" style={{ minHeight: 0 }}>
            <span className="prompt" aria-hidden="true">
              &gt;
            </span>
            <T en={copy.title.en} es={copy.title.es} />
          </p>
          <TBlock en={<p className="lede">{copy.pitch.en}</p>} es={<p className="lede">{copy.pitch.es}</p>} />
          <dl className="cs-meta">
            <div>
              <dt>
                <T en="Role" es="Rol" />
              </dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>
                <T en="Team" es="Equipo" />
              </dt>
              <dd>{p.team === "solo" ? "Solo" : p.team === "co-founder" ? "Co-founder, 2 engineers" : "Team"}</dd>
            </div>
            <div>
              <dt>
                <T en="When" es="Cuándo" />
              </dt>
              <dd>{p.dates.label}</dd>
            </div>
            <div>
              <dt>
                <T en="Links" es="Enlaces" />
              </dt>
              <dd>
                {p.links.length
                  ? p.links.map((l, i) => (
                      <span key={l.href}>
                        {i ? " · " : ""}
                        <a href={l.href}>{l.kind === "store" ? (l.href.includes("apple") ? "App Store" : "Google Play") : l.label}</a>
                      </span>
                    ))
                  : (p.linkNote ?? "Private repository")}
              </dd>
            </div>
          </dl>
          {p.metrics.length ? (
            <div className="cs-metrics">
              {p.metrics.map((m) => (
                <div className="fact" key={m.label}>
                  <b>{m.value}</b>
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div style={{ marginTop: 40 }} className="reveal">
            <ProjectMedia name={p.name} shots={shots} code={code} codeUrl={`/code/${slug}.json`} arch={arch} fallback={{ big: p.name, small: copy.title.en }} />
          </div>
        </div>
      </section>

      <div className="wrap cs-body">
        <nav className="toc" aria-label="On this page">
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <T en={s.en} es={s.es} />
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div>
          <section className="cs-section reveal" id="problem">
            <h2>
              <T en="The problem" es="El problema" />
            </h2>
            <p>{cs.problem}</p>
            {cs.constraints.length ? (
              <ul className="cs-list" style={{ marginTop: 18 }}>
                {cs.constraints.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : null}
          </section>

          <section className="cs-section reveal" id="decisions">
            <h2>
              <T en="How I built it" es="Cómo lo construí" />
            </h2>
            <ul className="cs-list">
              {cs.decisions.map((d) => (
                <li key={d.title}>
                  <b>{d.title}</b>
                  {d.detail}
                </li>
              ))}
            </ul>
            {cs.tradeoffs.length ? (
              <>
                <h3 style={{ font: "700 1.15rem var(--ff-d)", margin: "28px 0 12px" }}>
                  <T en="Trade-offs" es="Compensaciones" />
                </h3>
                <ul className="cs-list">
                  {cs.tradeoffs.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          {cs.whatBroke.length ? (
            <section className="cs-section reveal" id="broke">
              <h2>
                <T en="What broke, and the fix" es="Qué falló y cómo lo arreglé" />
              </h2>
              <ul className="cs-list">
                {cs.whatBroke.map((d) => (
                  <li key={d.title}>
                    <b>{d.title}</b>
                    {d.detail}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="cs-section reveal" id="results">
            <h2>
              <T en="Results" es="Resultados" />
            </h2>
            <ul className="cs-list">
              {cs.results.map((r) => (
                <li key={r} style={{ display: "flex", gap: 12 }}>
                  <Check className="cs-check" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>

          {cs.tests.length ? (
            <section className="cs-section reveal" id="tests">
              <h2>
                <T en="How it is tested" es="Cómo se prueba" />
              </h2>
              <ul className="cs-list">
                {cs.tests.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="cs-section reveal" id="caveats">
            <h2>
              <T en="Honest caveats" es="Aclaraciones honestas" />
            </h2>
            <ul className="cs-list">
              {cs.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="chips" style={{ marginTop: 24 }}>
              {p.stack.map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </section>

          <a className="next-project reveal" href={routes.project(next.slug)}>
            <span>
              <span className="eyebrow">
                <T en="Next project" es="Siguiente proyecto" />
              </span>
              <b>{next.name}</b>
            </span>
            <ArrowRight className="next-arrow" />
          </a>
        </div>
      </div>
    </>
  );
}

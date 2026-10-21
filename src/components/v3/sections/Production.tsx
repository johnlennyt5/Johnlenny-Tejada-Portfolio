import { getEvidence, getExperience, type Experience } from "@/content";
import { Counter } from "../motion/Counter";
import { Node } from "../motion/Node";
import { Reveal } from "../motion/Reveal";
import { ShrinkBar } from "../motion/ShrinkBar";
import { Log, SectionHeading, StatusPill } from "../ui";

/** Java work is past tense at HumanixOS; tag it so the log reads honestly. */
function logEntries(e: Experience) {
  return e.highlights.map((h) => ({
    key: h,
    tag: /\bJava\b/.test(h) ? "past" : " ok ",
    tone: /\bJava\b/.test(h) ? ("muted" as const) : ("ok" as const),
    body: h,
  }));
}

function BeforeAfter() {
  const rows = [
    { what: "Data import", before: `${getEvidence("hx-import").value} manual run`, after: "zero-touch", to: 0.03 },
    {
      what: "Nonprofit verification",
      before: getEvidence("hx-verify-before").value,
      after: getEvidence("hx-verify-after").value,
      to: 0.06,
    },
  ];
  return (
    <div className="v3-card p-5 sm:p-6">
      <p className="v3-eyebrow">Before and after the automations</p>
      <dl className="mt-5 space-y-6">
        {rows.map((r) => (
          <div key={r.what}>
            <dt className="font-semibold">{r.what}</dt>
            <dd className="mt-2 grid gap-2 font-mono text-xs">
              <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
                <span className="text-muted">before</span>
                <span className="grid gap-1">
                  <span className="v3-bar block bg-[color:var(--c-exc)]" aria-hidden="true" />
                  <span className="v3-tone-exc">{r.before}</span>
                </span>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
                <span className="text-muted">after</span>
                <span className="grid gap-1">
                  <ShrinkBar to={r.to} className="bg-[color:var(--c-ok)]" />
                  <span className="v3-tone-ok">{r.after}</span>
                </span>
              </div>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Production({ id, index }: { id: string; index: string }) {
  const hx = getExperience("humanixos");
  const sf = getExperience("smartfit-metrics");
  const sc = getExperience("supreme-cuts");
  const since = hx.dates.start.slice(0, 4);
  return (
    <Node
      id={id}
      index={index}
      label="Production"
      kind="Unattended"
      heading={
        <SectionHeading id={id} index={index}>
          In production <em>since {since}.</em>
        </SectionHeading>
      }
    >
      <Reveal className="mt-12">
        <article className="v3-card overflow-hidden" aria-labelledby="xp-humanixos">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-3 font-mono text-xs text-muted sm:px-7">
            <StatusPill state="running">in production</StatusPill>
            <span>{hx.dates.label}</span>
            <span>{hx.location}</span>
          </div>
          <div className="grid gap-8 p-5 sm:p-7 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <h3 id="xp-humanixos" className="font-display text-4xl leading-none font-bold tracking-tight sm:text-5xl">
                {hx.company}
              </h3>
              <p className="mt-2 font-mono text-sm">
                <span className="v3-tone-ok">{hx.role}</span>
                {hx.formerly ? <span className="text-muted">, formerly {hx.formerly}</span> : null}
                {hx.url ? (
                  <>
                    <span className="text-muted">, </span>
                    <a href={hx.url} className="v3-link text-muted">
                      {hx.url.replace(/^https?:\/\//, "")}
                    </a>
                  </>
                ) : null}
              </p>
              <p className="mt-4 leading-relaxed text-muted">{hx.about}</p>
              <Log className="mt-6" entries={logEntries(hx)} />
            </div>
            <div className="grid content-start gap-6">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-2">
                {hx.metrics.map((m) => (
                  <div key={m.evidence} className="flex flex-col-reverse border-l-2 border-[color:var(--c-ok)] pl-3">
                    <dt className="mt-1 font-mono text-[0.6875rem] leading-snug text-muted">{m.label}</dt>
                    <dd className="v3-metric-value">
                      <Counter value={m.value} />
                    </dd>
                  </div>
                ))}
              </dl>
              <BeforeAfter />
            </div>
          </div>
        </article>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[sf, sc].map((e, i) => (
          <Reveal key={e.id} delay={i * 0.08}>
            <article className="v3-card h-full p-5 sm:p-7" aria-labelledby={`xp-${e.id}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-muted">
                <StatusPill state="done">{e.id === "supreme-cuts" ? "before software" : "handed off"}</StatusPill>
                <span>{e.dates.label}</span>
              </div>
              <h3 id={`xp-${e.id}`} className="mt-4 font-display text-3xl leading-none font-bold tracking-tight">
                {e.company}
              </h3>
              <p className="mt-2 font-mono text-sm">
                <span className="v3-tone-ok">{e.role}</span>
                {e.formerly ? <span className="text-muted">, formerly {e.formerly}</span> : null}
                <span className="text-muted">, {e.location}</span>
              </p>
              {e.metrics[0] ? (
                <p className="mt-5 flex items-baseline gap-3">
                  <span className="v3-metric-value v3-tone-ok">
                    <Counter value={e.metrics[0].value} />
                  </span>
                  <span className="font-mono text-xs text-muted">{e.metrics[0].label}</span>
                </p>
              ) : null}
              <Log className="mt-5" entries={logEntries(e)} />
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
      </div>
    </Node>
  );
}

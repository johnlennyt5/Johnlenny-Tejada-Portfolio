import { Fragment, type CSSProperties, type ReactNode } from "react";
import { experience, projects, type EvidenceId, type Metric, type Project, type ProjectSlug } from "@/content";

/* Small server-safe building blocks for v2. No facts live here: everything renders from @/content. */

export const BTN_PRIMARY = "v2-btn v2-btn-primary";
export const BTN_GHOST = "v2-btn v2-btn-ghost";

/** "01" to "12": scene and section numbers. */
export function no(n: number): string {
  return String(n).padStart(2, "0");
}

/** Find a metric shown elsewhere on the site by its evidence id. Fails the build if it is missing. */
export function metricFor(id: EvidenceId): Metric {
  for (const p of projects) {
    const hit = p.metrics.find((x) => x.evidence === id);
    if (hit) return hit;
  }
  for (const e of experience) {
    const hit = e.metrics.find((x) => x.evidence === id);
    if (hit) return hit;
  }
  throw new Error(`v2: no metric with evidence id ${id}`);
}

export function Eyebrow({ children, className = "", as = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" }) {
  const Tag = as;
  return <Tag className={`v2-eyebrow ${className}`}>{children}</Tag>;
}

export function ProofChip({ metric, quiet = false }: { metric: Metric; quiet?: boolean }) {
  return (
    <span className={`v2-chip${quiet ? " v2-chip-quiet" : ""}`}>
      <b>{metric.value}</b>
      <span>{metric.label}</span>
    </span>
  );
}

/** A device-like frame with a title bar, used to hold diagrams, readouts and posters. */
export function Frame({ title, children, className = "", bodyClassName = "" }: { title: string; children: ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <div className={`v2-frame ${className}`}>
      <div className="v2-frame-bar" aria-hidden="true">
        <span className="v2-frame-dot" />
        <span className="v2-frame-dot" />
        <span className="v2-frame-dot" />
        <span className="v2-frame-title">{title}</span>
      </div>
      <div className={`v2-frame-body ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export function teamLabel(project: Project): string {
  if (project.team === "solo") return "Solo build";
  if (project.team === "co-founder") return "Co-founded";
  return "Team build";
}

export function ExternalArrow() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="v2-check" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeOpacity="0.45" />
      <path d="m6.3 10.2 2.4 2.4 5-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Per-project tone for posters (RGB triplets, decorative only). */
const TONES: Record<ProjectSlug, string> = {
  prismshift: "142 166 255",
  ilop: "61 224 200",
  truckwhat: "142 166 255",
  "smartfit-metrics": "61 224 200",
  eve: "180 150 255",
  yconic: "142 166 255",
  "parameter-golf": "61 224 200",
};

/** A rounded square as path data, so a grid of them fits in one path. */
function roundedSquare(x: number, y: number, size: number, r: number): string {
  const e = size - 2 * r;
  return `M${x + r} ${y}h${e}a${r} ${r} 0 0 1 ${r} ${r}v${e}a${r} ${r} 0 0 1 -${r} ${r}h-${e}a${r} ${r} 0 0 1 -${r} -${r}v-${e}a${r} ${r} 0 0 1 ${r} -${r}z`;
}

function PosterArt({ slug }: { slug: ProjectSlug }) {
  const stroke = "rgb(237 238 243 / 0.22)";
  const bright = "rgb(var(--tone) / 0.9)";
  switch (slug) {
    case "smartfit-metrics":
      // Concentric progress rings.
      return (
        <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          {[78, 60, 42].map((r, i) => (
            <g key={r} transform="translate(300 92)">
              <circle r={r} fill="none" stroke={stroke} strokeWidth="9" />
              <circle
                r={r}
                fill="none"
                stroke={bright}
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * r * (0.82 - i * 0.18)} ${2 * Math.PI * r}`}
                transform="rotate(-90)"
                opacity={1 - i * 0.22}
              />
            </g>
          ))}
        </svg>
      );
    case "eve": {
      // A voice waveform: one path per tone keeps the poster to a handful of nodes.
      const bars = Array.from({ length: 34 }, (_, i) => {
        const h = Math.round(10 + Math.abs(Math.sin(i * 0.55) * 52) + Math.abs(Math.cos(i * 1.3) * 22));
        return { i, d: `M${133 + i * 8} ${92 - h / 2 + 2}V${92 + h / 2 - 2}` };
      });
      return (
        <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <g fill="none" strokeWidth="4" strokeLinecap="round">
            <path stroke={stroke} d={bars.filter((b) => b.i % 5 !== 0).map((b) => b.d).join("")} />
            <path stroke={bright} d={bars.filter((b) => b.i % 5 === 0).map((b) => b.d).join("")} />
          </g>
        </svg>
      );
    }
    case "yconic": {
      // A scoring dial with ticks.
      const ticks = Array.from({ length: 25 }, (_, i) => {
        const a = Math.PI + (i / 24) * Math.PI;
        const r2 = i % 4 === 0 ? 58 : 64;
        const p = (r: number) => `${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
        return { i, d: `M${p(74)}L${p(r2)}` };
      });
      return (
        <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <g transform="translate(300 120)" fill="none" strokeWidth="2.4" strokeLinecap="round">
            <path stroke={bright} d={ticks.filter((t) => t.i < 17).map((t) => t.d).join("")} />
            <path stroke={stroke} d={ticks.filter((t) => t.i >= 17).map((t) => t.d).join("")} />
            <line x1="0" y1="0" x2={Math.cos(Math.PI * 1.68) * 50} y2={Math.sin(Math.PI * 1.68) * 50} stroke="rgb(237 238 243 / 0.85)" strokeWidth="3" />
            <circle r="6" fill="rgb(237 238 243 / 0.85)" stroke="none" />
          </g>
        </svg>
      );
    }
    case "parameter-golf": {
      // Weights squeezed into ever smaller blocks.
      const cells = Array.from({ length: 36 }, (_, k) => {
        const col = Math.floor(k / 6);
        const row = k % 6;
        const sz = 22 - col * 3;
        return { on: (col + row) % 4 === 0, d: roundedSquare(190 + col * 30, 22 + row * 26 + (22 - sz) / 2, sz, 3) };
      });
      return (
        <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <path fill={bright} d={cells.filter((c) => c.on).map((c) => c.d).join("")} />
          <path fill="none" stroke={stroke} d={cells.map((c) => c.d).join("")} />
        </svg>
      );
    }
    default:
      // Orbits.
      return (
        <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <g transform="translate(290 96)" fill="none">
            <ellipse rx="110" ry="40" stroke={stroke} />
            <ellipse rx="80" ry="28" stroke={stroke} transform="rotate(-18)" />
            <ellipse rx="54" ry="54" stroke={bright} />
            <circle cx="54" r="5" fill={bright} />
          </g>
        </svg>
      );
  }
}

/**
 * An honest title card for projects without a public screenshot: the name set large over
 * an abstract motif. Decorative, so it is hidden from assistive tech.
 */
export function Poster({
  project,
  large = false,
  showName = true,
  className = "",
}: {
  project: Project;
  large?: boolean;
  /** Hide the set name when a visible heading with the name sits right next to the poster. */
  showName?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`v2-poster${large ? " v2-poster-lg" : ""} ${className}`}
      style={{ ["--tone" as string]: TONES[project.slug] }}
      aria-hidden="true"
    >
      <PosterArt slug={project.slug} />
      {showName ? <span className="v2-poster-name">{project.name}</span> : null}
    </div>
  );
}

/**
 * The light sweep between scenes. A CSS scroll timeline drives the beam (theme.css), so this
 * ships no JavaScript. Hidden under reduced motion; static where scroll timelines are unsupported.
 */
export function Sweep() {
  return (
    <div className="v2-sweep" aria-hidden="true">
      <div className="v2-sweep-beam" />
    </div>
  );
}

/* Reveal window, as a share of the paragraph's "cover" view timeline. */
const WORDS_START = 10;
const WORDS_SPAN = 50;

/**
 * A paragraph whose words brighten in reading order as it crosses the viewport.
 * One span per word and a CSS view timeline (theme.css): no JavaScript and no duplicated text.
 * The dimmed state still passes AA contrast, and without scroll timelines the text is simply lit.
 */
export function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  const n = words.length;
  const pct = (v: number) => `${(WORDS_START + WORDS_SPAN * Math.min(1, v)).toFixed(1)}%`;
  return (
    <p className={`v2-words ${className}`}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="v2-word" style={{ "--w0": pct(i / n), "--w1": pct((i + 1.6) / n) } as CSSProperties}>
            {w}
          </span>
          {i < n - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}

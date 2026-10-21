/**
 * v4 artifacts: honest, designed paper objects that stand in where there is no photo.
 * They are illustrations, never screenshots, and they show no data that is not in src/content.
 * Server components only; motion comes from the wrappers that hold them.
 */
import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { awards, education, getExperience, getProject, nowBuilding, profile } from "@/content";
import type { Metric, Project } from "@/content";

/* ---------- Small parts ---------- */

/** A handwritten-looking stroke standing in for an entry, so no figures are invented. */
function Ink({ width, className = "" }: { width: string; className?: string }) {
  return <span className={`v4-ink-line ${className}`} style={{ width }} />;
}

/**
 * Many ink strokes as one SVG path, so a ruled sheet of entries costs two DOM nodes, not dozens.
 * `rows` are lines of [x, width] pairs in percent of the box; every row is `pitch` px tall.
 * The stroke does not scale, so the round ends stay round however wide the sheet is.
 */
function InkRows({
  rows,
  pitch,
  offset = 0,
  className = "",
}: {
  rows: [number, number][][];
  pitch: number;
  /** Blank space above the first row, in px. */
  offset?: number;
  className?: string;
}) {
  const h = offset + rows.length * pitch;
  const d = rows
    .flatMap((row, i) => row.map(([x, w]) => `M${x + 1.5} ${offset + i * pitch + pitch / 2}h${Math.max(0, w - 3)}`))
    .join("");
  return (
    <svg
      viewBox={`0 0 100 ${h}`}
      preserveAspectRatio="none"
      className={`v4-ink-rows ${className}`}
      style={{ height: `${h}px` }}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

function metricBy(metrics: Metric[], evidence: string): Metric | undefined {
  return metrics.find((mt) => mt.evidence === evidence);
}

/* ---------- Hero ---------- */

/** The caption is set in the Fraunces italic the hero already needs, so no handwriting font loads above the fold. */
export function Polaroid({ caption, priority = false }: { caption: string; priority?: boolean }) {
  const h = profile.headshot;
  return (
    <figure className="v4-polaroid v4-pin relative m-0 w-[11.5rem] sm:w-[14rem]">
      <Image src={h.src} alt={h.alt} width={h.width} height={h.height} priority={priority} sizes="(min-width: 640px) 14rem, 11.5rem" />
      <figcaption className="v4-polaroid-caption mt-2 text-center">{caption}</figcaption>
    </figure>
  );
}

/** A torn receipt slip from the shop: the business side, in one strip. */
export function LedgerSlip() {
  return (
    <div
      role="img"
      aria-label="Illustration: a slip of ledger paper with ruled columns and ink strokes"
      className="v4-paper v4-ruled w-[12.5rem] px-4 pt-3 pb-5 sm:w-[14.5rem]"
    >
      <p className="v4-italic text-xl leading-tight">The books</p>
      <div className="mt-4 pl-8">
        <InkRows pitch={26} rows={[[[0, 80]], [[0, 62]], [[0, 74]], [[0, 48]]]} />
      </div>
    </div>
  );
}

/* ---------- Chapter I: attendance log ---------- */

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const ATTENDANCE = [
  [1, 1, 0, 1, 1],
  [1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1],
  [1, 0, 1, 1, 1],
];
/** Column and row pitch of the log, and the height of the day row, in px. */
const COL = 30;
const ROW = 30;
const HEAD = 24;

/** Every check mark in one path and every empty day in another. */
const ATTENDANCE_MARKS = (() => {
  let checks = "";
  let empty = "";
  ATTENDANCE.forEach((row, i) => {
    row.forEach((c, j) => {
      const cx = j * COL + COL / 2;
      const cy = HEAD + i * ROW + ROW / 2;
      if (c) checks += `M${cx - 6.5} ${cy + 0.5}L${cx - 2} ${cy + 5}L${cx + 6.5} ${cy - 5.5}`;
      else empty += `M${cx - 7} ${cy}a7 7 0 1 0 14 0a7 7 0 1 0 -14 0`;
    });
  });
  return { checks, empty };
})();

/** The names column: one ink stroke per child, level with that child's row of days. */
const ATTENDANCE_NAMES: [number, number][][] = [[[0, 78]], [[0, 64]], [[0, 84]], [[0, 56]]];

export function AttendanceCard() {
  const width = DAYS.length * COL;
  const height = HEAD + ATTENDANCE.length * ROW;
  return (
    <div role="img" aria-label="Illustration: an attendance log card with check marks" className="v4-paper v4-tape mx-auto w-full max-w-sm p-5">
      <div className="flex items-baseline justify-between border-b-2 border-fg pb-2">
        <span className="v4-italic text-2xl">Attendance</span>
        <span className="v4-smallcaps text-sm text-muted">Summer</span>
      </div>
      <div className="mt-3 flex items-start gap-2">
        <InkRows className="min-w-0 flex-1" pitch={ROW} offset={HEAD} rows={ATTENDANCE_NAMES} />
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="shrink-0" aria-hidden="true" focusable="false">
          {DAYS.map((d, j) => (
            <text key={d} x={j * COL + COL / 2} y="13" textAnchor="middle" className="v4-svg-label">
              {d}
            </text>
          ))}
          <path d={ATTENDANCE_MARKS.empty} fill="none" stroke="var(--c-rule)" strokeWidth="1.2" />
          <path
            d={ATTENDANCE_MARKS.checks}
            fill="none"
            stroke="var(--c-accent-2)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <span className="v4-stamp">Activities</span>
        <span className="v4-stamp" style={{ color: "var(--c-accent-2)", borderColor: "var(--c-accent-2)", transform: "rotate(4deg)" }}>
          Healthy habits
        </span>
      </div>
    </div>
  );
}

/* ---------- Chapter II: semester budget ---------- */

/** Where the three ruled columns (1.6fr, 1fr, 1fr with small gaps) start, and how wide they are, in percent. */
const COLS_X = [0, 45, 74.6];
const COLS_W = [40.6, 25.4, 25.4];

export function BudgetLedger() {
  const cols = ["Event", "Budget", "Spent"];
  const rows = [
    [70, 55, 48],
    [82, 60, 62],
    [58, 45, 40],
    [76, 52, 50],
  ];
  const strokes = rows.map((r) => r.map((w, j): [number, number] => [COLS_X[j] ?? 0, ((COLS_W[j] ?? 0) * w) / 100]));
  return (
    <div role="img" aria-label="Illustration: a ruled budget sheet with columns for event, budget and spent" className="v4-paper relative mx-auto w-full max-w-sm overflow-hidden">
      <div className="v4-ruled px-5 pt-4 pb-6">
        <p className="v4-italic pl-8 text-2xl">Semester budget</p>
        <div className="mt-4 grid grid-cols-[1.6fr_1fr_1fr] gap-x-3 pl-8">
          {cols.map((c) => (
            <span key={c} className="v4-smallcaps text-xs text-muted">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-1 pl-8">
          <InkRows pitch={26} rows={strokes} />
          <div className="mt-1 grid grid-cols-[1.6fr_1fr_1fr] gap-x-3 border-t-[3px] border-double border-fg pt-2">
            <span className="v4-smallcaps text-xs">Total</span>
            <Ink width="66%" />
            <Ink width="60%" />
          </div>
        </div>
      </div>
      <span className="v4-stamp absolute right-4 bottom-4">Treasurer</span>
    </div>
  );
}

/* ---------- Chapter III: the shop books ---------- */

export function ShopBooks() {
  const heads = ["Transactions", "Inventory", "Appointments"];
  const widths = [
    ["80%", "60%", "72%"],
    ["55%", "78%", "50%"],
    ["70%", "45%", "84%"],
  ];
  return (
    <div
      role="img"
      aria-label="Illustration: a printed spreadsheet with columns for transactions, inventory and appointments"
      className="v4-paper mx-auto w-full max-w-md overflow-hidden"
    >
      <div className="v4-sheet-grid">
        <div className="v4-sheet-head" />
        {["A", "B", "C"].map((l) => (
          <div key={l} className="v4-sheet-head">
            {l}
          </div>
        ))}
        <div className="v4-sheet-head">1</div>
        {heads.map((h) => (
          <div key={h} className="font-semibold">
            <span className="text-[0.7rem] leading-tight [overflow-wrap:anywhere] sm:text-[0.8rem]">{h}</span>
          </div>
        ))}
        {widths.map((row, i) => (
          <Fragment key={`r-${row.join("")}`}>
            <div className="v4-sheet-head">{["2", "3", "4"][i]}</div>
            {row.map((w, j) => (
              <div key={`${w}-${heads[j]}`} className="v4-inked" style={{ "--w": w } as CSSProperties} />
            ))}
          </Fragment>
        ))}
      </div>
      <div className="flex items-end gap-1 bg-[var(--c-surface)] px-3 pt-2">
        <span className="rounded-t-md border border-b-0 border-[var(--c-rule)] bg-[var(--c-paper)] px-3 py-1 text-xs font-semibold">Books</span>
        <span className="px-3 py-1 text-xs text-muted">Clients</span>
      </div>
    </div>
  );
}

/* ---------- Chapter IV: certificate ---------- */

function skillCertificates(detail: string | undefined): string[] {
  const match = detail?.match(/Certificates in (.+?)\./);
  if (!match?.[1]) return [];
  return match[1].split(/,\s*|\s+and\s+/).filter(Boolean);
}

export function Certificate() {
  const cert = education.find((e) => e.id === "devaccelerator");
  if (!cert) return null;
  const skills = skillCertificates(cert.detail);
  return (
    <div className="v4-paper v4-certificate mx-auto w-full max-w-md px-6 py-9 text-center sm:px-10">
      <p className="v4-smallcaps text-sm text-muted">{cert.school}</p>
      <p className="v4-italic mt-3 text-3xl leading-tight sm:text-4xl">{cert.credential}</p>
      <p className="mt-2 text-muted">{cert.dates}</p>
      {skills.length > 0 ? (
        <>
          <p className="v4-smallcaps mt-6 text-xs text-muted">Proven Skill Certificates</p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {skills.map((s) => (
              <li key={s} className="v4-chip">
                {s}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <svg viewBox="0 0 60 60" className="mx-auto mt-6 h-14 w-14" aria-hidden="true" focusable="false">
        <circle cx="30" cy="30" r="26" fill="none" stroke="var(--c-brass)" strokeWidth="3" strokeDasharray="3 3" />
        <circle cx="30" cy="30" r="19" fill="var(--c-brass)" opacity="0.85" />
        <path d="M22 31 L28 37 L39 24" fill="none" stroke="var(--c-paper)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ---------- Chapter V: work order ---------- */

export function WorkOrder() {
  const hx = getExperience("humanixos");
  return (
    <div className="v4-kraft mx-auto w-full max-w-sm p-5">
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-fg pb-2">
        <span className="v4-smallcaps text-sm">Work order</span>
        <span className="v4-italic text-2xl">{hx.company}</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {hx.role}, {hx.dates.label}
      </p>
      <dl className="mt-3">
        {hx.metrics.map((mt) => (
          <div key={mt.evidence} className="flex items-baseline justify-between gap-4 border-b border-dashed border-[var(--c-strong-line)] py-2">
            <dt className="text-sm">{mt.label}</dt>
            <dd className="v4-display m-0 text-2xl font-semibold">{mt.value}</dd>
          </div>
        ))}
      </dl>
      <p className="v4-perforated mt-4 pt-3 text-sm text-muted">{hx.stack.slice(0, 4).join(", ")}</p>
    </div>
  );
}

/* ---------- Chapter VI: badge, ribbon and program ---------- */

export function EventBadge() {
  return (
    <div className="v4-paper w-[13.5rem] overflow-hidden rounded-xl text-center">
      <div className="pt-3">
        <div className="v4-punch" />
      </div>
      <div className="mt-3 bg-fg px-3 py-3 text-bg">
        <p className="v4-smallcaps text-base">TEDxProvidence 2025</p>
      </div>
      <p className="v4-italic mt-4 px-4 text-2xl leading-tight">Assistant Coordinator</p>
      <p className="mt-1 px-4 pb-5 text-sm text-muted">Core team, Feb 2025</p>
    </div>
  );
}

function scallops(cx: number, cy: number, r: number, n: number, depth: number): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i += 1) {
    const a = (Math.PI * i) / n;
    const rr = i % 2 === 0 ? r : r - depth;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

export function Rosette() {
  const award = awards[0];
  if (!award) return null;
  return (
    <div className="w-[15rem]">
      <svg viewBox="0 0 120 150" className="mx-auto h-36 w-28" aria-hidden="true" focusable="false">
        <path d="M44 80 L30 146 L46 134 L56 148 L62 84 Z" fill="var(--c-accent)" />
        <path d="M76 80 L90 146 L74 134 L64 148 L58 84 Z" fill="var(--c-accent-2)" />
        <polygon points={scallops(60, 56, 50, 18, 6)} fill="var(--c-brass)" />
        <circle cx="60" cy="56" r="36" fill="var(--c-paper)" />
        <circle cx="60" cy="56" r="31" fill="none" stroke="var(--c-brass)" strokeWidth="1.5" />
        <text x="60" y="54" textAnchor="middle" style={{ font: "italic 400 16px var(--ff-display-italic)", fill: "var(--c-fg)" }}>
          Winner
        </text>
        <text x="60" y="70" textAnchor="middle" style={{ font: "600 9px var(--ff-body)", letterSpacing: "0.12em", fill: "var(--c-muted)" }}>
          (TEAM)
        </text>
      </svg>
      <p className="v4-paper -mt-2 p-3 text-center text-sm leading-snug">{award.wording}</p>
    </div>
  );
}

export function ProgramCard() {
  return (
    <div className="v4-paper w-[14rem] border-[3px] border-double border-[var(--c-strong-line)] px-5 py-6 text-center">
      <p className="v4-smallcaps text-xs text-muted">Bryant University</p>
      <p className="v4-display mt-1 text-3xl font-semibold leading-none">IDEA 2026</p>
      <div className="mx-auto my-4 h-px w-16 bg-[var(--c-strong-line)]" />
      <p className="v4-smallcaps text-xs text-muted">Opening keynote</p>
      <p className="v4-italic mt-1 text-3xl">Eve</p>
      <p className="text-sm text-muted">An AI digital human</p>
      <p className="mt-3 text-sm">January 2026</p>
    </div>
  );
}

/* ---------- Chapter VII: the app ticket ---------- */

export function StoreTicket() {
  const sf = getExperience("smartfit-metrics");
  const stores = sf.links.filter((l) => l.kind === "store");
  return (
    <div className="v4-paper relative mx-auto flex w-full max-w-md overflow-hidden rounded-lg">
      <div className="flex w-24 shrink-0 flex-col items-center justify-center border-r-2 border-dashed border-[var(--c-strong-line)] bg-[var(--c-surface)] px-2 py-5 text-center">
        <span className="v4-smallcaps text-xs text-muted">App Store</span>
        <span className="v4-italic mt-1 text-lg leading-tight">Jan 2026</span>
      </div>
      <div className="min-w-0 flex-1 p-5">
        <p className="v4-smallcaps text-xs text-muted">{sf.company}</p>
        <p className="v4-italic mt-1 text-2xl leading-tight sm:text-3xl">Ironclad Fitness RI</p>
        <p className="mt-1 text-sm text-muted">{sf.stack.slice(0, 2).join(", ")}, Stripe</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {stores.map((l) => (
            <li key={l.href}>
              <a className="v4-btn-ghost !min-h-11 !px-3 !text-sm" href={l.href} rel="noopener">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Chapter VIII: shipping label ---------- */

function Barcode({ seed }: { seed: string }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (let i = 0; i < seed.length * 3; i += 1) {
    const code = seed.charCodeAt(i % seed.length) + i * 7;
    const w = 1 + (code % 3);
    bars.push({ x, w });
    x += w + 1 + ((code >> 2) % 2);
  }
  const d = bars.map((b) => `M${b.x} 0h${b.w}v40h-${b.w}z`).join("");
  return (
    <svg viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" className="h-12 w-full" aria-hidden="true" focusable="false">
      <path d={d} fill="currentColor" />
    </svg>
  );
}

export function ShippingLabel({ project }: { project?: Project }) {
  const p = project ?? getProject("truckwhat");
  if (!p) return null;
  const shown = p.metrics.slice(0, 4);
  return (
    <div className="v4-paper relative mx-auto w-full max-w-sm border-2 border-fg">
      <div className="flex items-center justify-between border-b-2 border-fg px-4 py-3">
        <span className="v4-display text-3xl font-bold tracking-tight">{p.name}</span>
        <span className="v4-smallcaps text-sm">Web and mobile</span>
      </div>
      <div className="grid grid-cols-2 border-b-2 border-fg text-sm">
        <div className="border-r-2 border-fg p-3">
          <p className="v4-smallcaps text-xs text-muted">From</p>
          <p className="mt-0.5 leading-snug">Shippers post loads</p>
        </div>
        <div className="p-3">
          <p className="v4-smallcaps text-xs text-muted">To</p>
          <p className="mt-0.5 leading-snug">Drivers haul them</p>
        </div>
      </div>
      <dl className="grid grid-cols-2">
        {shown.map((mt, i) => (
          <div
            key={mt.evidence}
            className={`flex flex-col-reverse p-3 ${i % 2 === 0 ? "border-r-2 border-fg" : ""} ${i < 2 ? "border-b-2 border-fg" : ""}`}
          >
            <dt className="mt-1 text-xs leading-snug text-muted">{mt.label}</dt>
            <dd className="v4-display m-0 text-2xl font-semibold leading-none">{mt.value}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t-2 border-fg px-4 py-3">
        <Barcode seed={p.name} />
      </div>
      <span className="v4-stamp absolute -right-2 bottom-5 bg-[var(--c-paper)]">CI gate on every push</span>
    </div>
  );
}

/* ---------- Chapter IX and case studies: blueprints ---------- */

type BlueprintVariant = "ilop" | "prismshift";

const BLUEPRINTS: Record<BlueprintVariant, { label: string; nodes: { t: string; s?: string; kind?: "agent" | "human" | "gate" }[] }> = {
  ilop: {
    label: "Diagram: an email arrives through a Gmail trigger, the work is queued, AI agents classify and extract it, a compliance agent checks it, and requests that need judgment go to a person in Action Center",
    nodes: [
      { t: "Email arrives", s: "Gmail trigger" },
      { t: "Queued", s: "Orchestrator queues" },
      { t: "Classify, extract", s: "AI agents", kind: "agent" },
      { t: "Compliance", s: "Agent check, then risk score", kind: "gate" },
      { t: "A person decides", s: "Action Center", kind: "human" },
    ],
  },
  prismshift: {
    label: "Diagram: a Blue Prism release is parsed in the browser, checked by analysis rules, and converted into UiPath REFramework projects, Maestro BPMN and a migration report",
    nodes: [
      { t: "Blue Prism release", s: ".bprelease or .xml export" },
      { t: "Parsed in the browser", s: "Web Worker" },
      { t: "Analysis rules", s: "Security to compliance" },
      { t: "REFramework projects", s: "Plus Maestro BPMN", kind: "agent" },
      { t: "Migration report", s: "Effort for a human", kind: "human" },
    ],
  },
};

export function Blueprint({ variant, title }: { variant: BlueprintVariant; title?: string }) {
  const bp = BLUEPRINTS[variant];
  const rowH = 46;
  const height = bp.nodes.length * rowH + 30;
  const connectors = bp.nodes
    .slice(1)
    .map((_, k) => {
      const y = 12 + (k + 1) * rowH;
      return `M140 ${y - rowH + 32}V${y - 2}M136 ${y - 7}L140 ${y - 1}L144 ${y - 7}`;
    })
    .join("");
  return (
    <div className="v4-blueprint mx-auto w-full max-w-sm rounded-sm p-4 shadow-lg">
      <div className="flex items-baseline justify-between border-b border-white/30 pb-2">
        <span className="v4-italic text-xl">{title ?? (variant === "ilop" ? "ILOP" : "PrismShift")}</span>
        <span className="v4-smallcaps text-xs opacity-80">Sheet A</span>
      </div>
      <svg viewBox={`0 0 280 ${height}`} className="mt-2 w-full" role="img" aria-label={bp.label}>
        {/* Every connector and arrowhead in one path. */}
        <path d={connectors} fill="none" stroke="#EAF4F8" strokeWidth="1.4" />
        {bp.nodes.map((n, i) => {
          const y = 12 + i * rowH;
          const isGate = n.kind === "gate";
          return (
            <Fragment key={n.t}>
              {isGate ? (
                <path d={`M140 ${y - 3} L236 ${y + 15} L140 ${y + 33} L44 ${y + 15} Z`} fill="none" stroke="#FFD28A" strokeWidth="1.6" />
              ) : (
                <rect
                  x="40"
                  y={y}
                  width="200"
                  height="30"
                  rx={n.kind === "human" ? 15 : 3}
                  fill="none"
                  stroke={n.kind === "agent" ? "#FFD28A" : n.kind === "human" ? "#9FE3C9" : "#EAF4F8"}
                  strokeWidth={n.kind ? 1.8 : 1.2}
                  strokeDasharray={n.kind === "human" ? "4 3" : undefined}
                />
              )}
              <text x="140" y={y + 13} textAnchor="middle" className="v4-bp-title">
                {n.t}
              </text>
              {n.s ? (
                <text x="140" y={y + 25} textAnchor="middle" className="v4-bp-sub">
                  {n.s}
                </text>
              ) : null}
            </Fragment>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Case study artifacts for the rest ---------- */

export function Scorecard() {
  const rows = ["Uniqueness score", "Sentiment analysis score", "Written feedback"];
  return (
    <div className="v4-paper v4-tape mx-auto w-full max-w-sm p-5">
      <p className="v4-smallcaps text-xs text-muted">yconic</p>
      <p className="v4-italic text-2xl">Startup evaluation</p>
      <ul className="mt-4 space-y-3">
        {rows.map((r, i) => (
          <li key={r} className="flex items-center justify-between gap-3 border-b border-[var(--c-rule)] pb-2">
            <span>{r}</span>
            {i < 2 ? (
              <span aria-hidden="true" className="block h-7 w-12 rounded-sm border-2 border-[var(--c-strong-line)]" />
            ) : (
              <span aria-hidden="true" className="block w-16 space-y-1.5">
                <Ink width="100%" />
                <Ink width="70%" />
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted">Rubric scoring service and Google Calendar tool: my part.</p>
    </div>
  );
}

export function LuggageTag() {
  const p = getProject("parameter-golf");
  if (!p) return null;
  const limit = metricBy(p.metrics, "pg-limit");
  const packed = metricBy(p.metrics, "pg-artifact");
  const params = metricBy(p.metrics, "pg-params");
  return (
    <div className="relative mx-auto w-full max-w-[19rem] pt-8">
      <svg viewBox="0 0 100 40" className="absolute top-0 left-1/2 h-10 w-24 -translate-x-1/2" aria-hidden="true" focusable="false">
        <path d="M50 38 C 40 20, 20 10, 6 4" fill="none" stroke="var(--c-strong-line)" strokeWidth="1.5" />
        <path d="M50 38 C 60 20, 80 10, 94 4" fill="none" stroke="var(--c-strong-line)" strokeWidth="1.5" />
      </svg>
      <div className="v4-kraft relative rounded-[1.25rem_1.25rem_0.5rem_0.5rem] px-6 pt-8 pb-6 text-center">
        <span className="absolute top-3 left-1/2 block h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[var(--c-strong-line)] bg-[var(--c-bg)]" />
        <p className="v4-smallcaps text-xs text-muted">OpenAI Parameter Golf</p>
        {limit ? (
          <p className="mt-3">
            <span className="v4-display block text-4xl font-semibold leading-none">{limit.value}</span>
            <span className="text-sm text-muted">{limit.label}</span>
          </p>
        ) : null}
        <div className="mx-auto my-4 h-px w-full bg-[var(--c-strong-line)]" />
        <dl className="grid grid-cols-2 gap-3 text-left">
          {[packed, params].filter((x): x is Metric => Boolean(x)).map((mt) => (
            <div key={mt.evidence} className="flex flex-col-reverse">
              <dt className="mt-1 text-xs text-muted">{mt.label}</dt>
              <dd className="v4-display m-0 text-2xl font-semibold leading-none">{mt.value}</dd>
            </div>
          ))}
        </dl>
        <p className="v4-italic mt-4 text-lg">Mamba-2 hybrid</p>
      </div>
    </div>
  );
}

/* ---------- Chapter X: notepad ---------- */

export function Notepad() {
  return (
    <div role="img" aria-label="Illustration: a notepad listing what I am building now" className="v4-paper mx-auto w-full max-w-sm">
      <div className="v4-spiral border-b border-[var(--c-rule)]" />
      <div className="v4-ruled px-5 pt-3 pb-6">
        <p className="v4-italic pl-8 text-2xl">On the bench</p>
        <ul className="mt-3 space-y-[0.55rem] pl-8">
          {nowBuilding.map((n) => (
            <li key={n.id} className="flex items-center gap-3 leading-[1.2rem]">
              <span className="block h-4 w-4 shrink-0 rounded-[3px] border-2 border-[var(--c-accent)]" />
              <span className="v4-italic text-lg">{n.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- One artifact per project ---------- */

export function ProjectArtifact({ project }: { project: Project }): ReactNode {
  switch (project.slug) {
    case "prismshift":
      return <Blueprint variant="prismshift" />;
    case "ilop":
      return <Blueprint variant="ilop" />;
    case "truckwhat":
      return <ShippingLabel project={project} />;
    case "smartfit-metrics":
      return <StoreTicket />;
    case "eve":
      return <ProgramCard />;
    case "yconic":
      return <Scorecard />;
    case "parameter-golf":
      return <LuggageTag />;
    default:
      return null;
  }
}

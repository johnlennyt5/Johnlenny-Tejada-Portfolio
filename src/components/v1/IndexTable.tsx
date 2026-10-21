import Link from "next/link";
import type { PlateTone } from "./data";
import { IndexHover } from "./IndexHover";

export interface IndexRow {
  slug: string;
  href: string;
  no: string;
  year: string;
  name: string;
  tagline: string;
  role: string;
  dates: string;
  stack: string[];
  proof?: { value: string; label: string };
  tone: PlateTone;
}

/**
 * The index of work: one row per project, set like the contents table of a report.
 * A server component. IndexHover adds the cursor-following printed plate on devices
 * with a fine pointer; the plate code itself loads only on those devices.
 */
export function IndexTable({ rows }: { rows: IndexRow[] }) {
  return (
    <IndexHover rows={rows}>
      <div
        aria-hidden="true"
        className="v1-label hidden grid-cols-12 gap-x-[var(--v1-gap)] border-b border-fg pb-2 md:grid"
      >
        <span className="col-span-1">No.</span>
        <span className="col-span-1">Year</span>
        <span className="col-span-5">Project</span>
        <span className="col-span-3">Role and stack</span>
        <span className="col-span-2 text-right">Proof</span>
      </div>

      <ol className="border-t border-fg md:border-t-0">
        {rows.map((r) => (
          <li
            key={r.slug}
            data-slug={r.slug}
            className="v1-row grid grid-cols-12 gap-x-[var(--v1-gap)] gap-y-2 border-b border-line py-5 md:items-baseline md:py-7"
          >
            <span className="v1-label col-span-3 text-fg md:col-span-1">{r.no}</span>
            <span className="v1-label col-span-9 text-right md:col-span-1 md:text-left">{r.year}</span>
            <div className="col-span-12 md:col-span-5">
              <h3 className="font-display text-[clamp(1.9rem,4.4vw,3.6rem)] font-black leading-[0.92] tracking-[-0.045em]">
                <Link href={r.href} className="v1-row-link no-underline">
                  <span className="v1-row-name">{r.name}</span>
                  <span className="jt-sr-only">, case study</span>
                </Link>
              </h3>
              <p className="mt-2 text-base text-muted">{r.tagline}</p>
            </div>
            <div className="col-span-12 text-sm md:col-span-3">
              <p className="font-semibold">{r.role}</p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-muted">{r.stack.join(" / ")}</p>
            </div>
            <div className="col-span-12 md:col-span-2 md:text-right">
              {r.proof ? (
                <p className="flex items-baseline gap-2 md:block">
                  <span className="v1-num block text-[2.1rem] md:text-[2.6rem]">{r.proof.value}</span>
                  <span className="text-xs text-muted">{r.proof.label}</span>
                </p>
              ) : (
                <p className="v1-label">{r.dates}</p>
              )}
            </div>
            <span className="v1-row-bar" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </IndexHover>
  );
}

/**
 * v1 selections from shared content. No new facts live here: only which content
 * items v1 shows, in what order, and the section numbering of the report.
 */
import { getExperience, getProject, projects, type EvidenceId, type Metric, type Project } from "@/content";

export interface SectionInfo {
  id: string;
  num: string;
  label: string;
  title: string;
}

export const homeSections = {
  work: { id: "work", num: "01", label: "Work", title: "Index of work" },
  systems: { id: "systems", num: "02", label: "Systems", title: "How I work" },
  figures: { id: "figures", num: "03", label: "Proof", title: "The figures" },
  record: { id: "record", num: "04", label: "Record", title: "Employment record" },
  people: { id: "off-the-books", num: "05", label: "Community", title: "Off the books" },
  now: { id: "now", num: "06", label: "Now", title: "Now building" },
  contact: { id: "contact", num: "07", label: "Contact", title: "Correspondence" },
} satisfies Record<string, SectionInfo>;

/** Every project in report order. */
export const indexOrder: Project[] = [...projects].sort((a, b) => a.order - b.order);

export function indexNumber(slug: Project["slug"]): string {
  const i = indexOrder.findIndex((p) => p.slug === slug);
  return String(i + 1).padStart(2, "0");
}

export function nextProject(slug: Project["slug"]): Project {
  const i = indexOrder.findIndex((p) => p.slug === slug);
  return indexOrder[(i + 1) % indexOrder.length] as Project;
}

/** Plate color per row of the index. */
const tones = ["ink", "accent", "blue"] as const;
export type PlateTone = (typeof tones)[number];
export function plateTone(i: number): PlateTone {
  return tones[i % tones.length] as PlateTone;
}

export interface FigureItem {
  value: string;
  label: string;
  source: string;
}

function pickMetrics(metrics: Metric[], ids: EvidenceId[]): Metric[] {
  return ids
    .map((id) => metrics.find((x) => x.evidence === id))
    .filter((x): x is Metric => Boolean(x));
}

/** The twelve plates of the figures spread, all taken from content metrics. */
export function figureItems(): FigureItem[] {
  const truckwhat = getProject("truckwhat");
  const prismshift = getProject("prismshift");
  const hx = getExperience("humanixos");
  const out: FigureItem[] = [];
  if (truckwhat) {
    for (const x of pickMetrics(truckwhat.metrics, ["tw-commits", "tw-vitest", "tw-jest", "tw-rls", "tw-findings"])) {
      out.push({ value: x.value, label: x.label, source: truckwhat.name });
    }
  }
  if (prismshift) {
    for (const x of pickMetrics(prismshift.metrics, ["ps-commits", "ps-pgtap"])) {
      out.push({ value: x.value, label: x.label, source: prismshift.name });
    }
  }
  for (const x of pickMetrics(hx.metrics, ["hx-tenants", "hx-users", "hx-stp", "hx-records", "hx-mapping"])) {
    out.push({ value: x.value, label: x.label, source: hx.company });
  }
  return out;
}

export const teamLabel: Record<Project["team"], string> = {
  solo: "Solo",
  team: "Team",
  "co-founder": "Co-founder",
};

/**
 * Shared content types. Every version of the site renders from these shapes.
 * Facts live in the sibling files; numbers must reference an evidence id.
 */

import type { EvidenceId } from "./evidence";

export type IdentityId = "automation" | "fullstack";

export type ProjectSlug =
  | "prismshift"
  | "ilop"
  | "truckwhat"
  | "smartfit-metrics"
  | "eve"
  | "yconic"
  | "parameter-golf";

export type DiagramId = "truckwhat" | "prismshift" | "ilop";

export type LinkKind = "repo" | "pr" | "store" | "site" | "event" | "profile" | "award";

export interface Link {
  label: string;
  href: string;
  kind: LinkKind;
}

/** Month precision dates as "YYYY-MM". `end: null` means ongoing. */
export interface DateRange {
  start: string;
  end: string | null;
  /** Human label, e.g. "Jan 2023 to present". */
  label: string;
}

/** A number shown on the site. `value` must match the evidence row exactly. */
export interface Metric {
  value: string;
  label: string;
  evidence: EvidenceId;
}

export interface Titled {
  title: string;
  detail: string;
}

export interface CaseStudy {
  /** What was wrong in the world before this existed. */
  problem: string;
  constraints: string[];
  decisions: Titled[];
  tradeoffs: string[];
  /** Honest failures and what they taught. May be empty when nothing is on record. */
  whatBroke: Titled[];
  results: string[];
  tests: string[];
  caveats: string[];
}

export interface Project {
  slug: ProjectSlug;
  name: string;
  /** Short descriptor shown next to the name. */
  tagline: string;
  role: string;
  team: "solo" | "team" | "co-founder";
  dates: DateRange;
  identities: IdentityId[];
  /** Lower comes first. */
  order: number;
  featured: boolean;
  stack: string[];
  oneLiner: string;
  /** Two or three sentences for cards and previews. */
  summary: string;
  links: Link[];
  /** Note shown when there is no public link. */
  linkNote?: string;
  metrics: Metric[];
  diagram?: DiagramId;
  caseStudy: CaseStudy;
}

export interface Experience {
  id: "humanixos" | "smartfit-metrics" | "supreme-cuts";
  company: string;
  formerly?: string;
  role: string;
  location: string;
  dates: DateRange;
  url?: string;
  /** What the company does, in neutral words. */
  about: string;
  highlights: string[];
  metrics: Metric[];
  stack: string[];
  links: Link[];
  relatedProject?: ProjectSlug;
  /** Rules for how this entry may be shown. */
  displayNotes?: string;
}

export interface Identity {
  id: IdentityId;
  rank: "primary" | "secondary";
  title: string;
  pitch: string;
  proof: string[];
  projects: ProjectSlug[];
}

export interface SkillGroup {
  id: string;
  title: string;
  items: string[];
  note?: string;
}

export interface CommunityItem {
  id: string;
  title: string;
  org: string;
  dates?: string;
  detail: string;
  link?: Link;
  kind: "leadership" | "community" | "teaching" | "mentoring";
}

export interface Award {
  id: string;
  title: string;
  event: string;
  place: string;
  date: string;
  /** Exact public wording. Use this string verbatim. */
  wording: string;
  detail: string;
  link?: Link;
  relatedProject?: ProjectSlug;
}

export interface Education {
  id: string;
  school: string;
  credential: string;
  dates: string;
  location: string;
  detail?: string;
}

export type TimelineKind = "work" | "build" | "community" | "education" | "award";

export interface TimelineEntry {
  id: string;
  year: number;
  /** Optional finer label, e.g. "Jan 2026". */
  when: string;
  title: string;
  body: string;
  kind: TimelineKind;
  project?: ProjectSlug;
  experience?: Experience["id"];
}

export interface NowItem {
  id: string;
  title: string;
  detail: string;
  project?: ProjectSlug;
}

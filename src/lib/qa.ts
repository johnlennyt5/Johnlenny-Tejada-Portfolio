/**
 * Latest QA results for the /compare page. These are measurements of this website,
 * not claims about Johnlenny, so they live in src/lib and the compare page is skipped
 * by audit:facts (see scripts/audit-facts.mjs).
 *
 * Lighthouse scores are Performance / Accessibility / Best Practices / SEO.
 * Mobile runs use Lighthouse's default 4x CPU throttle. Figures are from reruns on an idle machine.
 */
import type { VersionId } from "./site";

export const qaRunDate = "2026-10-21";

/** The performance score CI asks for on every page. */
export const perfTarget = 90;

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface PageScores {
  label: string;
  path: string;
  mobile: LighthouseScores;
  desktop: LighthouseScores;
  /** Short note, for example when two runs differed. */
  note?: string;
}

export interface VersionQa {
  id: VersionId;
  /** One case study that was tested for this version. */
  caseSlug: string;
  pages: PageScores[];
  axeViolations: number;
  /** Where to look first if mobile performance is the goal. */
  perfNote: string;
}

const full = (performance: number): LighthouseScores => ({ performance, accessibility: 100, bestPractices: 100, seo: 100 });

export const qaByVersion: readonly VersionQa[] = [
  {
    id: "v1",
    caseSlug: "truckwhat",
    axeViolations: 0,
    pages: [
      {
        label: "Home",
        path: "/v1/",
        mobile: full(87),
        desktop: full(99),
        note: "Six mobile runs: 73 to 96. The build before the 2026-10-21 performance pass measured 79 to 95 in the same session.",
      },
      { label: "Case study: truckWhat", path: "/v1/work/truckwhat/", mobile: full(96), desktop: full(100) },
    ],
    perfNote:
      "Home on mobile swings around the target from run to run. The hero intro is the largest paint, and hydration of the cover is the main cost.",
  },
  {
    id: "v2",
    caseSlug: "prismshift",
    axeViolations: 0,
    pages: [
      { label: "Home", path: "/v2/", mobile: full(87), desktop: full(100), note: "Five mobile runs: 79 to 89, up from 82 to 86 before." },
      { label: "Case study: PrismShift", path: "/v2/work/prismshift/", mobile: full(93), desktop: full(100) },
    ],
    perfNote:
      "Sections below the fold now skip rendering until they near the screen. Still the page most sensitive to a busy CPU, because of its scroll scenes.",
  },
  {
    id: "v3",
    caseSlug: "ilop",
    axeViolations: 0,
    pages: [
      { label: "Home at /v3/", path: "/v3/", mobile: full(92), desktop: full(100), note: "Three mobile runs: 91, 92 and 94." },
      { label: "Home at / (default)", path: "/", mobile: full(92), desktop: full(100), note: "Three mobile runs: 90, 92 and 93." },
      { label: "Case study: ILOP", path: "/v3/work/ilop/", mobile: full(95), desktop: full(100), note: "Three mobile runs: 85, 95 and 96." },
    ],
    perfNote:
      "Over the target on mobile. Each node below the hero skips rendering until it nears the screen, and the pages no longer load framer-motion.",
  },
  {
    id: "v4",
    caseSlug: "smartfit-metrics",
    axeViolations: 0,
    pages: [
      { label: "Home", path: "/v4/", mobile: full(91), desktop: full(99), note: "Three mobile runs: 90, 91 and 95." },
      {
        label: "Case study: SmartFit Metrics",
        path: "/v4/work/smartfit-metrics/",
        mobile: full(95),
        desktop: full(100),
        note: "Three mobile runs: 94, 95 and 95.",
      },
    ],
    perfNote:
      "The largest page on the site. Chapters and sections skip rendering until they near the screen, phones get plain paper instead of the grain filter, and the case studies ship no framer-motion.",
  },
];

export const qaSummary: readonly string[] = [
  "axe-core: 0 violations on 11 URLs (the default home, each version home, one case study per version, and the v3 and v4 about pages), at 1280px and 360px, light and dark, with reduced motion on and off.",
  "No horizontal scrolling at 360px on any of the 11 URLs.",
  "No page errors and no console errors.",
  "Lighthouse Accessibility, Best Practices and SEO: 100 on every page tested, mobile and desktop.",
  "Mobile Performance is the one score still below target on some pages. Every page scores 97 or more on desktop.",
];

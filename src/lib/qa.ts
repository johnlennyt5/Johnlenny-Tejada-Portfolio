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
      { label: "Home", path: "/v1/", mobile: full(91), desktop: full(99) },
      { label: "Case study: truckWhat", path: "/v1/work/truckwhat/", mobile: full(96), desktop: full(100) },
    ],
    perfNote: "Home on mobile sits just over the target. The hero intro is the largest paint.",
  },
  {
    id: "v2",
    caseSlug: "prismshift",
    axeViolations: 0,
    pages: [
      { label: "Home", path: "/v2/", mobile: full(92), desktop: full(97) },
      { label: "Case study: PrismShift", path: "/v2/work/prismshift/", mobile: full(93), desktop: full(100) },
    ],
    perfNote: "Passes on an idle machine. The most sensitive page to a busy CPU, because of its scroll scenes.",
  },
  {
    id: "v3",
    caseSlug: "ilop",
    axeViolations: 0,
    pages: [
      { label: "Home at /v3/", path: "/v3/", mobile: full(92), desktop: full(100) },
      { label: "Home at / (default)", path: "/", mobile: full(87), desktop: full(100), note: "Two mobile runs: 86 and 87." },
      { label: "Case study: ILOP", path: "/v3/work/ilop/", mobile: full(89), desktop: full(100), note: "Two mobile runs: 88 and 89." },
    ],
    perfNote: "Right at the threshold on mobile. Lazy rendering of the sections below the hero is the next fix.",
  },
  {
    id: "v4",
    caseSlug: "smartfit-metrics",
    axeViolations: 0,
    pages: [
      { label: "Home", path: "/v4/", mobile: full(76), desktop: full(99), note: "Two mobile runs: 74 and 76." },
      {
        label: "Case study: SmartFit Metrics",
        path: "/v4/work/smartfit-metrics/",
        mobile: full(85),
        desktop: full(100),
      },
    ],
    perfNote:
      "The largest page on the site. The paper grain filter and many scroll timelines cost layout time on phones.",
  },
];

export const qaSummary: readonly string[] = [
  "axe-core: 0 violations on 13 URLs (the default home, each version home, one case study and the about page per version), at 1280px and 360px, with reduced motion on and off, and in dark mode.",
  "No horizontal scrolling at 360px on any of the 13 URLs.",
  "No page errors and no console errors.",
  "Lighthouse Accessibility, Best Practices and SEO: 100 on every page tested, mobile and desktop.",
  "Mobile Performance is the one score still below target on some pages. Every page scores 97 or more on desktop.",
];

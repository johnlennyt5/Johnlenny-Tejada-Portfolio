/**
 * v4 story framing: chapter titles, first-person narration and house rules.
 * Every fact here restates src/content; every number is rendered from src/content, never typed.
 * Years (2009 to 2026) and Roman chapter numerals are the only figures written in this file.
 */
import { community, getExperience, getProject, identities, nowBuilding, profile } from "@/content";
import type { Project, ProjectSlug } from "@/content";
import { routes } from "@/lib/site";

export type ArtifactKind =
  | "attendance"
  | "budget"
  | "books"
  | "certificate"
  | "workorder"
  | "builders"
  | "store"
  | "shipping"
  | "blueprint"
  | "notepad";

export interface StoryLink {
  label: string;
  href: string;
}

export interface Chapter {
  id: string;
  numeral: string;
  /** Shown in the kicker and on the spine. */
  years: string;
  place: string;
  title: string;
  paragraphs: string[];
  /** Optional list rendered from content (for example HumanixOS highlights). */
  list?: string[];
  quote?: string;
  /** Exact credit line, for example the Supreme Cuts title wording. */
  credit?: string;
  artifact: ArtifactKind;
  caption: string;
  links: StoryLink[];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function roman(n: number): string {
  return ROMAN[n - 1] ?? String(n);
}

function caseLink(slug: ProjectSlug, label?: string): StoryLink {
  const p = getProject(slug);
  return { label: label ?? `Read the ${p?.name ?? slug} case study`, href: routes.work("v4", slug) };
}

/** A sentence from the bio, found by how it starts. */
function bioSentence(start: string): string | undefined {
  for (const para of profile.bio) {
    const hit = para.split(/(?<=\.)\s+/).find((s) => s.startsWith(start));
    if (hit) return hit;
  }
  return undefined;
}

const humanix = getExperience("humanixos");
const supreme = getExperience("supreme-cuts");
const supremeYears = supreme.metrics[0]?.value;

/** "Manager, Supreme Cuts, Providence, Aug 2012 to Mar 2020 (7+ years)" built from content. */
const supremeCredit = `${supreme.role}, ${supreme.company}, ${supreme.location.split(",")[0]}, ${supreme.dates.label}${
  supremeYears ? ` (${supremeYears} years)` : ""
}`;

export const chapters: Chapter[] = [
  {
    id: "ch-fox-point",
    numeral: roman(1),
    years: "2009",
    place: "Fox Point, Providence",
    title: "First, show up for the kids",
    paragraphs: [
      "In the summer of 2009 I mentored kids at the Fox Point Boys and Girls Club in Providence. I organized activities, kept the attendance logs and taught healthy habits.",
      "Part planning, part record keeping, and all about people.",
    ],
    artifact: "attendance",
    caption: "Fox Point Boys and Girls Club, summer 2009",
    links: [],
  },
  {
    id: "ch-uri",
    numeral: roman(2),
    years: "2010 to 2014",
    place: "University of Rhode Island",
    title: "Debits, credits and a club budget",
    paragraphs: [
      "I studied accounting in the business school at the University of Rhode Island and graduated in May 2014 with a BBA in Accounting.",
      "From 2012 to 2014 I was treasurer of a student organization. Each semester I built the activity and event budget and oversaw the funds.",
    ],
    artifact: "budget",
    caption: "Treasurer, URI student organization, 2012 to 2014",
    links: [],
  },
  {
    id: "ch-supreme-cuts",
    numeral: roman(3),
    years: "2012 to 2020",
    place: "Providence",
    title: "The barbershop books",
    paragraphs: [
      "For more than seven years I managed Supreme Cuts, a barbershop in Providence. I recruited and managed the barbers and looked after the clients.",
      "I also kept the books, in Excel: transaction records, inventory and appointments, until COVID in March 2020.",
    ],
    quote: bioSentence("That is why"),
    credit: supremeCredit,
    artifact: "books",
    caption: "Supreme Cuts, Providence. The books, kept in Excel",
    links: [],
  },
  {
    id: "ch-devaccelerator",
    numeral: roman(4),
    years: "2023",
    place: "Providence",
    title: "Learning to code, while working",
    paragraphs: [
      "In 2023 I completed the DevAccelerator Certificate in Computer Science while working, with Proven Skill Certificates in UiPath, SQL, XML, JavaScript and React.",
      "Along the way I helped onboard fellow students.",
    ],
    artifact: "certificate",
    caption: "DevAccelerator, Certificate in Computer Science, 2023",
    links: [],
  },
  {
    id: "ch-humanixos",
    numeral: roman(5),
    years: "2023 to now",
    place: "Providence",
    title: "Robots for nonprofits",
    paragraphs: [
      "In January 2023 I joined HumanixOS, then called 501Database, as a software engineer. HumanixOS builds an all-in-one operating system for nonprofits, and I build AI and automation features for it.",
      "That means UiPath robots with people in the loop, AI-assisted migrations from legacy databases, CSV files and Excel sheets, and the TypeScript product code around them. Before the platform moved to TypeScript, I helped design and build its original Java and Spring Boot backend.",
    ],
    list: [humanix.highlights[2], humanix.highlights[3], humanix.highlights[4]].filter(
      (h): h is string => typeof h === "string",
    ),
    artifact: "workorder",
    caption: `HumanixOS, Providence. ${humanix.dates.label}`,
    links: humanix.url ? [{ label: "humanixos.com", href: humanix.url }] : [],
  },
  {
    id: "ch-builders",
    numeral: roman(6),
    years: "Along the way",
    place: "Providence, Smithfield and San Francisco",
    title: "Rooms full of builders",
    paragraphs: [
      "I like building rooms full of builders. I was Assistant Coordinator for TEDxProvidence 2025, on the core team of three that ran it at The VETS in Providence, where I sourced and negotiated with vendors, performers and speakers. I am also a board member of the Providence Speaking Society, the nonprofit behind TEDxProvidence.",
      "I co-hosted the Red Day hackathon at Bryant University two years running, and I teach people to code with AI and build simple full-stack apps at hackathons and community events.",
      "With the yconic team: Winner (team), Best use of AWS AI, MCP - AWS - Enterprise Agents Challenge, San Francisco, July 2025. And in January 2026, Eve, an AI avatar running on an app I built most of, gave the opening keynote at Bryant University's IDEA 2026.",
    ],
    artifact: "builders",
    caption: "Badges, ribbons and programs",
    links: [caseLink("eve", "Read about Eve"), caseLink("yconic", "Read about yconic")],
  },
  {
    id: "ch-smartfit",
    numeral: roman(7),
    years: "2025 to 2026",
    place: "Providence",
    title: "A gym app, co-founded",
    paragraphs: [
      "In May 2025 I co-founded SmartFit Metrics, which began as Iron Clad Fitness. I was one of the two engineers who coded the entire product, a React Native and Expo app with a Bun and Hono API, and I built its Stripe membership checkout.",
      "In January 2026 it shipped to the App Store as Ironclad Fitness RI, and it is on Google Play too. My partner now runs the company and its development full time, and I still hold equity.",
    ],
    artifact: "store",
    caption: "Ironclad Fitness RI, App Store release, January 2026",
    links: [caseLink("smartfit-metrics")],
  },
  {
    id: "ch-truckwhat",
    numeral: roman(8),
    years: "2026",
    place: "Providence",
    title: "A company of my own",
    paragraphs: [
      "In January 2026 I started truckWhat, my own startup: a trucking marketplace where shippers post loads and drivers haul them, with live tracking and payouts.",
      "I am building the web app, the mobile app and the Supabase backend behind them, solo. It moves money and stores sensitive data, so security could not wait for later. There is no QA team, so the CI gate is the QA team.",
    ],
    artifact: "shipping",
    caption: "truckWhat, web and mobile. Jan 2026 to present",
    links: [caseLink("truckwhat")],
  },
  {
    id: "ch-agents",
    numeral: roman(9),
    years: "2026",
    place: "Providence",
    title: "Agents, with people in the loop",
    paragraphs: [
      "In April 2026 I entered OpenAI's Parameter Golf challenge with the first Mamba submission, and OpenAI awarded me GPU credits to keep testing.",
      "In July I started ILOP on UiPath Maestro, and it is still in progress: loan and mortgage requests arrive by email, a BPMN process routes them through AI agents, and requests that need judgment go to a person in Action Center.",
      "Then came PrismShift, built solo from July to August: it migrates Blue Prism automations into UiPath without recoding them by hand, for regulated banks, with source exports parsed in the browser.",
    ],
    artifact: "blueprint",
    caption: "ILOP and PrismShift, summer 2026",
    links: [caseLink("ilop", "Read about ILOP"), caseLink("prismshift", "Read about PrismShift"), caseLink("parameter-golf", "Read about Parameter Golf")],
  },
  {
    id: "ch-now",
    numeral: roman(10),
    years: "Now",
    place: profile.location.label,
    title: "Still building",
    paragraphs: [profile.availability],
    list: nowBuilding.map((n) => `${n.title}. ${n.detail}`),
    artifact: "notepad",
    caption: "On the bench, today",
    links: [],
  },
];

/* ---------- House rules: how I work, each with proof from the record ---------- */

export interface HouseRule {
  title: string;
  text: string;
  proof: string;
  source: string;
  href?: string;
}

function decision(slug: ProjectSlug, title: string): string {
  return getProject(slug)?.caseStudy.decisions.find((d) => d.title === title)?.detail ?? "";
}

const automation = identities.find((i) => i.id === "automation");
const prism = getProject("prismshift");

export const houseRules: HouseRule[] = [
  {
    title: "Exceptions go to a person.",
    text: "Turn manual, multi-step work into exception-only work, and keep people in the loop where the stakes call for it.",
    proof: decision("ilop", "People where judgment matters"),
    source: "ILOP",
    href: routes.work("v4", "ilop"),
  },
  {
    title: "Prove it in CI.",
    text: "If a promise matters to a security reviewer, a test in the pipeline should keep it.",
    proof: decision("prismshift", "Tenant isolation proven, not promised"),
    source: "PrismShift",
    href: routes.work("v4", "prismshift"),
  },
  {
    title: "Guard the data where it lives.",
    text: "Access rules belong in the database, not only in the app on top of it.",
    proof: decision("truckwhat", "Security enforced in the database"),
    source: "truckWhat",
    href: routes.work("v4", "truckwhat"),
  },
  {
    title: "Count what it saves.",
    text: "I came to software from the business side, so I care what an automation saves and who it serves.",
    proof: automation?.proof[0] ?? "",
    source: "HumanixOS",
  },
  {
    title: "Keep AI where it belongs.",
    text: "Some decisions need fixed, explainable rules instead of a model.",
    proof: decision("ilop", "Where AI deliberately is not"),
    source: "ILOP",
    href: routes.work("v4", "ilop"),
  },
  {
    title: "Say what it is not.",
    text: "Every case study on this site ends with its caveats.",
    proof: prism?.caseStudy.caveats[0] ?? "",
    source: "PrismShift",
    href: routes.work("v4", "prismshift"),
  },
].filter((r) => r.proof.length > 0);

/* ---------- Small helpers shared by v4 pages ---------- */

export const teamLabel: Record<Project["team"], string> = {
  solo: "Solo",
  team: "With a team",
  "co-founder": "Co-founder",
};

/** Community items by id, for the "Beyond work" page. */
export function communityItem(id: string) {
  return community.find((c) => c.id === id);
}

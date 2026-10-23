import type { Experience } from "./types";

/**
 * Work history, most recent and most relevant first.
 * HumanixOS: plain-text name and link only. No logo, no screenshots, no client names.
 */
export const experience: Experience[] = [
  {
    id: "humanixos",
    company: "HumanixOS",
    formerly: "501Database",
    role: "Software Engineer",
    location: "Providence, RI",
    dates: { start: "2023-01", end: null, label: "Jan 2023 to present" },
    url: "https://humanixos.com",
    about:
      "HumanixOS is a Providence software company building an all-in-one operating system for nonprofits: clients, programs, grants, donors, volunteers, communications and reporting in one platform.",
    highlights: [
      "Build AI and automation features for a live multi-tenant nonprofit platform serving 30+ nonprofit tenants and 200+ users, now on JavaScript and TypeScript.",
      "Migrated customers onto the platform from legacy databases, CSV files and Excel sheets, using AI-assisted column mapping for imports of 5,000+ records with 80% less manual mapping.",
      "Built an unattended UiPath import bot (REFramework dispatcher and performer, retries, exception reports) that took a 3-hour manual import to zero-touch.",
      "Automated nonprofit verification with human-in-the-loop review in Action Center, cutting approval turnaround from 5 days to under 2 hours.",
      "Built a form-triage bot with fuzzy-match deduplication that reached 85% straight-through processing.",
      "Helped design and build the original Java and Spring Boot backend: 17 REST controllers and 100+ endpoints with JWT and API-key security and per-tenant MySQL schemas, deployed on AWS (Elastic Beanstalk, SES, SNS). The platform has since moved to TypeScript.",
      "Own the full cycle on my work: PDD and SDD design documents, peer code review, UAT, go-live, and production support with root-cause analysis.",
      "Onboard new teammates and pair-program with coworkers.",
    ],
    metrics: [
      { value: "30+", label: "nonprofit tenants", evidence: "hx-tenants" },
      { value: "200+", label: "users", evidence: "hx-users" },
      { value: "85%", label: "straight-through processing", evidence: "hx-stp" },
      { value: "80%", label: "less manual mapping", evidence: "hx-mapping" },
      { value: "5,000+", label: "records per import", evidence: "hx-records" },
      { value: "3+", label: "years of UiPath and SQL", evidence: "hx-years" },
    ],
    stack: [
      "UiPath Studio",
      "Orchestrator",
      "REFramework",
      "Action Center",
      "Document Understanding",
      "AI Center",
      "Maestro",
      "JavaScript",
      "TypeScript",
      "SQL",
      "MySQL",
      "Java and Spring Boot (earlier)",
      "Spring Data JPA and Hibernate (earlier)",
      "AWS Elastic Beanstalk, SES, SNS",
      "OpenAI API",
    ],
    links: [{ label: "humanixos.com", href: "https://humanixos.com", kind: "site" }],
    displayNotes:
      "Name and link as plain text only. Never show the HumanixOS logo, product screenshots, client names or data. Describe Java work in the past tense.",
  },
  {
    id: "smartfit-metrics",
    company: "SmartFit Metrics",
    formerly: "Iron Clad Fitness",
    role: "Engineer, one of two",
    location: "Providence, RI",
    dates: { start: "2025-05", end: "2026-01", label: "May 2025 to Jan 2026" },
    url: "https://smartfitmetrics.com",
    about:
      "SmartFit Metrics makes gym management software: memberships, billing, class scheduling, check-in and analytics in one product, with a mobile app for members.",
    highlights: [
      "One of the two engineers who coded the entire product: a React Native and Expo app with a Bun and Hono API.",
      "Built the Stripe membership checkout in the app and the Stripe integration in the backend.",
      "Helped ship the app as Ironclad Fitness RI: released on the Apple App Store in January 2026, and also on Google Play.",
      "I have since stepped back from day-to-day development, and the company's own team now runs it.",
    ],
    metrics: [],
    stack: ["React Native", "Expo and EAS", "Bun", "Hono", "Supabase", "Stripe"],
    links: [
      {
        label: "App Store",
        href: "https://apps.apple.com/us/app/ironclad-fitness-ri/id6756619809",
        kind: "store",
      },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.smartfitmetrics.ironcladfitness",
        kind: "store",
      },
      { label: "smartfitmetrics.com", href: "https://smartfitmetrics.com", kind: "site" },
    ],
    relatedProject: "smartfit-metrics",
    displayNotes: "Do not name the partner. Do not imply today's full feature list is his work.",
  },
  {
    id: "supreme-cuts",
    company: "Supreme Cuts",
    role: "Manager",
    location: "Providence, RI",
    dates: { start: "2012-08", end: "2020-03", label: "Aug 2012 to Mar 2020" },
    about: "A barbershop in Providence.",
    highlights: [
      "Managed a Providence barbershop for 7+ years: recruited and managed barbers and looked after client relationships.",
      "Kept the books in Excel: transaction records, inventory and appointments, until COVID in March 2020.",
    ],
    metrics: [{ value: "7+", label: "years managing the shop", evidence: "sc-years" }],
    stack: ["Excel"],
    links: [],
    displayNotes: "Show as the business-side chapter: people management and bookkeeping.",
  },
];

export function getExperience(id: Experience["id"]): Experience {
  const item = experience.find((e) => e.id === id);
  if (!item) throw new Error(`Unknown experience id: ${id}`);
  return item;
}

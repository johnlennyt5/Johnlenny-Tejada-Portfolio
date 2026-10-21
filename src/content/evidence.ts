/**
 * Evidence register: every number the site may show, with where it comes from.
 *
 * Sources:
 *   Ledger   = johnlenny-job-search/johnlenny/confirmed-experience.md (rows dated 2026-10-20 win)
 *   Phase 0  = _private/phase0/PHASE-0-REPORT.md section 3 (fact-checked evidence table)
 *   Found    = _private/phase0/08-found-facts.md
 *
 * scripts/audit-facts.mjs builds its allowlist from this file, so a number that is
 * not here (or in `namedTerms` / `structuralNumbers`) fails the audit.
 *
 * This file must stay import-free so Node can load it directly with type stripping.
 */

interface EvidenceRow {
  id: string;
  /** Exactly as shown on the site. */
  value: string;
  claim: string;
  source: string;
}

export const evidence = [
  // truckWhat
  {
    id: "tw-commits",
    value: "730+",
    claim: "Commits across the truckWhat web and mobile repos, all his",
    source:
      "Ledger 'Verified from his own code': web 464 + mobile 267 commits; ledger 2026-10-20 row 'Second git identity is his' (mobile 267/267 his)",
  },
  {
    id: "tw-vitest",
    value: "800+",
    claim: "Vitest automated tests on the truckWhat web app",
    source: "Ledger row 'Approved resume wording for the test counts (2026-10-04)'; Phase 0 E6",
  },
  {
    id: "tw-jest",
    value: "350+",
    claim: "Jest automated tests on the truckWhat mobile app",
    source: "Ledger row 'Approved resume wording for the test counts (2026-10-04)'; Phase 0 E6",
  },
  {
    id: "tw-rls",
    value: "200+",
    claim: "Row-level security policies in truckWhat's Postgres",
    source: "Phase 0 'Claims that failed' table: use '200+ row-level security policies' instead of the ledger's unreproducible count",
  },
  {
    id: "tw-webhooks",
    value: "12+",
    claim: "Stripe webhook event types handled by truckWhat",
    source: "Ledger row 'Event-driven systems (verified 2026-10-05)'",
  },
  {
    id: "tw-findings",
    value: "28",
    claim: "Security review findings closed in truckWhat",
    source: "Ledger row 'Security review + regulated/sensitive data (verified 2026-10-09)'",
  },
  {
    id: "tw-roundtrips",
    value: "500",
    claim: "Database round trips replaced by one bulk write per batch",
    source: "Ledger 'Performance' row; Phase 0 E10",
  },
  {
    id: "tw-timeout",
    value: "5 second",
    claim: "Transaction timeout the bulk write fixed",
    source: "Ledger 'Performance' row ('fixed 5 s transaction timeouts')",
  },
  {
    id: "tw-ci",
    value: "2",
    claim: "GitHub Actions CI workflows (web and mobile)",
    source: "Ledger 'CI/CD' row: 2 CI workflows + 1 cron workflow; Phase 0 E7",
  },
  {
    id: "tw-cron",
    value: "1",
    claim: "Scheduled GitHub Actions cron workflow",
    source: "Ledger 'CI/CD' row: 2 CI workflows + 1 cron workflow; Phase 0 E7",
  },
  {
    id: "tw-handlers",
    value: "482",
    claim: "Error handlers that moved from console-only logging to in-house monitoring",
    source: "Ledger 'Monitoring' row ('replaced console-only logging in 482 error handlers'); Phase 0 E9",
  },
  {
    id: "tw-admin-roles",
    value: "4",
    claim: "Admin roles in the truckWhat admin portal",
    source: "Ledger row 'Admin portal (verified, his platform)'; Phase 0 E11",
  },
  {
    id: "tw-aes",
    value: "AES-256-GCM",
    claim: "Encryption used for Plaid bank tokens",
    source: "Ledger row 'Security review + regulated/sensitive data'",
  },
  {
    id: "tw-soc2",
    value: "SOC 2",
    claim: "Trust Services Criteria the security controls were mapped to",
    source: "Ledger row 'Security review + regulated/sensitive data'",
  },

  // PrismShift
  {
    id: "ps-commits",
    value: "214",
    claim: "PrismShift commits, all his (Jul to Aug 2026)",
    source: "Ledger row 'Migration Platform for Regulated Banking' (214/214); Phase 0 E13",
  },
  {
    id: "ps-pgtap",
    value: "75",
    claim: "pgTAP assertions proving tenant isolation in CI",
    source: "Ledger row 'Migration Platform for Regulated Banking'; Phase 0 E14",
  },

  // HumanixOS
  {
    id: "hx-tenants",
    value: "30+",
    claim: "Nonprofit tenants on the HumanixOS platform",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio' (resume and Wellfound figures)",
  },
  {
    id: "hx-users",
    value: "200+",
    claim: "Users on the HumanixOS platform",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio'",
  },
  {
    id: "hx-controllers",
    value: "17",
    claim: "REST controllers in the original Java/Spring Boot backend (past tense)",
    source: "Ledger 2026-10-20 'Public-record check' ('HumanixOS controllers: 17 is correct'); Found section 6",
  },
  {
    id: "hx-endpoints",
    value: "100+",
    claim: "Endpoints in the original Java/Spring Boot backend (past tense)",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio'",
  },
  {
    id: "hx-import",
    value: "3-hour",
    claim: "Manual import process the UiPath import bot made zero-touch",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio'",
  },
  {
    id: "hx-verify-before",
    value: "5 days",
    claim: "Nonprofit verification turnaround before automation",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio'",
  },
  {
    id: "hx-verify-after",
    value: "under 2 hours",
    claim: "Nonprofit verification turnaround after automation",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio'",
  },
  {
    id: "hx-stp",
    value: "85%",
    claim: "Straight-through processing reached by the form-triage bot",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio'",
  },
  {
    id: "hx-records",
    value: "5,000+",
    claim: "Records per customer data import",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio' and 'HumanixOS data migration'",
  },
  {
    id: "hx-mapping",
    value: "80%",
    claim: "Less manual column mapping with AI-assisted mapping",
    source: "Ledger 2026-10-20 'HumanixOS numbers OK on the portfolio'",
  },
  {
    id: "hx-years",
    value: "3+",
    claim: "Years of UiPath and SQL work at HumanixOS",
    source: "Ledger 'Timeline and education' (UiPath and SQL since Jan 2023, 3+ years each); Phase 0 E1",
  },

  // OpenAI Parameter Golf
  {
    id: "pg-limit",
    value: "16 MB",
    claim: "Artifact size limit in the OpenAI Parameter Golf challenge",
    source: "Ledger row 'OpenAI Parameter Golf challenge (verified on GitHub 2026-10-14)'",
  },
  {
    id: "pg-params",
    value: "27M",
    claim: "Approximate parameter count of his Mamba hybrid entry",
    source: "Ledger row 'OpenAI Parameter Golf challenge' ('about 27M parameters')",
  },
  {
    id: "pg-artifact",
    value: "7.3 MB",
    claim: "Size of his compressed entry artifact",
    source: "Ledger row 'OpenAI Parameter Golf challenge'",
  },
  {
    id: "pg-tests",
    value: "115",
    claim: "Unit and integration tests in his Parameter Golf work",
    source: "Ledger row 'OpenAI Parameter Golf challenge'",
  },
  {
    id: "pg-pr",
    value: "#1382",
    claim: "His open pull request to openai/parameter-golf",
    source: "Ledger row 'OpenAI Parameter Golf challenge' ('open PR #1382')",
  },
  {
    id: "pg-quant",
    value: "int5 to int7",
    claim: "Mixed-precision GPTQ quantization range",
    source: "Ledger row 'OpenAI Parameter Golf challenge' ('GPTQ int5/int6/int7')",
  },
  {
    id: "pg-mamba2",
    value: "Mamba-2",
    claim: "State-space layer type in his hybrid",
    source: "Ledger row 'OpenAI Parameter Golf challenge' ('15 Mamba-2 SSM + 3 GQA attention layers')",
  },

  // Eve
  {
    id: "eve-coaches",
    value: "7",
    claim: "Industry coaches in the Eve interview coach",
    source: "Ledger row 'AI virtual keynote speaker = Eve'; Phase 0 E20 (quote 7 from README/ledger only)",
  },
  {
    id: "eve-idea",
    value: "IDEA 2026",
    claim: "Bryant University event where Eve gave the opening keynote (January 2026)",
    source: "Ledger 2026-10-20 'Public-record check' (IDEA 2026 ran Jan 14 to 16, 2026); Found section 1",
  },

  // People and community
  {
    id: "sc-years",
    value: "7+",
    claim: "Years managing Supreme Cuts (Aug 2012 to Mar 2020)",
    source: "Ledger 2026-10-20 'Portfolio defaults approved' ('managed a Providence barbershop for 7+ years')",
  },
  {
    id: "tedx-2025",
    value: "TEDxProvidence 2025",
    claim: "Assistant Coordinator, TEDxProvidence 2025 (Feb 8, 2025)",
    source: "Ledger 2026-10-20 'Public-record check'; Found section 3 (tedxprovidence.com)",
  },
] as const satisfies readonly EvidenceRow[];

export type EvidenceId = (typeof evidence)[number]["id"];

export function getEvidence(id: EvidenceId): EvidenceRow {
  const row = evidence.find((e) => e.id === id);
  if (!row) throw new Error(`Unknown evidence id: ${id}`);
  return row;
}

/**
 * Product and standard names that contain digits. Not claims, so they are allowed
 * anywhere. Keep this list short and literal.
 */
export const namedTerms = [
  "AES-GCM",
  "AES-256-GCM",
  "SOC 2",
  "Mamba-2",
  "int5",
  "int6",
  "int7",
  "IDEA 2026",
  "TEDxProvidence 2025",
  "N+1",
  "Java 17",
  "pgTAP",
  "PR #1382",
  "Next.js 15",
  "501Database",
] as const;

/**
 * Numbers that carry no claim: version labels, section numbers, months, error pages.
 * Years from 2009 to 2026 are allowed by the audit automatically.
 */
export const structuralNumbers = [
  "1",
  "2",
  "3",
  "4",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "404",
] as const;

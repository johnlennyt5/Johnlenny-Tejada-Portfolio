/**
 * Architecture maps drawn from each project's real folder structure. Every node
 * names a path that exists in that project's repository (relative to its root).
 * Edges read "from depends on / calls / feeds to".
 */
export type ArchNode = { id: string; label: string; detail: string; path: string };
export type ArchEdge = [from: string, to: string, label?: string];
export type Architecture = { nodes: ArchNode[]; edges: ArchEdge[] };

export const architecture: Record<string, Architecture> = {
  truckwhat: {
    nodes: [
      {
        id: "mobile",
        label: "Driver and company mobile app",
        detail: "Expo Router app with (auth), (driver) and (company) route groups, HOS, live location and trip screens.",
        path: "truckWhatMobile/app",
      },
      {
        id: "web",
        label: "Next.js web app",
        detail: "Localized App Router pages for drivers, companies, fleets and admins under one [locale] segment.",
        path: "truckWhat2.0/src/app/[locale]",
      },
      {
        id: "proxy",
        label: "Edge proxy",
        detail: "next-intl locale routing plus Supabase session refresh on every request.",
        path: "truckWhat2.0/src/proxy.ts",
      },
      {
        id: "api",
        label: "API routes",
        detail: "Route handlers for loads, tracking, payments, disputes, fleet, AI and admin; shared by web and mobile.",
        path: "truckWhat2.0/src/app/api",
      },
      {
        id: "lib",
        label: "Domain services",
        detail: "Business logic for HOS, tracking and ETA, escrow, payouts, relays, reliability and routing.",
        path: "truckWhat2.0/src/lib",
      },
      {
        id: "prisma",
        label: "Prisma schema",
        detail: "Typed data model and seed data; the app reaches Postgres through Prisma.",
        path: "truckWhat2.0/prisma/schema.prisma",
      },
      {
        id: "supabase",
        label: "Supabase Postgres, Auth and Storage",
        detail: "SQL migrations for row-level security, storage policies, HOS, disputes and the money path.",
        path: "truckWhat2.0/supabase/migrations",
      },
      {
        id: "stripe",
        label: "Stripe Connect",
        detail: "Escrowed load payments, driver payouts and the signed webhook that freezes disputed charges.",
        path: "truckWhat2.0/src/app/api/webhooks/stripe/route.ts",
      },
      {
        id: "plaid",
        label: "Plaid",
        detail: "Bank account linking for driver payouts.",
        path: "truckWhat2.0/src/lib/plaid/client.ts",
      },
      {
        id: "ai",
        label: "AI layer",
        detail: "Provider-agnostic LLM client for route intelligence, load bundling and company insights.",
        path: "truckWhat2.0/src/lib/ai",
      },
      {
        id: "cron",
        label: "Scheduled jobs",
        detail: "Payment release, load expiry, document expiration, account lifecycle and rating reminders.",
        path: "truckWhat2.0/src/app/api/cron",
      },
      {
        id: "valhalla",
        label: "Truck routing engine",
        detail: "Self-hosted Valhalla behind Caddy (docker-compose) for truck-legal routes.",
        path: "truckWhat2.0/infra/valhalla",
      },
    ],
    edges: [
      ["mobile", "api", "REST + Supabase JWT"],
      ["web", "proxy", "every request"],
      ["web", "api"],
      ["api", "lib"],
      ["lib", "prisma"],
      ["prisma", "supabase", "Postgres"],
      ["api", "stripe", "PaymentIntents, Connect"],
      ["stripe", "api", "signed webhooks"],
      ["lib", "plaid"],
      ["lib", "ai"],
      ["lib", "valhalla", "route requests"],
      ["cron", "lib"],
    ],
  },

  prismshift: {
    nodes: [
      {
        id: "web",
        label: "Browser app",
        detail: "React + Vite UI; parsing runs in a Web Worker so source exports never leave the machine.",
        path: "apps/web/src",
      },
      {
        id: "worker",
        label: "Parse worker",
        detail: "Comlink-wrapped worker that runs the parser and rules off the main thread.",
        path: "apps/web/src/workers",
      },
      {
        id: "parser",
        label: "@prismshift/parser",
        detail: "Blue Prism .bprelease / .xml export to the intermediate representation, schema-version tolerant.",
        path: "packages/parser/src/parse.ts",
      },
      {
        id: "parser-aa",
        label: "@prismshift/parser-aa",
        detail: "Automation Anywhere bot parser into the same IR.",
        path: "packages/parser-aa/src/parseAaBot.ts",
      },
      {
        id: "ir",
        label: "@prismshift/ir",
        detail: "Vendor-neutral graph model: processes, pages, stages, edges, queues and dependencies.",
        path: "packages/ir/src/types.ts",
      },
      {
        id: "rules",
        label: "@prismshift/rules",
        detail: "Security, reliability, compliance and maintenance rules plus per-process scoring.",
        path: "packages/rules/src/engine.ts",
      },
      {
        id: "transformer",
        label: "@prismshift/transformer",
        detail: "IR to UiPath XAML, project.json, REFramework layout and the Maestro queue pipeline BPMN.",
        path: "packages/transformer/src",
      },
      {
        id: "reports",
        label: "@prismshift/reports",
        detail: "Summaries, migration report, runtime roadmap, redaction and the UiPath export bundle.",
        path: "packages/reports/src",
      },
      {
        id: "corpus",
        label: "@prismshift/corpus",
        detail: "Synthetic .bprelease samples with JSON answer keys that the parser and rules are tested against.",
        path: "packages/corpus/samples",
      },
      {
        id: "cli",
        label: "@prismshift/cli",
        detail: "Packs .nupkg files and deploys to UiPath Orchestrator (folders, machines, triggers) over OData.",
        path: "packages/cli/src",
      },
      {
        id: "supabase",
        label: "Supabase workspace backend",
        detail: "Metadata-only schema, RLS policies, retention and encrypted-artifact storage gate.",
        path: "supabase/migrations",
      },
      {
        id: "pgtap",
        label: "pgTAP isolation tests",
        detail: "RLS isolation, workspace RPC and artifact suites run in CI.",
        path: "supabase/tests",
      },
      {
        id: "llm",
        label: "LLM proxy Edge Function",
        detail: "Opt-in AI narratives routed through a server-side proxy after redaction.",
        path: "supabase/functions/llm-proxy",
      },
    ],
    edges: [
      ["web", "worker", "file bytes"],
      ["worker", "parser"],
      ["parser", "ir"],
      ["parser-aa", "ir"],
      ["rules", "ir", "reads"],
      ["transformer", "rules"],
      ["reports", "transformer"],
      ["web", "reports", "exports + audit PDF"],
      ["corpus", "rules", "answer-key tests"],
      ["cli", "transformer", "deploy"],
      ["web", "supabase", "metadata only"],
      ["pgtap", "supabase", "proves isolation"],
      ["web", "llm", "opt-in, redacted"],
    ],
  },

  "smartfit-metrics": {
    nodes: [
      {
        id: "app",
        label: "Expo mobile app",
        detail: "Expo Router screens for schedule, check-in, programs, memberships, account and an admin group (App Store: Ironclad Fitness RI).",
        path: "iron-clad-fit/app",
      },
      {
        id: "providers",
        label: "App providers",
        detail: "Auth, drawer and modal context providers wrapping the navigation tree.",
        path: "iron-clad-fit/src/providers",
      },
      {
        id: "requests",
        label: "API request layer",
        detail: "Axios client with per-environment base URLs and one module per resource.",
        path: "iron-clad-fit/src/requests",
      },
      {
        id: "supabase-client",
        label: "Supabase client",
        detail: "Mobile sign-in and session handling.",
        path: "iron-clad-fit/src/lib/supabase.ts",
      },
      {
        id: "api",
        label: "Bun + Hono API",
        detail: "Bun.serve entry mounting every resource router under /api.",
        path: "Iron-clad-bun-api/src/routes/index.ts",
      },
      {
        id: "auth",
        label: "Auth middleware",
        detail: "Verifies the Supabase bearer token and loads role names (member, gym admin, super admin).",
        path: "Iron-clad-bun-api/src/middleware/auth.ts",
      },
      {
        id: "routes",
        label: "Resource routes",
        detail: "Classes, schedule, registrations, check-ins, workouts, records, programs, memberships, analytics.",
        path: "Iron-clad-bun-api/src/routes",
      },
      {
        id: "stripe",
        label: "Stripe payments",
        detail: "Products, PaymentIntents, customers, subscriptions and a signed webhook.",
        path: "Iron-clad-bun-api/src/routes/stripe/index.ts",
      },
      {
        id: "db",
        label: "Supabase Postgres",
        detail: "Typed tables for profiles, classes, check-ins and workouts.",
        path: "Iron-clad-bun-api/src/types/database.ts",
      },
      {
        id: "docker",
        label: "Container",
        detail: "Dockerfile for deploying the API.",
        path: "Iron-clad-bun-api/Dockerfile",
      },
    ],
    edges: [
      ["app", "providers"],
      ["app", "requests"],
      ["providers", "supabase-client", "session"],
      ["requests", "api", "HTTPS + bearer token"],
      ["api", "auth"],
      ["auth", "routes"],
      ["routes", "db"],
      ["api", "stripe", "/api/payments"],
      ["docker", "api", "runs"],
    ],
  },

  ilop: {
    nodes: [
      {
        id: "bpmn",
        label: "Maestro BPMN process",
        detail: "Email-triggered orchestration: routing gateways, agent tasks, queues and a human review task.",
        path: "Maestro BPMN/Process.bpmn",
      },
      {
        id: "router",
        label: "Intake Router Agent",
        detail: "Classifies each request as LOAN, MORTGAGE or OTHER with a confidence score.",
        path: "intakeRouterAgent/agent.json",
      },
      {
        id: "loan",
        label: "Loan Extractor Agent",
        detail: "Extracts loan application fields from email bodies and attachments.",
        path: "loanExtractorAgent/agent.json",
      },
      {
        id: "mortgage",
        label: "Mortgage Extractor Agent",
        detail: "Extracts mortgage fields including property value and occupancy.",
        path: "mortgageExtractorAgent/agent.json",
      },
      {
        id: "compliance",
        label: "Compliance Check Agent",
        detail: "Hard-veto rules; a veto can never be outvoted into auto-approve.",
        path: "complianceCheckAgent/agent.json",
      },
      {
        id: "risk",
        label: "Risk Assessment Agent",
        detail: "Deterministic 0 to 100 score from permitted inputs only, with confidence and data gaps.",
        path: "riskAssessmentAgent/agent.json",
      },
      {
        id: "rpa",
        label: "RPA workflow",
        detail: "UiPath robot workflow invoked from the process.",
        path: "RPA Workflow/Main.xaml",
      },
      {
        id: "queues",
        label: "Orchestrator queues",
        detail: "Intake, triage, auto-approved, auto-denied, human-review, human-approved and human-denied queues.",
        path: "resources/solution_folder/queue",
      },
      {
        id: "evals",
        label: "Agent evaluations",
        detail: "Evaluation sets and trajectory evaluators per agent.",
        path: "riskAssessmentAgent/evals",
      },
    ],
    edges: [
      ["bpmn", "router", "classify"],
      ["bpmn", "loan", "if LOAN"],
      ["bpmn", "mortgage", "if MORTGAGE"],
      ["bpmn", "compliance"],
      ["bpmn", "risk"],
      ["bpmn", "queues", "disposition"],
      ["bpmn", "rpa"],
      ["evals", "risk", "scores outputs"],
    ],
  },

  meridian: {
    nodes: [
      {
        id: "unified",
        label: "Unified Maestro BPMN",
        detail: "Week 3 process joining the loan and claims paths behind one disposition gateway.",
        path: "Week 3/Unified/Process.bpmn",
      },
      {
        id: "router",
        label: "Intake Router Agent",
        detail: "Classifies each uploaded document as a loan or a claim.",
        path: "Week 3/IntakeRouterAgent/agent.json",
      },
      {
        id: "loanAgent",
        label: "Loan Agent",
        detail: "Week 1 loan decision agent.",
        path: "Week 1/LoanAgent/agent.json",
      },
      {
        id: "claimsAgent",
        label: "Claims Agent",
        detail: "Week 2 health-claims adjudication agent.",
        path: "Week 2/ClaimsAgent/agent.json",
      },
      {
        id: "risk",
        label: "Risk Scoring Agent",
        detail: "Risk score, tier and recommended action.",
        path: "Week 3/RiskScoringAgent/agent.json",
      },
      {
        id: "compliance",
        label: "Compliance Check Agent",
        detail: "ECOA, Fair Housing, SR 11-7 and HIPAA checks; decides whether a human must review.",
        path: "Week 3/ComplianceCheckAgent/agent.json",
      },
      {
        id: "comms",
        label: "Customer Communication Agent",
        detail: "Writes the decision letter subject and body.",
        path: "Week 3/CustomerCommunicationAgent/agent.json",
      },
      {
        id: "rpa",
        label: "Extraction robots",
        detail: "RPA workflows that pull loan and claim fields from the uploaded files.",
        path: "Week 2/Claims_RPA_Workflow",
      },
      {
        id: "review",
        label: "Review app (Action Center)",
        detail: "Human-in-the-loop review form for low-confidence or escalated cases.",
        path: "Week 3/MeridianReviewApp",
      },
      {
        id: "decision",
        label: "Decision Center dashboard",
        detail: "Outcomes, straight-through-processing rate and performance metrics.",
        path: "Week 3/MeridianDecisionCenter",
      },
      {
        id: "queues",
        label: "Orchestrator queues",
        detail: "Auto-approve, auto-pay, auto-deny, SIU referral, high-value and manual review queues.",
        path: "resources/solution_folder/queue",
      },
    ],
    edges: [
      ["unified", "router", "classify"],
      ["unified", "rpa", "extract fields"],
      ["unified", "loanAgent", "loan"],
      ["unified", "claimsAgent", "claim"],
      ["unified", "risk"],
      ["unified", "compliance"],
      ["unified", "queues", "disposition"],
      ["unified", "review", "review (default)"],
      ["unified", "comms"],
      ["queues", "decision", "audit trail"],
    ],
  },
};

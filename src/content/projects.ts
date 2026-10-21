import type { Project, ProjectSlug } from "./types";

/**
 * Projects and their case studies. Copy is written from the fact-checked Phase 0
 * evidence; every number appears in evidence.ts. Private repos are described, never linked.
 */
export const projects: Project[] = [
  {
    slug: "prismshift",
    name: "PrismShift",
    tagline: "Migration Platform for Regulated Banking",
    role: "Solo builder",
    team: "solo",
    dates: { start: "2026-07", end: "2026-08", label: "Jul to Aug 2026" },
    identities: ["automation", "fullstack"],
    order: 1,
    featured: true,
    stack: [
      "TypeScript",
      "React",
      "Vite",
      "Web Workers",
      "fast-xml-parser",
      "pnpm and Turborepo monorepo",
      "Supabase",
      "Row-level security",
      "pgTAP",
      "Vitest",
      "GitHub Actions",
      "Anthropic API (through an LLM proxy)",
      "UiPath REFramework",
      "UiPath Orchestrator (OData)",
      "Maestro BPMN",
    ],
    oneLiner:
      "Migrates Blue Prism automations into UiPath without recoding them by hand, built for regulated banks, with source exports parsed in the browser.",
    summary:
      "PrismShift parses Blue Prism release exports in the browser, runs 14 analysis rules on every process, and generates UiPath REFramework projects, Maestro BPMN for human review and a migration report with an effort estimate. Redaction guards check everything that leaves the browser, and tenant isolation is proven in CI with 75 pgTAP assertions.",
    links: [],
    linkNote: "The repository is private. I am happy to walk through the code live.",
    metrics: [
      { value: "214", label: "commits, all mine", evidence: "ps-commits" },
      { value: "75", label: "pgTAP isolation assertions in CI", evidence: "ps-pgtap" },
    ],
    diagram: "prismshift",
    caseStudy: {
      problem:
        "Banks that want to leave Blue Prism face a rewrite: every process has to be rebuilt by hand in UiPath. The exports that hold that logic can also carry credential references, internal hostnames and business rules, so a migration tool built for banks should not need to upload them anywhere.",
      constraints: [
        "Source exports should stay on the analyst's machine, so parsing and analysis run client-side in the browser.",
        "The output has to run in real UiPath tooling, not just look plausible in a diff.",
        "Enterprise reviewers need evidence before they say yes: tenant isolation, an audit trail, retention rules and a threat model.",
        "A solo build, July to August 2026.",
      ],
      decisions: [
        {
          title: "Browser-first pipeline",
          detail:
            "Blue Prism release exports (.bprelease or .xml) are dropped into the browser and parsed client-side with fast-xml-parser in a Web Worker. Redaction guards check everything that leaves the browser, and artifacts are AES-GCM encrypted on the client with a key that never reaches the database.",
        },
        {
          title: "Rules before conversion",
          detail:
            "14 analysis rules across security, reliability, maintainability and compliance flag issues in each process before anything is converted.",
        },
        {
          title: "Output a team can deploy",
          detail:
            "The converter generates UiPath REFramework projects, asset and queue manifests, test workflows and a migration report with an effort estimate. Maestro BPMN covers the human-review steps, and deployment to Orchestrator goes through its OData API.",
        },
        {
          title: "Tenant isolation proven, not promised",
          detail:
            "Row-level security isolates each workspace, and a dedicated CI job proves it with 75 pgTAP assertions. The audit_events table is immutable: no updates and no deletes.",
        },
        {
          title: "AI behind a proxy",
          detail:
            "Calls to the Anthropic API go through an LLM proxy with per-workspace rate limits and origin restrictions.",
        },
        {
          title: "Answer keys in CI",
          detail:
            "A golden answer-key regression suite runs 6 synthetic releases in CI and fails on a missed finding and on a false positive.",
        },
      ],
      tradeoffs: [
        "Assisted conversion instead of a promise of full automation: in a sample run on an email-driven Blue Prism refund pipeline from Packt, 274 of 345 stages converted automatically (79%), and the migration report estimates the effort for the rest.",
        "Human-review steps stay in the generated Maestro BPMN instead of being automated away.",
        "Client-side parsing and encryption put more work in the browser, in exchange for keeping source exports and keys out of the database.",
      ],
      whatBroke: [],
      results: [
        "Converts Blue Prism release exports into UiPath REFramework projects, asset and queue manifests, test workflows and a migration report with an effort estimate.",
        "In a sample run, 274 of 345 stages of an email-driven Blue Prism refund pipeline from Packt converted automatically (79%), and the result ran on my live UiPath tenant.",
        "Tenant isolation proven by 75 pgTAP assertions in a CI pipeline that also runs lint, tests and a build.",
        "A STRIDE threat model and an infosec approval pack written for enterprise reviewers.",
        "Client-side AES-GCM encrypted artifacts whose key never reaches the database, an immutable audit log, and retention with purge for erasure requests.",
        "214 commits, all mine.",
      ],
      tests: [
        "1,038 Vitest tests.",
        "75 pgTAP assertions for tenant isolation, run in their own CI job.",
        "Golden answer-key regression suite on 6 synthetic releases: CI fails on a missed finding and on a false positive.",
      ],
      caveats: [
        "Built and tested on synthetic samples and a public Blue Prism sample, not on a bank's production estate.",
        "Conversion is assisted: what does not convert automatically is estimated in the migration report for a person to finish.",
        "The tool does not read a mailbox. In the Packt sample run, the email-field values on the queue items were seeded by hand.",
        "This is my own independent project, separate from the Blue Prism work I have done at HumanixOS.",
        "The repository is private, so there is no public link.",
      ],
    },
  },
  {
    slug: "ilop",
    name: "ILOP",
    tagline: "Agentic loan and mortgage intake on UiPath Maestro",
    role: "Solo builder",
    team: "solo",
    dates: { start: "2026-07", end: null, label: "Jul 2026, in progress" },
    identities: ["automation"],
    order: 2,
    featured: true,
    stack: [
      "UiPath Maestro (BPMN)",
      "UiPath agents",
      "Agent evaluations",
      "Integration Service (Gmail trigger)",
      "Document Understanding",
      "Action Center",
      "Orchestrator queues",
    ],
    oneLiner:
      "Loan and mortgage requests arrive by email; a BPMN process routes them through AI agents for classification, extraction and compliance, and sends requests that need judgment to a person in Action Center.",
    summary:
      "ILOP is an agentic intake flow for a fictional bank, built solo on UiPath Maestro and still in progress. BPMN orchestrates the flow, AI agents classify and extract, risk scoring stays deterministic, and requests that need judgment go to a person in Action Center.",
    links: [{ label: "ILOP on GitHub", href: "https://github.com/johnlennyt5/ILOP", kind: "repo" }],
    metrics: [],
    diagram: "ilop",
    caseStudy: {
      problem:
        "Loan and mortgage requests arrive by email in every format. Intake is manual and slow, and it is bound by fair-lending rules, so a lender cannot hand the decision to a model and hope for the best.",
      constraints: [
        "Lending decisions fall under fair-lending rules, which govern denials and the data a decision may use.",
        "Model output is non-deterministic, and every decision still has to be explainable and auditable.",
        "Synthetic documents and borrowers only, for a fictional bank.",
      ],
      decisions: [
        {
          title: "Deterministic orchestration, non-deterministic reasoning",
          detail:
            "Maestro BPMN orchestrates the flow, and AI agents do the reading: an intake router, a loan extractor, a mortgage extractor and a compliance agent.",
        },
        {
          title: "Confidence-gated routing",
          detail:
            "The intake router labels each request LOAN, MORTGAGE or OTHER and routes it only at a confidence of 0.75 or higher. The loan extractor pulls 24 fields and the mortgage extractor about 55 URLA fields.",
        },
        {
          title: "Where AI deliberately is not",
          detail:
            "Risk scoring is deterministic code instead of a model, so the score behind a lending decision can be explained and reproduced.",
        },
        {
          title: "Email in, queued work",
          detail:
            "An Integration Service Gmail trigger picks up each request and downloads its attachments, and Document Understanding reads the documents. The work moves through 7 Orchestrator queues.",
        },
        {
          title: "People where judgment matters",
          detail:
            "Requests that need judgment go to a person as an Action Center task instead of being decided automatically.",
        },
      ],
      tradeoffs: [
        "LLM extraction where the documents vary, deterministic code where a decision has to be explained.",
        "Agent evaluation sets are small for now: quick to run, but thin as evidence.",
      ],
      whatBroke: [
        {
          title: "Evaluations are thin",
          detail:
            "Each agent has an LLM-judge evaluator and a trajectory evaluator configured, but the evaluation sets are still small. Growing them is the next step.",
        },
      ],
      results: [
        "A BPMN flow from a Gmail trigger through classification, extraction and compliance to an Action Center review task, across 7 Orchestrator queues.",
        "Configured agent evaluations: an LLM-judge evaluator and a trajectory evaluator on each agent.",
        "Built solo, starting in July 2026, and still in progress. The repository is public.",
      ],
      tests: [
        "Agent evaluations with an LLM judge and a trajectory evaluator per agent.",
        "No unit test suite or CI: it is a UiPath solution.",
      ],
      caveats: [
        "Still in progress: the approval and adverse-action emails at the end of the flow are placeholders.",
        "Robot-identity governance and Data Fabric logging are designed, not built.",
        "Fictional bank, synthetic borrowers and synthetic documents.",
      ],
    },
  },
  {
    slug: "truckwhat",
    name: "truckWhat",
    tagline: "Logistics marketplace, web and mobile",
    role: "Founder and solo engineer",
    team: "solo",
    dates: { start: "2026-01", end: null, label: "Jan 2026 to present" },
    identities: ["fullstack"],
    order: 3,
    featured: true,
    stack: [
      "Next.js",
      "TypeScript",
      "React",
      "Prisma",
      "PostgreSQL (Supabase)",
      "Supabase Auth, Realtime and Storage",
      "Stripe Connect",
      "Plaid",
      "Twilio",
      "Firebase Cloud Messaging",
      "Google Maps Platform and Routes API",
      "Gemini API",
      "React Native and Expo",
      "TanStack Query",
      "Vitest",
      "Jest and React Native Testing Library",
      "GitHub Actions",
    ],
    oneLiner:
      "My own startup: a trucking marketplace where shippers post loads and drivers haul them, with live tracking and payouts across a web app and a mobile app I am building solo.",
    summary:
      "truckWhat is a web and mobile logistics marketplace with live tracking, an offline GPS outbox, face-match identity checks and a 3D load viewer. It moves money and stores sensitive data, so it ships behind 800+ Vitest and 350+ Jest tests, 200+ row-level security policies and a closed-out security review.",
    links: [],
    linkNote: "The repositories are private. I am happy to walk through the code live.",
    metrics: [
      { value: "730+", label: "commits, all mine", evidence: "tw-commits" },
      { value: "800+", label: "Vitest tests on web", evidence: "tw-vitest" },
      { value: "350+", label: "Jest tests on mobile", evidence: "tw-jest" },
      { value: "200+", label: "row-level security policies", evidence: "tw-rls" },
      { value: "12+", label: "Stripe webhook event types", evidence: "tw-webhooks" },
      { value: "28", label: "security findings closed", evidence: "tw-findings" },
    ],
    diagram: "truckwhat",
    caseStudy: {
      problem:
        "Freight still runs on phone calls, paperwork and trust. Shippers need to know where a load is and that it arrived. Drivers need to get paid quickly. Both sides need to know who they are dealing with. That means live tracking, identity checks and money movement in one product, on the web and in a driver's pocket.",
      constraints: [
        "One founder building a web app, a mobile app and the Supabase backend behind them.",
        "It moves money and stores sensitive personal and financial data, such as bank tokens and license details, so security cannot wait for later.",
        "Drivers lose signal on the road, so tracking has to survive dead zones.",
        "There is no QA team. The CI gate is the QA team.",
      ],
      decisions: [
        {
          title: "One Supabase core for both apps",
          detail:
            "Both apps sit on Supabase: the web app through Next.js and Prisma on PostgreSQL, the mobile app through React Native, Expo and TanStack Query. Supabase handles auth, realtime and storage, and private files are served through signed URLs.",
        },
        {
          title: "Security enforced in the database",
          detail:
            "200+ row-level security policies enforce access in Postgres itself, not only in the app. Plaid bank tokens are encrypted with AES-256-GCM under a versioned key, admins sign in with TOTP MFA, and incoming webhooks are signature-verified.",
        },
        {
          title: "Event-driven money",
          detail:
            "Stripe Connect handles payments and payouts, Plaid Link connects bank accounts, and a webhook handler covers 12+ Stripe event types: payment intents, refunds, disputes, payouts and Connect account updates.",
        },
        {
          title: "Tracking that survives dead zones",
          detail:
            "On mobile, GPS fixes wait in an offline outbox when a driver loses signal and are sent when the connection returns. Supabase Realtime powers live tracking, dispatch and messaging.",
        },
        {
          title: "Trust and planning tools",
          detail:
            "A face-match identity check verifies drivers, and a 3D load viewer lets people inspect a load visually.",
        },
        {
          title: "Monitoring built in-house",
          detail:
            "Instead of a paid service, I built error capture that groups errors by fingerprint, alerts admins in the app, opens or reopens GitHub Issues automatically, scrubs personal data and secrets, and rate-limits alerts. It replaced console-only logging in 482 error handlers.",
        },
      ],
      tradeoffs: [
        "In-house monitoring means more code to own, in exchange for keeping personal data inside the platform and alerts landing where I already work.",
        "A role-based admin portal with 4 admin roles and an audit-log viewer, instead of ad hoc database access for support work.",
      ],
      whatBroke: [
        {
          title: "Imports hit the transaction timeout",
          detail:
            "A data import made 500 separate database round trips inside one transaction and ran into the 5 second transaction timeout. I replaced the round trips with one bulk write per batch.",
        },
        {
          title: "Dashboards that waited in line",
          detail:
            "Some pages ran independent queries one after another and loaded whole histories just to count them. I moved the reads into parallel batches, pushed counting into database aggregates and removed N+1 queries.",
        },
        {
          title: "Errors nobody saw",
          detail:
            "Server errors were logged to the console and nowhere else, so problems stayed invisible until someone reported them. That gap is why the monitoring pipeline exists.",
        },
        {
          title: "What the security review found",
          detail:
            "A source-level security review turned up 28 findings, including cross-tenant access, unauthenticated admin endpoints, SQL injection, SSRF and secrets in git history. I closed all 28 and mapped the controls to the SOC 2 Trust Services Criteria.",
        },
      ],
      results: [
        "730+ commits across the web and mobile apps, built with Claude Code as a daily tool.",
        "800+ Vitest and 350+ Jest automated tests run on every push.",
        "2 CI workflows plus 1 scheduled cron workflow in GitHub Actions.",
        "A role-based admin portal with user management, verification review, disputes, support tickets and an audit-log viewer.",
      ],
      tests: [
        "Vitest on the web app (800+ tests).",
        "Jest and React Native Testing Library on mobile (350+ tests), with a coverage script.",
        "Web CI gate on every push: Prisma schema validation, type check, lint and tests.",
        "Mobile CI gate: type check, Jest, Expo doctor and an iOS bundle compile.",
      ],
      caveats: [
        "In development since January 2026, and still in progress.",
        "Accessibility practices are built in (ARIA, alt text, keyboard handling), but there has been no formal accessibility audit.",
        "The repositories are private, so there is no public link.",
      ],
    },
  },
  {
    slug: "smartfit-metrics",
    name: "SmartFit Metrics",
    tagline: "Gym membership app, co-founded",
    role: "Co-founder and engineer (equity)",
    team: "co-founder",
    dates: { start: "2025-05", end: "2026-01", label: "May 2025 to Jan 2026" },
    identities: ["fullstack"],
    order: 4,
    featured: true,
    stack: ["React Native", "Expo and EAS", "Bun", "Hono", "Supabase", "Stripe"],
    oneLiner:
      "Co-founded a gym membership product and was one of its two engineers: a React Native app and a Bun and Hono API with Stripe checkout, live on the App Store and Google Play.",
    summary:
      "SmartFit Metrics began as Iron Clad Fitness. I was one of the two people who coded the entire product, built its Stripe membership checkout, and helped ship it to the App Store and Google Play as Ironclad Fitness RI.",
    links: [
      {
        label: "Ironclad Fitness RI on the App Store",
        href: "https://apps.apple.com/us/app/ironclad-fitness-ri/id6756619809",
        kind: "store",
      },
      {
        label: "Ironclad Fitness RI on Google Play",
        href: "https://play.google.com/store/apps/details?id=com.smartfitmetrics.ironcladfitness",
        kind: "store",
      },
      { label: "SmartFit Metrics website", href: "https://smartfitmetrics.com", kind: "site" },
    ],
    metrics: [],
    caseStudy: {
      problem:
        "Gym owners juggle too many tools to sign members up, bill them and keep them coming back. The first product had to let a gym sell memberships and get paid, from a phone.",
      constraints: [
        "Two engineers building the entire product.",
        "Membership payments inside the mobile app.",
        "One codebase for both the App Store and Google Play.",
      ],
      decisions: [
        {
          title: "Stripe membership checkout",
          detail: "I built the membership checkout in the app and the Stripe integration in the backend.",
        },
        {
          title: "A small TypeScript API",
          detail: "A Bun and Hono API on Supabase backs the app.",
        },
        {
          title: "Expo and EAS for both stores",
          detail: "React Native with Expo and EAS build and submit profiles ships one codebase to iOS and Android.",
        },
      ],
      tradeoffs: [
        "I stepped back from day-to-day development. My partner now runs the company and its development full time, and I still hold equity.",
      ],
      whatBroke: [],
      results: [
        "Live on the Apple App Store as Ironclad Fitness RI, released in January 2026, and on Google Play.",
        "Stripe membership checkout in the app, backed by the Stripe integration I built in the API.",
      ],
      tests: [],
      caveats: [
        "The current feature set on the SmartFit Metrics website includes work done after I stepped back from day-to-day development.",
        "The code repositories are private.",
      ],
    },
  },
  {
    slug: "eve",
    name: "Eve",
    tagline: "AI avatar keynote speaker and interview coach",
    role: "Engineer, wrote most of the app",
    team: "team",
    dates: { start: "2025-09", end: "2026-01", label: "Sep 2025 to Jan 2026" },
    identities: ["automation"],
    order: 5,
    featured: true,
    stack: [
      "LiveAvatar (HeyGen) streaming avatars",
      "Playwright browser automation",
    ],
    oneLiner:
      "Eve is an AI digital human that gave the opening keynote at Bryant University's IDEA 2026 in January 2026, running on an app that also coaches people through interviews.",
    summary:
      "I built most of the app behind Eve: a streaming AI avatar with a keynote mode for IDEA 2026, plus an interview coach with 7 industry coaches and company research injected as context.",
    links: [
      { label: "IDEA 2026 at Bryant University", href: "https://events.bryant.edu/event/idea-2026", kind: "event" },
    ],
    linkNote: "The repository is private.",
    metrics: [{ value: "7", label: "industry interview coaches", evidence: "eve-coaches" }],
    caseStudy: {
      problem:
        "Bryant University's IDEA program is a design-thinking experience for first-year and transfer students, and it opens with a keynote. The idea: have an AI digital human deliver that keynote, then let students practice customer interviews with AI personas during the program.",
      constraints: [
        "The same app had to serve both a keynote on stage and open-ended interview practice.",
      ],
      decisions: [
        {
          title: "A keynote mode for the stage",
          detail:
            "The app has a keynote mode that streams the digital human for the opening address, alongside its practice modes.",
        },
        {
          title: "Context before conversation",
          detail:
            "The interview coach injects company research as context, so practice questions fit the company and the role. I also added Playwright browser automation to the app.",
        },
        {
          title: "Personas for design thinking",
          detail:
            "A customer-interview mode lets students question AI personas, the way IDEA's design challenge asks them to interview real customers.",
        },
      ],
      tradeoffs: [
        "Built on a hosted streaming avatar platform (LiveAvatar, from HeyGen) instead of a custom renderer.",
      ],
      whatBroke: [],
      results: [
        "Eve gave the opening keynote at Bryant University's IDEA 2026 in January 2026.",
        "An interview coach with 7 industry coaches and company-research context.",
      ],
      tests: [],
      caveats: [
        "Most of the commits are mine; teammates contributed the rest.",
        "The repository is private, and no public recording of the keynote is linked here.",
      ],
    },
  },
  {
    slug: "yconic",
    name: "yconic",
    tagline: "AI Startup Evaluation Platform, with a team",
    role: "Engineer on the yconic team",
    team: "team",
    dates: { start: "2025-09", end: "2025-10", label: "2025" },
    identities: ["automation"],
    order: 6,
    featured: false,
    stack: [
      "AI agents",
      "Model Context Protocol (team)",
      "Salesforce through MCP (team)",
      "Google Calendar API",
      "Gmail",
      "Slack",
      "Stripe",
    ],
    oneLiner:
      "With the yconic team, built AI agents that take in a startup's data and return a uniqueness score, a sentiment analysis score and written feedback.",
    summary:
      "yconic's evaluation agent reads a startup's signals from email, Slack, payments, CRM, calendars and social media. My part was the rubric scoring service and the agent's Google Calendar tool.",
    links: [{ label: "yconic", href: "https://yconic.ai", kind: "site" }],
    linkNote: "The repositories belong to the team and are not public.",
    metrics: [],
    caseStudy: {
      problem:
        "Evaluating an early-stage startup means reading scattered signals: email, Slack, payments, CRM records, calendars and social media. yconic wanted an agent that reads those sources and gives founders a consistent, written evaluation.",
      constraints: [
        "A team build with shared ownership of the agent and its tools.",
      ],
      decisions: [
        {
          title: "Rubric scoring as its own service",
          detail:
            "I built the rubric scoring service that grades communication on sentiment, tone and clarity, so every startup is scored against the same rubric.",
        },
        {
          title: "One tool per data source",
          detail:
            "The agent pulls from Gmail, Slack, Stripe, Salesforce (through MCP), Google Calendar and social media. I built the Google Calendar tool.",
        },
      ],
      tradeoffs: ["Scores always come with written feedback, not a number on its own."],
      whatBroke: [],
      results: [
        "Agents that give each startup a uniqueness score, a sentiment analysis score and a written response.",
      ],
      tests: [],
      caveats: [
        "A team project: the MCP wiring, the RAG mentor service and most commits belong to teammates.",
        "The hackathon win listed under awards was for a separate yconic team entry, a CFO agent.",
      ],
    },
  },
  {
    slug: "parameter-golf",
    name: "OpenAI Parameter Golf",
    tagline: "Small language models under a 16 MB limit",
    role: "Solo entrant",
    team: "solo",
    dates: { start: "2026-04", end: "2026-04", label: "Apr 2026" },
    identities: ["automation"],
    order: 7,
    featured: false,
    stack: ["Python", "PyTorch", "Mamba-2", "GPTQ", "FlashAttention", "RunPod GPUs"],
    oneLiner:
      "Trained small language models to fit a 16 MB artifact limit. My entry was the first Mamba (state-space model) submission: a hybrid of about 27M parameters in a 7.3 MB artifact.",
    summary:
      "OpenAI's Parameter Golf challenge asks how good a language model can be inside a 16 MB artifact. I entered a Mamba-2 and attention hybrid with mixed-precision GPTQ quantization, backed by 115 tests, and have an open pull request to the challenge repo.",
    links: [
      { label: "My parameter-golf fork", href: "https://github.com/johnlennyt5/parameter-golf", kind: "repo" },
      {
        label: "Open pull request #1382",
        href: "https://github.com/openai/parameter-golf/pull/1382",
        kind: "pr",
      },
    ],
    metrics: [
      { value: "16 MB", label: "artifact limit", evidence: "pg-limit" },
      { value: "27M", label: "parameters, about", evidence: "pg-params" },
      { value: "7.3 MB", label: "compressed artifact", evidence: "pg-artifact" },
      { value: "115", label: "unit and integration tests", evidence: "pg-tests" },
    ],
    caseStudy: {
      problem:
        "The challenge: train the best language model you can, scored on held-out text, when the whole artifact has to fit in 16 MB.",
      constraints: [
        "A hard 16 MB artifact limit.",
        "Training runs on rented GPUs, so every experiment costs time and money.",
      ],
      decisions: [
        {
          title: "A state-space hybrid",
          detail:
            "Mamba-2 state-space layers with a few grouped-query attention layers, the first Mamba entry in the challenge.",
        },
        {
          title: "Squeezing the bits",
          detail:
            "Full Hessian-based GPTQ with mixed precision from int5 to int7, LZMA and zlib compression, magnitude pruning and depth recurrence.",
        },
        {
          title: "Tested like software",
          detail:
            "115 unit and integration tests plus deployment scripts for RunPod GPUs, so experiments are repeatable.",
        },
      ],
      tradeoffs: ["Quantization depth traded against model quality to stay under the limit."],
      whatBroke: [],
      results: [
        "Open pull request #1382 to openai/parameter-golf.",
        "OpenAI awarded me GPU compute credits to keep testing.",
      ],
      tests: ["115 unit and integration tests."],
      caveats: [
        "The pull request is open, not merged, and I make no claim about leaderboard rank.",
        "Python and PyTorch here are project work, built with Claude Code.",
      ],
    },
  },
];

export const projectSlugs: ProjectSlug[] = projects.map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects: Project[] = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

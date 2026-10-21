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
      "pnpm and Turborepo monorepo",
      "Supabase (Postgres, Auth, Edge Functions)",
      "Row-level security",
      "pgTAP",
      "Vitest",
      "GitHub Actions",
      "Anthropic API (opt-in)",
      "UiPath Studio",
      "UiPath Orchestrator API",
      "Maestro BPMN",
    ],
    oneLiner:
      "Migrates Blue Prism automations into UiPath without recoding them by hand, built for banks whose source exports can never leave the building.",
    summary:
      "PrismShift parses Blue Prism releases in the browser, grades every process, and generates UiPath projects plus a Maestro BPMN pipeline ready for Orchestrator. The server only ever sees metadata, and tenant isolation is proven in CI with 75 pgTAP assertions.",
    links: [],
    linkNote: "The repository is private. I am happy to walk through the code live.",
    metrics: [
      { value: "214", label: "commits, all mine", evidence: "ps-commits" },
      { value: "75", label: "pgTAP isolation assertions in CI", evidence: "ps-pgtap" },
    ],
    diagram: "prismshift",
    caseStudy: {
      problem:
        "Banks that want to leave Blue Prism face a rewrite: every process has to be rebuilt by hand in UiPath. The exports that hold that logic also carry credential references, internal hostnames and business rules, so most bank security teams will not let them be uploaded to a vendor tool at all.",
      constraints: [
        "Source exports may not be uploaded anywhere. Parsing, analysis and conversion have to run on the analyst's own machine.",
        "The output has to open, compile and run in real UiPath tooling, not just look plausible in a diff.",
        "There is no access to the bank's target applications, so UI selectors cannot be verified automatically.",
        "Enterprise reviewers need evidence before they say yes: tenant isolation, an audit trail, retention rules and a threat model.",
        "A solo build, July to August 2026.",
      ],
      decisions: [
        {
          title: "Browser-first pipeline",
          detail:
            "All parsing, analysis and conversion run client-side in a Web Worker. The server only receives metadata, and runtime guards backed by tests reject anything that carries source values, so the privacy promise is enforced in code rather than in a policy document.",
        },
        {
          title: "A vendor-neutral intermediate representation",
          detail:
            "Blue Prism releases parse into a graph IR that knows nothing about either vendor. Rules, scoring, summaries and the UiPath transformer all read the IR. I proved the boundary by adding an Automation Anywhere parser: the downstream pipeline ran unchanged.",
        },
        {
          title: "Grades before conversion",
          detail:
            "Pure-function analysis rules across security, reliability, maintainability and compliance grade each process from A to F, so a migration team can triage the estate before converting anything.",
        },
        {
          title: "Tenant isolation proven, not promised",
          detail:
            "Row-level security is on every table from the first migration. A dedicated CI job runs 75 pgTAP assertions on every push: cross-workspace reads denied, role gates enforced, and the audit log immutable even for admins.",
        },
        {
          title: "AI that is opt-in and redacted",
          detail:
            "Narrative summaries can use the Anthropic API, but only through an Edge Function proxy that receives a redacted digest, enforces per-workspace rate limits, caps request size and checks the calling origin.",
        },
        {
          title: "Evidence-only activity shapes",
          detail:
            "Generated UiPath activities are built from official templates and assembly metadata, never from memory. That rule caught a typo in UiPath's own documentation that would not have compiled.",
        },
      ],
      tradeoffs: [
        "Assisted conversion with a punch list instead of a promise of fully automatic conversion. Anything uncertain goes to a human with a validation checklist.",
        "Every UI selector is flagged for human validation, because there is no live target application to test against.",
        "A batch human-review gate today, with per-item review left for later.",
        "A Local Mode with no account trades team features for zero data leaving the browser.",
      ],
      whatBroke: [
        {
          title: "Every decision branch went missing",
          detail:
            "Blue Prism stores the true and false branches of a decision differently from ordinary links, and the parser was silently dropping them in every real release. Work chains detached and queue-driven processes ran only once. Fixing the parser reconnected the chains.",
        },
        {
          title: "A pipeline that deployed but would not start",
          detail:
            "The generated Maestro BPMN deployed cleanly and then could not start a single job. The causes were layered: solution-scoped keys, binding handles and folder resolution all had to be right before Orchestrator would run it.",
        },
        {
          title: "Code bodies flattened by XML",
          detail:
            "Invoke Code bodies came out mangled because XML attribute normalization turns newlines into spaces. The lesson I kept: read the emitted XAML, not only the test report.",
        },
        {
          title: "A catch that swallowed everything",
          detail: "The first generated scaffold had a catch block that swallowed every failure. Now failures surface.",
        },
        {
          title: "Green tests, broken build",
          detail:
            "Type errors hid behind passing Vitest runs until I added the full build as a CI gate next to lint and test.",
        },
      ],
      results: [
        "Converts Blue Prism releases into UiPath projects plus a Maestro BPMN pipeline, with a migration report and a punch list for what needs a human.",
        "Tenant isolation proven by 75 pgTAP assertions on every push, in a CI pipeline that also runs lint, tests and a full build.",
        "A STRIDE threat model and an infosec approval pack written for enterprise reviewers.",
        "Client-side AES-GCM encrypted artifacts whose key never reaches the database, an immutable audit log, and retention with purge for erasure requests.",
        "214 commits, all mine.",
      ],
      tests: [
        "Vitest suites in every package of the monorepo.",
        "pgTAP suite for row-level security, workspace RPCs and artifacts, run in its own CI job (75 assertions).",
        "Golden answer-key regression suite on a synthetic corpus: CI fails on a missed finding and on a false positive.",
      ],
      caveats: [
        "Built and tested on synthetic samples and public Blue Prism releases, not on a bank's production estate.",
        "Conversion is assisted: selectors and anything uncertain go to a human punch list.",
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
    dates: { start: "2026-07", end: "2026-07", label: "Jul 2026" },
    identities: ["automation"],
    order: 2,
    featured: true,
    stack: [
      "UiPath Maestro (BPMN)",
      "UiPath Agent Builder",
      "Agent evaluations",
      "Integration Service (Gmail trigger)",
      "Document Understanding",
      "Action Center",
      "Orchestrator queues",
      "UiPath Studio",
    ],
    oneLiner:
      "Loan and mortgage requests arrive by email; a BPMN process routes them through AI agents for classification, extraction and compliance, and sends anything uncertain to a person in Action Center.",
    summary:
      "ILOP is an agentic intake flow for a fictional bank. BPMN owns every routing decision, agents only return schema-checked JSON with a confidence score, and the default path out of every gateway is the safe one: triage or human review.",
    links: [{ label: "ILOP on GitHub", href: "https://github.com/johnlennyt5/ILOP", kind: "repo" }],
    metrics: [],
    diagram: "ilop",
    caseStudy: {
      problem:
        "Loan and mortgage requests arrive by email in every format. Intake is manual and slow, and it is bound by fair-lending rules, so a lender cannot hand the decision to a model and hope for the best.",
      constraints: [
        "Fair-lending law (ECOA and Regulation B) governs denials and the data a decision may use.",
        "Model output is non-deterministic, and every decision still has to be explainable and auditable.",
        "Synthetic documents and borrowers only, for a fictional bank.",
      ],
      decisions: [
        {
          title: "Deterministic orchestration, non-deterministic reasoning",
          detail:
            "BPMN owns routing and state. Agents only return schema-enforced JSON with a confidence score, and the default flow out of every gateway is the safe path: triage or human review, never an automatic decision.",
        },
        {
          title: "A hard veto that cannot be outvoted",
          detail:
            "The compliance agent returns veto codes. Any veto routes away from approval, and approval requires a pass plus score and confidence thresholds.",
        },
        {
          title: "Where AI deliberately is not",
          detail:
            "Adverse-action notices come from pre-approved reason-code templates instead of a model, because a denial must state specific, accurate reasons.",
        },
        {
          title: "Queue first, idempotent intake",
          detail:
            "Every email is queued before any agent touches it, keyed on the Gmail message id, so duplicate deliveries are rejected and every request has an audit record.",
        },
        {
          title: "One governance backbone",
          detail:
            "Separate loan and mortgage extractors feed one shared compliance and disposition path, so adding a product means one routing edge and one extractor.",
        },
        {
          title: "People where judgment matters",
          detail:
            "Uncertain or borderline requests suspend the process on an Action Center task, and a human disposition resumes it.",
        },
      ],
      tradeoffs: [
        "Low-confidence requests go to a triage queue for now, until per-item human review is wired in.",
        "Agents are kept tool-less, which limits what they can do but makes them easier to evaluate.",
        "One shared compliance backbone instead of product-specific rules.",
      ],
      whatBroke: [
        {
          title: "The first design did not survive",
          detail:
            "An earlier mortgage-only, file-drop design was replaced after the first sprint by the email-triggered flow that handles both products.",
        },
        {
          title: "Evaluations are thin",
          detail:
            "Each agent has an LLM-judge evaluator and a trajectory evaluator configured, but the evaluation sets are still small. Growing them is the next step.",
        },
      ],
      results: [
        "An end-to-end BPMN flow from a Gmail trigger through classification, extraction, compliance and disposition routing to an Action Center review task.",
        "Configured agent evaluations: an LLM-judge output evaluator and a trajectory evaluator on each agent.",
        "Built solo in July 2026. The repository is public.",
      ],
      tests: [
        "Agent evaluations with an LLM judge and a trajectory evaluator per agent.",
        "No unit test suite or CI: it is a UiPath solution.",
      ],
      caveats: [
        "Robot-identity governance and Data Fabric logging are designed, not built.",
        "The approval, adverse-action and logging steps at the end of the flow are placeholders.",
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
      "My own startup: a trucking marketplace where shippers post loads and drivers haul them, with live tracking, proof of delivery and payouts across a web app and a mobile app I am building solo.",
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
        "One founder building a web app, a mobile app and the backend they share.",
        "It moves money and stores sensitive personal and financial data, such as bank tokens and license details, so security cannot wait for later.",
        "Drivers lose signal on the road, so tracking has to survive dead zones.",
        "There is no QA team. The CI gate is the QA team.",
      ],
      decisions: [
        {
          title: "One backend for both apps",
          detail:
            "Next.js API routes over Prisma and PostgreSQL on Supabase serve both the web app and the React Native app, with Supabase Auth, Realtime and Storage shared by both. Private files are served through signed URLs.",
        },
        {
          title: "Security enforced in the database",
          detail:
            "Postgres row-level security backs every request with 200+ policies. Plaid bank tokens are encrypted with AES-256-GCM under a versioned key, admins sign in with TOTP MFA, and incoming webhooks are signature-verified.",
        },
        {
          title: "Event-driven money",
          detail:
            "Stripe Connect handles payments and payouts, Plaid Link connects bank accounts, and a webhook handler covers 12+ Stripe event types: payment intents, refunds, disputes, payouts and Connect account updates.",
        },
        {
          title: "Tracking that survives dead zones",
          detail:
            "On mobile, GPS fixes go into an offline outbox when a driver loses signal and post in batches when the connection returns. Supabase Realtime powers live tracking, dispatch and messaging.",
        },
        {
          title: "Trust and planning tools",
          detail:
            "A face-match identity check verifies drivers, and a 3D load viewer helps plan how freight fits in a trailer.",
        },
        {
          title: "Monitoring built in-house",
          detail:
            "Instead of a paid service, I built error capture that groups errors by fingerprint, alerts admins in the app, opens or reopens GitHub Issues automatically, scrubs personal data and secrets, and rate-limits alerts. It replaced console-only logging in 482 error handlers.",
        },
      ],
      tradeoffs: [
        "In-house monitoring means more code to own, in exchange for keeping personal data inside the platform and alerts landing where I already work.",
        "Unit tests mock Prisma and Supabase so CI runs fast with no database, with the tradeoff that database behavior is not exercised by the unit suite.",
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
            "Stats pages ran independent queries one after another and loaded whole histories just to count them. I moved the reads into parallel batches, pushed counting into database aggregates and removed N+1 queries.",
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
        "Vitest on the web app (800+ tests), with Prisma and Supabase mocked.",
        "Jest and React Native Testing Library on mobile (350+ tests), with a coverage script.",
        "Web CI gate on every push: Prisma schema validation, type check, lint and tests.",
        "Mobile CI gate: type check, Jest, Expo doctor and an iOS bundle compile.",
      ],
      caveats: [
        "In development since January 2026, with most of the commit activity in September 2026.",
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
    stack: ["React Native", "Expo and EAS", "TypeScript", "Bun", "Hono", "Supabase", "Stripe"],
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
        "Stripe membership checkout in production.",
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
      "Next.js",
      "TypeScript",
      "LiveAvatar (HeyGen) streaming avatars",
      "OpenAI API",
      "Supabase",
      "Playwright",
      "Zod",
      "Tailwind CSS",
    ],
    oneLiner:
      "Eve is an AI digital human that gave the opening keynote at Bryant University's IDEA 2026 in January 2026, running on an app that also coaches people through interviews.",
    summary:
      "I built most of the app behind Eve: a streaming AI avatar with a presentation view for the IDEA 2026 keynote, plus an interview coach with 7 industry coaches, voice and text chat, and company research injected as context.",
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
          title: "A presentation view for the stage",
          detail:
            "I built a dedicated presentation view for the keynote, with mute and toggle controls, on top of a streaming digital human.",
        },
        {
          title: "Context before conversation",
          detail:
            "The interview coach researches a company with Playwright browser automation and injects what it finds as context, so practice questions fit the company and the role.",
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
        "An interview coach with 7 industry coaches, voice and text chat, and company-research context.",
      ],
      tests: [],
      caveats: [
        "Most of the commits are mine; teammates contributed smaller fixes and Docker support.",
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
      "TypeScript",
      "Node.js",
      "Express",
      "OpenAI API",
      "Model Context Protocol (team)",
      "MongoDB",
      "Gmail API",
      "Google Calendar API",
      "Slack API",
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

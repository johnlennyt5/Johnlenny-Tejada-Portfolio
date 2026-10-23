import type { Identity } from "./types";

/**
 * Two identities, in this order. Mid level framing only.
 * The business background is a supporting angle (see community.ts `beyondCode`), not a third identity.
 */
export const identities: Identity[] = [
  {
    id: "automation",
    rank: "primary",
    title: "Automation and AI engineer",
    pitch:
      "I build UiPath automations and agentic workflows that turn manual, multi-step processes into exception-only work, with people in the loop where the stakes call for it.",
    proof: [
      "At HumanixOS, an unattended UiPath import bot took a 3-hour manual import to zero-touch, and automated nonprofit verification cut approval turnaround from 5 days to under 2 hours.",
      "PrismShift migrates Blue Prism automations into UiPath, with tenant isolation proven in CI.",
      "ILOP, still in progress, orchestrates loan and mortgage intake agents on UiPath Maestro with a compliance agent and human review in Action Center.",
    ],
    projects: ["prismshift", "ilop", "eve", "yconic", "parameter-golf"],
  },
  {
    id: "fullstack",
    rank: "secondary",
    title: "Full-stack TypeScript engineer",
    pitch:
      "I ship tested, secure products end to end: Next.js and React Native front ends, Node and Postgres back ends, payments, CI and security review.",
    proof: [
      "truckWhat runs 800+ Vitest and 350+ Jest tests on every push and enforces 200+ row-level security policies.",
      "SmartFit Metrics, which I helped build as one of its two engineers, is live on the App Store and Google Play.",
      "A security review on truckWhat closed 28 findings.",
    ],
    projects: ["truckwhat", "smartfit-metrics", "prismshift"],
  },
];

export const primaryIdentity = identities[0] as Identity;
export const secondaryIdentity = identities[1] as Identity;

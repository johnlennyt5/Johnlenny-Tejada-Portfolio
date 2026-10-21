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
      "UiPath robots at HumanixOS took a 3-hour manual import to zero-touch and cut an approval cycle from 5 days to under 2 hours.",
      "PrismShift migrates Blue Prism automations into UiPath, with tenant isolation proven in CI.",
      "ILOP orchestrates loan intake agents on UiPath Maestro with a hard compliance veto and human review in Action Center.",
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
      "SmartFit Metrics, which I co-founded, is live on the App Store and Google Play.",
      "A security review on truckWhat closed 28 findings.",
    ],
    projects: ["truckwhat", "smartfit-metrics", "prismshift"],
  },
];

export const primaryIdentity = identities[0] as Identity;
export const secondaryIdentity = identities[1] as Identity;

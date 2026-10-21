import { Diagram, type Cell, type DiagramProps, type DiagramSpec } from "./engine";

const clusters = [
  ["c-identity", "Identity and accounts"],
  ["c-carriers", "Carriers and drivers"],
  ["c-shippers", "Shippers and businesses"],
  ["c-fleets", "Fleets"],
  ["c-loads", "Loads and shipments"],
  ["c-tracking", "Live tracking"],
  ["c-pod", "Proof of delivery"],
  ["c-money", "Payments and payouts"],
  ["c-trust", "Ratings and disputes"],
  ["c-places", "Places and facilities"],
  ["c-compliance", "Driver compliance"],
  ["c-team", "Team driving"],
  ["c-messaging", "Messaging and notifications"],
  ["c-support", "Support and operations"],
  ["c-analytics", "Analytics"],
] as const;

const services = [
  ["s-stripe", "Stripe Connect", "payments, payouts, 12+ webhook events"],
  ["s-plaid", "Plaid Link", "bank tokens, AES-256-GCM"],
  ["s-notify", "Twilio and FCM", "SMS and push"],
  ["s-maps", "Google Maps Platform", "maps and Routes API"],
  ["s-ai", "Gemini API", "AI features"],
] as const;

function placeAll<T extends readonly (readonly [string, ...string[]])[]>(
  items: T,
  cell: (index: number) => Cell,
): Record<string, Cell> {
  const out: Record<string, Cell> = {};
  items.forEach((item, i) => {
    out[item[0]] = cell(i);
  });
  return out;
}

export const truckWhatSpec: DiagramSpec = {
  title: "truckWhat architecture",
  description:
    "A Next.js web app and a React Native mobile app share one backend of Next.js API routes. The API reads and writes PostgreSQL on Supabase through Prisma, with row-level security, across domain areas from identity to analytics. Supabase also provides auth, realtime and storage. Stripe Connect, Plaid, Twilio, Firebase push, Google Maps and Gemini are integrated services. GitHub Actions runs the CI gates and scheduled jobs, and in-house monitoring opens GitHub Issues.",
  nodes: [
    { id: "web", label: "Web app", sub: "Next.js PWA" },
    { id: "mobile", label: "Mobile app", sub: "React Native and Expo" },
    { id: "api", label: "Next.js API routes", sub: "one backend for web and mobile" },
    { id: "supabase", label: "Supabase", sub: "auth, realtime, storage" },
    ...clusters.map(([id, label]) => ({ id, label, kind: "cluster" as const })),
    ...services.map(([id, label, sub]) => ({ id, label, sub, kind: "external" as const })),
    { id: "ci", label: "GitHub Actions", sub: "2 CI gates and 1 cron workflow" },
    { id: "monitor", label: "In-house monitoring", sub: "grouped errors, admin alerts, GitHub Issues" },
  ],
  groups: [
    { id: "data", label: "PostgreSQL on Supabase via Prisma, 200+ row-level security policies" },
    { id: "services", label: "Integrations", dashed: true },
  ],
  edges: [
    { from: "web", to: "api" },
    { from: "mobile", to: "api" },
    { from: "api", to: "supabase" },
    { from: "api", to: "data" },
    { from: "api", to: "services" },
  ],
  wide: {
    cols: 12,
    colWidth: 64,
    colGap: 12,
    rowHeights: [56, 56, 26, 48, 48, 48, 48, 48, 56],
    rowGap: 22,
    pad: 30,
    fontSize: 13,
    place: {
      web: [0, 0, 4],
      mobile: [5, 0, 4],
      api: [0, 1, 9],
      supabase: [9, 1, 3],
      data: [0, 2, 9, 6],
      services: [9, 2, 3, 6],
      ...placeAll(clusters, (i) => [(i % 3) * 3, 3 + Math.floor(i / 3), 3]),
      ...placeAll(services, (i) => [9, 3 + i, 3]),
      ci: [0, 8, 6],
      monitor: [6, 8, 6],
    },
  },
  tall: {
    cols: 4,
    colWidth: 70,
    colGap: 10,
    rowHeights: [52, 52, 40, 44, 44, 44, 44, 44, 44, 44, 44, 52, 30, 52, 52, 52, 52, 52],
    rowGap: 16,
    pad: 24,
    fontSize: 13,
    place: {
      web: [0, 0, 2],
      mobile: [2, 0, 2],
      api: [0, 1, 4],
      data: [0, 2, 4, 9],
      ...placeAll(clusters, (i) => [(i % 2) * 2, 3 + Math.floor(i / 2), i === clusters.length - 1 ? 4 : 2]),
      supabase: [0, 11, 4],
      services: [0, 12, 4, 4],
      ...placeAll(services, (i) => [(i % 2) * 2, 13 + Math.floor(i / 2), i === services.length - 1 ? 4 : 2]),
      ci: [0, 16, 4],
      monitor: [0, 17, 4],
    },
    routes: {
      "api>supabase": { rail: "right" },
      "api>services": { rail: "left" },
    },
  },
};

/** truckWhat architecture: clients, one API, Postgres domains, integrations, CI and monitoring. */
export function TruckWhatDiagram(props: DiagramProps) {
  return <Diagram spec={truckWhatSpec} {...props} />;
}

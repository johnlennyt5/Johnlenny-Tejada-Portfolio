import { Diagram, type DiagramProps, type DiagramSpec } from "./engine";

export const prismShiftSpec: DiagramSpec = {
  title: "PrismShift pipeline",
  description:
    "Inside the browser, a Blue Prism release, or an Automation Anywhere bot through an adapter, is parsed in a Web Worker into a vendor-neutral intermediate representation. Analysis rules grade each process from A to F, and the transformer generates a UiPath project plus a Maestro BPMN pipeline with a migration report. Only metadata leaves the browser, to Supabase with row-level security and an immutable audit log. An optional AI summary goes through a rate-limited proxy that only receives a redacted digest. A command line tool deploys the result to UiPath Orchestrator.",
  nodes: [
    { id: "release", label: "Blue Prism release", sub: ".bprelease export" },
    { id: "aa", label: "Automation Anywhere bot", sub: "adapter, same IR", kind: "external" },
    { id: "parse", label: "Parser", sub: "Web Worker" },
    { id: "ir", label: "Vendor-neutral IR", sub: "process graph" },
    { id: "rules", label: "Analysis rules", sub: "grades A to F" },
    { id: "gen", label: "UiPath project + Maestro BPMN", sub: "report and punch list" },
    { id: "supa", label: "Supabase", sub: "metadata only, RLS, immutable audit log", kind: "store" },
    { id: "llm", label: "LLM proxy", sub: "opt-in, redacted, rate limited", kind: "agent" },
    { id: "orch", label: "Orchestrator", sub: "queues, assets, deploy" },
  ],
  groups: [{ id: "browser", label: "In the browser: source never leaves the machine", dashed: true }],
  edges: [
    { from: "release", to: "parse" },
    { from: "aa", to: "parse" },
    { from: "parse", to: "ir" },
    { from: "ir", to: "rules" },
    { from: "rules", to: "gen" },
    { from: "rules", to: "supa", label: "metadata only", dashed: true },
    { from: "rules", to: "llm", label: "redacted digest", dashed: true },
    { from: "gen", to: "orch", label: "CLI deploy" },
  ],
  wide: {
    cols: 14,
    colWidth: 52,
    colGap: 12,
    rowHeights: [24, 70, 56, 70],
    rowGap: 30,
    pad: 38,
    fontSize: 12,
    place: {
      browser: [0, 0, 14, 3],
      release: [0, 1, 2],
      parse: [3, 1, 2],
      ir: [6, 1, 2],
      rules: [9, 1, 2],
      gen: [12, 1, 2],
      aa: [0, 2, 2],
      supa: [3, 3, 5],
      llm: [9, 3, 2],
      orch: [12, 3, 2],
    },
    routes: {
      "aa>parse": { fromSide: "right", toSide: "bottom" },
      "rules>supa": { labelAt: 0.55 },
      "rules>llm": { labelAt: 0.75 },
    },
  },
  tall: {
    cols: 4,
    colWidth: 70,
    colGap: 10,
    rowHeights: [36, 56, 52, 52, 52, 56, 64, 52],
    rowGap: 22,
    pad: 24,
    fontSize: 13,
    place: {
      browser: [0, 0, 4, 6],
      release: [0, 1, 2],
      aa: [2, 1, 2],
      parse: [0, 2, 4],
      ir: [0, 3, 4],
      rules: [0, 4, 4],
      gen: [0, 5, 4],
      supa: [0, 6, 2],
      llm: [2, 6, 2],
      orch: [0, 7, 4],
    },
    routes: {
      "rules>supa": { rail: "left", labelAt: 0.5 },
      "rules>llm": { rail: "right", labelAt: 0.5 },
    },
  },
};

/** PrismShift: Blue Prism release to parser, IR, graded analysis, UiPath project and BPMN, Orchestrator. */
export function PrismShiftDiagram(props: DiagramProps) {
  return <Diagram spec={prismShiftSpec} {...props} />;
}

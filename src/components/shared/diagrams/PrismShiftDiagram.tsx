import { Diagram, type DiagramProps, type DiagramSpec } from "./engine";

export const prismShiftSpec: DiagramSpec = {
  title: "PrismShift pipeline",
  description:
    "Inside the browser, a Blue Prism release export is parsed client-side in a Web Worker, and a golden answer-key corpus of synthetic releases runs through the same parser in CI. 14 analysis rules check each process, and the converter generates UiPath REFramework projects, Maestro BPMN for human-review steps and a migration report with an effort estimate. Redaction guards check everything that leaves the browser. Supabase stores workspace data with row-level security and an immutable audit log, and AI calls go through an LLM proxy with per-workspace rate limits and origin restrictions. Deployment to UiPath Orchestrator goes through its OData API.",
  nodes: [
    { id: "release", label: "Blue Prism release", sub: ".bprelease export" },
    { id: "aa", label: "Answer-key corpus", sub: "synthetic releases, CI", kind: "external" },
    { id: "parse", label: "Parser", sub: "Web Worker" },
    { id: "ir", label: "Parsed processes", sub: "stages, client-side" },
    { id: "rules", label: "Analysis rules", sub: "14 rules" },
    { id: "gen", label: "UiPath projects + Maestro BPMN", sub: "migration report, effort estimate" },
    { id: "supa", label: "Supabase", sub: "RLS, immutable audit log", kind: "store" },
    { id: "llm", label: "LLM proxy", sub: "rate limited, origin checked", kind: "agent" },
    { id: "orch", label: "Orchestrator", sub: "queues, assets, OData deploy" },
  ],
  groups: [{ id: "browser", label: "In the browser: parsed client-side", dashed: true }],
  edges: [
    { from: "release", to: "parse" },
    { from: "aa", to: "parse" },
    { from: "parse", to: "ir" },
    { from: "ir", to: "rules" },
    { from: "rules", to: "gen" },
    { from: "rules", to: "supa", label: "redaction guard", dashed: true },
    { from: "rules", to: "llm", label: "redaction guard", dashed: true },
    { from: "gen", to: "orch", label: "OData API" },
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

/** PrismShift: Blue Prism release to client-side parser, analysis rules, UiPath projects and BPMN, Orchestrator. */
export function PrismShiftDiagram(props: DiagramProps) {
  return <Diagram spec={prismShiftSpec} {...props} />;
}

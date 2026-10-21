/**
 * A tiny grid-based diagram renderer for architecture and BPMN-style figures.
 *
 * Every diagram is described once (nodes, groups, edges) and placed twice:
 * a "wide" layout for normal columns and a "tall" layout for phones or narrow columns.
 * The wrapper is a CSS container, so the switch follows the column width, not the viewport.
 *
 * Theming: all colors and fonts come from CSS variables with safe fallbacks.
 *   --dg-bg        background behind edge labels (default: transparent page color)
 *   --dg-fg        main text and strokes            (default: currentColor)
 *   --dg-muted     secondary text                   (default: currentColor)
 *   --dg-line      edges and group borders          (default: currentColor)
 *   --dg-node      node fill                        (default: transparent)
 *   --dg-node-stroke node border                    (default: currentColor)
 *   --dg-accent    AI agents and highlights         (default: currentColor)
 *   --dg-accent-2  people in the loop, secondary    (default: currentColor)
 *   --dg-group     group fill                       (default: transparent)
 *   --dg-font      label font                       (default: inherit)
 *   --dg-mono      small caps and edge labels font  (default: monospace)
 * No element ids are used, so a diagram can appear several times on one page.
 */

import type { ReactElement } from "react";

export type NodeKind = "box" | "agent" | "human" | "event" | "end" | "gateway" | "store" | "cluster" | "external";
export type Side = "top" | "bottom" | "left" | "right";

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  kind?: NodeKind;
}

export interface DiagramGroup {
  id: string;
  label: string;
  /** Dashed boundary (trust boundary) vs solid. */
  dashed?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

/** [col, row, colSpan = 1, rowSpan = 1] in grid units. */
export type Cell = readonly [number, number, number?, number?];

export interface EdgeRoute {
  fromSide?: Side;
  toSide?: Side;
  /** Route along a vertical rail at the left or right edge of the canvas. */
  rail?: "left" | "right";
  /** Where to put the label along the path, 0 to 1. */
  labelAt?: number;
}

export interface DiagramLayout {
  cols: number;
  colWidth: number;
  colGap: number;
  rowHeights: number[];
  rowGap: number;
  pad: number;
  fontSize: number;
  place: Record<string, Cell>;
  /** Optional per-edge routing, keyed "from>to". */
  routes?: Record<string, EdgeRoute>;
}

export interface DiagramSpec {
  title: string;
  description: string;
  nodes: DiagramNode[];
  groups?: DiagramGroup[];
  edges: DiagramEdge[];
  wide: DiagramLayout;
  tall: DiagramLayout;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function rowTop(layout: DiagramLayout, row: number): number {
  let y = layout.pad;
  for (let r = 0; r < row; r += 1) y += (layout.rowHeights[r] ?? 0) + layout.rowGap;
  return y;
}

function cellRect(layout: DiagramLayout, cell: Cell): Rect {
  const [col, row, colSpan = 1, rowSpan = 1] = cell;
  const x = layout.pad + col * (layout.colWidth + layout.colGap);
  const w = colSpan * layout.colWidth + (colSpan - 1) * layout.colGap;
  const y = rowTop(layout, row);
  let h = 0;
  for (let r = row; r < row + rowSpan; r += 1) h += layout.rowHeights[r] ?? 0;
  h += (rowSpan - 1) * layout.rowGap;
  return { x, y, w, h };
}

function canvasSize(layout: DiagramLayout): { width: number; height: number } {
  const width = layout.pad * 2 + layout.cols * layout.colWidth + (layout.cols - 1) * layout.colGap;
  const rows = layout.rowHeights.length;
  const height = rowTop(layout, rows) - layout.rowGap + layout.pad;
  return { width, height };
}

function wrap(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function anchor(r: Rect, side: Side): { x: number; y: number } {
  switch (side) {
    case "top":
      return { x: r.x + r.w / 2, y: r.y };
    case "bottom":
      return { x: r.x + r.w / 2, y: r.y + r.h };
    case "left":
      return { x: r.x, y: r.y + r.h / 2 };
    case "right":
      return { x: r.x + r.w, y: r.y + r.h / 2 };
  }
}

function autoSides(a: Rect, b: Rect): [Side, Side] {
  if (b.y >= a.y + a.h) return ["bottom", "top"];
  if (b.y + b.h <= a.y) return ["top", "bottom"];
  if (b.x >= a.x + a.w) return ["right", "left"];
  return ["left", "right"];
}

type Pt = { x: number; y: number };

function routePoints(a: Rect, b: Rect, route: EdgeRoute | undefined, layout: DiagramLayout, width: number): Pt[] {
  if (route?.rail) {
    const side: Side = route.rail === "left" ? "left" : "right";
    const p1 = anchor(a, side);
    const p2 = anchor(b, side);
    const railX = route.rail === "left" ? layout.pad / 2 : width - layout.pad / 2;
    return [p1, { x: railX, y: p1.y }, { x: railX, y: p2.y }, p2];
  }
  const [autoFrom, autoTo] = autoSides(a, b);
  const fromSide = route?.fromSide ?? autoFrom;
  const toSide = route?.toSide ?? autoTo;
  const p1 = anchor(a, fromSide);
  const p2 = anchor(b, toSide);
  const fromVertical = fromSide === "top" || fromSide === "bottom";
  const toVertical = toSide === "top" || toSide === "bottom";
  if (fromVertical && toVertical) {
    if (Math.abs(p1.x - p2.x) < 0.5) return [p1, p2];
    const midY = (p1.y + p2.y) / 2;
    return [p1, { x: p1.x, y: midY }, { x: p2.x, y: midY }, p2];
  }
  if (!fromVertical && !toVertical) {
    if (Math.abs(p1.y - p2.y) < 0.5) return [p1, p2];
    const midX = (p1.x + p2.x) / 2;
    return [p1, { x: midX, y: p1.y }, { x: midX, y: p2.y }, p2];
  }
  if (!fromVertical && toVertical) return [p1, { x: p2.x, y: p1.y }, p2];
  return [p1, { x: p1.x, y: p2.y }, p2];
}

function pointAt(points: Pt[], t: number): Pt {
  const segs: { a: Pt; b: Pt; len: number }[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i] as Pt;
    const b = points[i + 1] as Pt;
    const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    segs.push({ a, b, len });
    total += len;
  }
  let target = total * t;
  for (const s of segs) {
    if (target <= s.len) {
      const k = s.len === 0 ? 0 : target / s.len;
      return { x: s.a.x + (s.b.x - s.a.x) * k, y: s.a.y + (s.b.y - s.a.y) * k };
    }
    target -= s.len;
  }
  return points[points.length - 1] as Pt;
}

function arrowHead(points: Pt[], size: number): string {
  const end = points[points.length - 1] as Pt;
  const prev = points[points.length - 2] as Pt;
  const dx = Math.sign(end.x - prev.x);
  const dy = Math.sign(end.y - prev.y);
  // Perpendicular for the two back corners.
  const px = -dy;
  const py = dx;
  const bx = end.x - dx * size;
  const by = end.y - dy * size;
  const c1 = `${bx + px * size * 0.55},${by + py * size * 0.55}`;
  const c2 = `${bx - px * size * 0.55},${by - py * size * 0.55}`;
  return `${end.x},${end.y} ${c1} ${c2}`;
}

function NodeShape({ node, r, fontSize }: { node: DiagramNode; r: Rect; fontSize: number }): ReactElement {
  const kind = node.kind ?? "box";
  const charW = fontSize * 0.56;
  const innerW = kind === "gateway" ? r.w * 0.62 : r.w - 16;
  const maxChars = Math.max(6, Math.floor(innerW / charW));
  const lines = wrap(node.label, maxChars);
  const subSize = Math.round(fontSize * 0.82);
  const subLines = node.sub ? wrap(node.sub, Math.max(6, Math.floor(innerW / (subSize * 0.56)))) : [];
  const lh = fontSize * 1.22;
  const slh = subSize * 1.22;
  const blockH = lines.length * lh + subLines.length * slh;
  const cx = r.x + r.w / 2;
  let y = r.y + r.h / 2 - blockH / 2 + fontSize * 0.9;

  let shape: ReactElement;
  if (kind === "gateway") {
    const pts = `${cx},${r.y} ${r.x + r.w},${r.y + r.h / 2} ${cx},${r.y + r.h} ${r.x},${r.y + r.h / 2}`;
    shape = <polygon className="jt-dg-node" data-kind={kind} points={pts} />;
  } else {
    const rx = kind === "event" || kind === "end" ? r.h / 2 : kind === "external" ? 2 : 6;
    shape = <rect className="jt-dg-node" data-kind={kind} x={r.x} y={r.y} width={r.w} height={r.h} rx={rx} />;
  }

  const badge = kind === "agent" ? "AI" : kind === "human" ? "HUMAN" : null;

  return (
    <g>
      {shape}
      {badge ? (
        <text
          className={`jt-dg-badge jt-dg-badge-${kind}`}
          x={r.x + r.w - 6}
          y={r.y + subSize + 2}
          textAnchor="end"
          fontSize={subSize * 0.85}
        >
          {badge}
        </text>
      ) : null}
      {lines.map((line, i) => {
        const ty = y;
        y += lh;
        return (
          <text key={`l${i}`} className="jt-dg-label" x={cx} y={ty} textAnchor="middle" fontSize={fontSize}>
            {line}
          </text>
        );
      })}
      {subLines.map((line, i) => {
        const ty = y;
        y += slh;
        return (
          <text key={`s${i}`} className="jt-dg-sub" x={cx} y={ty} textAnchor="middle" fontSize={subSize}>
            {line}
          </text>
        );
      })}
    </g>
  );
}

function DiagramSvg({ spec, layout, className }: { spec: DiagramSpec; layout: DiagramLayout; className: string }) {
  const { width, height } = canvasSize(layout);
  const rects = new Map<string, Rect>();
  for (const [id, cell] of Object.entries(layout.place)) rects.set(id, cellRect(layout, cell));
  const fs = layout.fontSize;

  return (
    <svg
      className={`jt-dg ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={`${spec.title}. ${spec.description}`}
    >
      <title>{spec.title}</title>
      <desc>{spec.description}</desc>
      {(spec.groups ?? []).map((g) => {
        const r = rects.get(g.id);
        if (!r) return null;
        return (
          <g key={g.id}>
            <rect
              className="jt-dg-group"
              data-dashed={g.dashed ? "true" : undefined}
              x={r.x - 8}
              y={r.y - 4}
              width={r.w + 16}
              height={r.h + 8}
              rx={10}
            />
            {wrap(g.label, Math.floor((r.w - 8) / (fs * 0.62))).map((line, i) => (
              <text
                key={i}
                className="jt-dg-group-label"
                x={r.x + 2}
                y={r.y + fs + 4 + i * fs * 1.2}
                fontSize={fs * 0.86}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
      {spec.edges.map((e) => {
        const a = rects.get(e.from);
        const b = rects.get(e.to);
        if (!a || !b) return null;
        const route = layout.routes?.[`${e.from}>${e.to}`];
        const pts = routePoints(a, b, route, layout, width);
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
        const labelPt = e.label ? pointAt(pts, route?.labelAt ?? 0.5) : null;
        const labelSize = Math.round(fs * 0.78);
        const labelW = e.label ? e.label.length * labelSize * 0.62 + 10 : 0;
        return (
          <g key={`${e.from}>${e.to}`}>
            <path className="jt-dg-edge" data-dashed={e.dashed ? "true" : undefined} d={d} />
            <polygon className="jt-dg-arrow" points={arrowHead(pts, 7)} />
            {labelPt && e.label ? (
              <g>
                <rect
                  className="jt-dg-edge-label-bg"
                  x={labelPt.x - labelW / 2}
                  y={labelPt.y - labelSize * 0.8}
                  width={labelW}
                  height={labelSize * 1.5}
                  rx={3}
                />
                <text
                  className="jt-dg-edge-label"
                  x={labelPt.x}
                  y={labelPt.y + labelSize * 0.32}
                  textAnchor="middle"
                  fontSize={labelSize}
                >
                  {e.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
      {spec.nodes.map((n) => {
        const r = rects.get(n.id);
        if (!r) return null;
        return <NodeShape key={n.id} node={n} r={r} fontSize={fs} />;
      })}
    </svg>
  );
}

export interface DiagramProps {
  className?: string;
  /** Force one layout instead of switching on container width. */
  layout?: "auto" | "wide" | "tall";
  /** Optional visible caption, e.g. "Fig. 1". Rendered in a figcaption. */
  caption?: string;
}

/**
 * Renders a spec as a figure. With layout="auto" both SVGs are in the markup and
 * CSS (globals.css, .jt-diagram rules) shows one based on the container width.
 */
export function Diagram({ spec, className, layout = "auto", caption }: DiagramProps & { spec: DiagramSpec }) {
  return (
    <figure className={`jt-diagram${className ? ` ${className}` : ""}`} data-layout={layout}>
      {layout !== "tall" ? <DiagramSvg spec={spec} layout={spec.wide} className="jt-diagram-wide" /> : null}
      {layout !== "wide" ? <DiagramSvg spec={spec} layout={spec.tall} className="jt-diagram-tall" /> : null}
      {caption ? <figcaption className="jt-diagram-caption">{caption}</figcaption> : null}
    </figure>
  );
}

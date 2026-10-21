"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Arch } from "./ProjectMedia";

interface Wire {
  key: string;
  d: string;
  active: boolean;
}

/**
 * Rows of nodes, ordered so each edge points down where it can (longest path from the
 * sources, ignoring edges that close a cycle). Wires are drawn in an SVG from the real
 * button positions, so they follow any wrap or resize. Clicking a node lights its wires.
 */
function layer(arch: Arch): string[][] {
  const ids = arch.nodes.map((n) => n.id);
  const out = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const [a, b] of arch.edges) out.get(a)?.push(b);

  // Drop edges that close a cycle (found by DFS), so the rest is a DAG.
  const state = new Map<string, 0 | 1 | 2>();
  const keep: [string, string][] = [];
  const visit = (id: string) => {
    state.set(id, 1);
    for (const to of out.get(id) ?? []) {
      if (state.get(to) === 1) continue;
      keep.push([id, to]);
      if (!state.get(to)) visit(to);
    }
    state.set(id, 2);
  };
  for (const id of ids) if (!state.get(id)) visit(id);

  const depth = new Map<string, number>(ids.map((id) => [id, 0]));
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false;
    for (const [a, b] of keep) {
      const next = (depth.get(a) ?? 0) + 1;
      if (next > (depth.get(b) ?? 0)) {
        depth.set(b, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const rows: string[][] = [];
  for (const id of ids) {
    const d = depth.get(id) ?? 0;
    (rows[d] ??= []).push(id);
  }
  return rows.filter(Boolean);
}

export function ArchDiagram({ arch, node, onSelect }: { arch: Arch; node: string | null; onSelect: (id: string) => void }) {
  const rows = useMemo(() => layer(arch), [arch]);
  const box = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLButtonElement>());
  const [wires, setWires] = useState<Wire[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const uid = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;
    const draw = () => {
      const r = root.getBoundingClientRect();
      if (!r.width) return;
      const at = (id: string) => {
        const b = els.current.get(id)?.getBoundingClientRect();
        return b ? { x: b.left - r.left + b.width / 2, top: b.top - r.top, bottom: b.bottom - r.top, left: b.left - r.left, right: b.right - r.left, mid: b.top - r.top + b.height / 2 } : null;
      };
      const next: Wire[] = [];
      for (const [a, b] of arch.edges) {
        const p = at(a);
        const q = at(b);
        if (!p || !q) continue;
        let d: string;
        if (q.top >= p.bottom - 1) {
          const k = (q.top - p.bottom) / 2;
          d = `M${p.x},${p.bottom} C${p.x},${p.bottom + k} ${q.x},${q.top - k} ${q.x},${q.top}`;
        } else if (p.top >= q.bottom - 1) {
          const k = (p.top - q.bottom) / 2;
          d = `M${p.x},${p.top} C${p.x},${p.top - k} ${q.x},${q.bottom + k} ${q.x},${q.bottom}`;
        } else {
          // Same row: side to side.
          const [x1, x2] = p.x < q.x ? [p.right, q.left] : [p.left, q.right];
          const k = (x2 - x1) / 2;
          d = `M${x1},${p.mid} C${x1 + k},${p.mid} ${x2 - k},${q.mid} ${x2},${q.mid}`;
        }
        next.push({ key: `${a}-${b}`, d, active: a === node || b === node });
      }
      setWires(next);
      setSize({ w: root.scrollWidth, h: root.scrollHeight });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(root);
    return () => ro.disconnect();
  }, [arch, node, rows]);

  return (
    <div className="arch-flow" ref={box}>
      <svg className="arch-wires" width={size.w} height={size.h} aria-hidden="true">
        <defs>
          {["", "-on"].map((v) => (
            <marker key={v} id={`${uid}-arrow${v}`} className={`arrow${v}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" />
            </marker>
          ))}
        </defs>
        {wires
          .slice()
          .sort((x, y) => Number(x.active) - Number(y.active))
          .map((w) => (
            <path key={w.key} d={w.d} className={w.active ? "wire is-active" : "wire"} markerEnd={`url(#${uid}-arrow${w.active ? "-on" : ""})`} />
          ))}
      </svg>
      {rows.map((row, i) => (
        <div className="arch-row" key={i}>
          {row.map((id) => {
            const n = arch.nodes.find((x) => x.id === id)!;
            return (
              <button
                key={id}
                ref={(el) => {
                  if (el) els.current.set(id, el);
                  else els.current.delete(id);
                }}
                type="button"
                className="arch-node"
                aria-pressed={node === id}
                onClick={() => onSelect(id)}
              >
                <b>{n.label}</b>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

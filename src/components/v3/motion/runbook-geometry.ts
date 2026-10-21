/* Geometry for the runbook state machine, shared by the static diagram and the live stage. */

export interface RunbookStep {
  title: string;
  detail: string;
  source: string;
}

/** A 520 by 560 canvas: a zigzag of six activities. */
export const W = 520;
export const H = 560;
export const BOX_W = 236;
/** The connector enters each box near its right end, so the parked token never covers the label. */
export const PORT_X = 92;
export const BOX_H = 70;
export const CENTERS: [number, number][] = [
  [130, 92],
  [390, 92],
  [390, 252],
  [130, 252],
  [130, 412],
  [390, 412],
];
export const START: [number, number] = [130 + PORT_X, 22];
export const END: [number, number] = [390 + PORT_X, 528];

export const stepNum = (i: number) => String(i + 1).padStart(2, "0");

/** The connector's points for n activities, from the start event to the end event. */
export function connectorPoints(n: number): [number, number][] {
  return [START, ...CENTERS.slice(0, n).map(([x, y]): [number, number] => [x + PORT_X, y]), END];
}

export function pathData(points: [number, number][]): string {
  return `M${points.map(([x, y]) => `${x} ${y}`).join(" L")}`;
}

export function polyline(points: [number, number][]) {
  const cum = [0];
  for (let i = 1; i < points.length; i += 1) {
    const [ax, ay] = points[i - 1] as [number, number];
    const [bx, by] = points[i] as [number, number];
    cum.push((cum[i - 1] as number) + Math.hypot(bx - ax, by - ay));
  }
  const total = cum[cum.length - 1] as number;
  const at = (d: number): [number, number] => {
    const t = Math.max(0, Math.min(total, d));
    for (let i = 1; i < points.length; i += 1) {
      const c1 = cum[i] as number;
      if (t <= c1) {
        const c0 = cum[i - 1] as number;
        const [ax, ay] = points[i - 1] as [number, number];
        const [bx, by] = points[i] as [number, number];
        const k = c1 === c0 ? 0 : (t - c0) / (c1 - c0);
        return [ax + (bx - ax) * k, ay + (by - ay) * k];
      }
    }
    return points[points.length - 1] as [number, number];
  };
  return { cum, total, at };
}

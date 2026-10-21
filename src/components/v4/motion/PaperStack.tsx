import type { CSSProperties, ReactNode } from "react";

/**
 * The work as a pile of paper. On tall desktop screens every sheet is sticky, so each new
 * sheet slides over the last one and the sheets underneath sink back a little.
 * On phones and short screens it is a plain list of sheets that settle as they arrive.
 *
 * Server components: every movement is a CSS scroll-driven animation (.v4-stack and .v4-sheet
 * in theme.css). The arrival animates `translate` and `rotate`, the sink animates `scale`, so
 * the two never fight over one property. Reduced motion, the motion toggle and browsers
 * without scroll timelines get each sheet lying still at its resting tilt.
 */
export function PaperStack({ total, children, label }: { total: number; children: ReactNode; label: string }) {
  return (
    <ol className="v4-stack m-0 p-0" aria-label={label} style={{ "--n": total } as CSSProperties}>
      {children}
    </ol>
  );
}

export interface StackSheetProps {
  index: number;
  /** Resting tilt in degrees. */
  tilt?: number;
  /** Number of sheets, for how far the lower sheets sink. */
  total?: number;
  children: ReactNode;
}

export function StackSheet({ index, tilt = 0, total = 1, children }: StackSheetProps) {
  const depth = Math.max(0, total - 1 - index);
  const style = {
    "--i": index,
    "--tilt": `${tilt}deg`,
    "--tilt-from": `${tilt * 4}deg`,
    "--sink": 1 - depth * 0.028,
    "--sink-start": `${Math.min(99, (index / Math.max(1, total)) * 100)}%`,
  } as CSSProperties;
  return (
    <li style={style}>
      <div className="v4-sheet">{children}</div>
    </li>
  );
}

import type { CSSProperties } from "react";

/**
 * A bar that starts as long as the "before" bar and shrinks to its "after" length as it
 * scrolls into view: the manual work collapsing as the robot takes over.
 * Server rendered: a CSS scroll-driven animation (scaleX only). Static final state: the "after" length.
 */
export function ShrinkBar({ to, className }: { to: number; className?: string }) {
  return (
    <span className="v3-shrink block w-full" aria-hidden="true" style={{ "--to": to } as CSSProperties}>
      <span className={`v3-bar block ${className ?? ""}`} />
    </span>
  );
}

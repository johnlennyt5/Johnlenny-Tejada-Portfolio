import type { ReactNode } from "react";

export type NodeShape = "activity" | "event";

export interface NodeProps {
  id: string;
  /** Two-digit queue number, for example "03". */
  index: string;
  /** Short activity label, for example "Job queue". */
  label: string;
  /** BPMN activity type shown next to the label, for example "Sequence". */
  kind?: string;
  shape?: NodeShape;
  /** The section heading, rendered inside the node header (must carry id `${id}-title`). */
  heading: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * One activity on the canvas. Server rendered, no client code of its own:
 * - it rises and settles into place as it scrolls in (a CSS scroll-driven animation on its own
 *   view timeline, transform only; text stays at full opacity so contrast never drops);
 * - its rail marker fills and its status chip reads queued > running > done. The state is a
 *   data-run attribute written by the page's one CanvasDriver; the chip text comes from CSS.
 * Static final state (server HTML, reduced motion, motion off): in place and "done".
 */
export function Node({ id, index, label, kind, shape = "activity", heading, children, className }: NodeProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`v3-node${className ? ` ${className}` : ""}`} data-v3-node="">
      <span className="v3-marker" data-shape={shape === "event" ? "event" : "activity"} aria-hidden="true">
        <span data-state="queued" />
        <span data-state="done" />
      </span>
      <div className="v3-node-body">
        <div className="v3-node-head">
          <span className="v3-activity">
            <span>{index}</span>
            <span>{label}</span>
            {kind ? <b>{kind}</b> : null}
          </span>
          <span className="v3-pill v3-node-pill" aria-hidden="true">
            <span className="v3-dot" />
          </span>
        </div>
        {heading}
        {children}
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

export interface FlowProps {
  children: ReactNode;
  className?: string;
  /** Text inside the bot token. */
  token?: string;
}

/**
 * The BPMN canvas. A dashed "queued" connector runs down the left edge; a solid green connector
 * draws over it as you scroll and the JT bot token rides its tip.
 * Server rendered, no JavaScript: both are CSS scroll-driven animations on the canvas's view
 * timeline (transform only, so they run off the main thread). Static final state (reduced motion,
 * motion off, browsers without view timelines): connector fully drawn, no token.
 */
export function Flow({ children, className, token = "JT" }: FlowProps) {
  return (
    <div className={`v3-flow${className ? ` ${className}` : ""}`}>
      <div className="v3-rail" aria-hidden="true">
        <div className="v3-rail-base" />
        <div className="v3-rail-fill" />
        <div className="v3-token-track">
          <div className="v3-token">{token}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

import type { CSSProperties, ReactNode } from "react";

export interface SettleProps {
  children: ReactNode;
  className?: string;
  /** Rotation (deg) while the paper enters from below. */
  from?: number;
  /** Rotation (deg) at rest, mid screen. Also the static state under reduced motion. */
  rest?: number;
  /** Rotation (deg) as it leaves at the top. */
  to?: number;
  /** Vertical drift in px, enter to leave. */
  drift?: number;
}

/**
 * Paper settling on a desk: as it crosses the viewport the artifact turns from `from`
 * through `rest` to `to` and drifts up. Transform only.
 *
 * A server component: the motion is a CSS scroll-driven animation (animation-timeline: view(),
 * see .v4-settle in theme.css), so it costs no JavaScript, no hydration and no scroll listener.
 * Browsers without scroll timelines, reduced motion and the motion toggle all get the paper
 * lying still at `rest`.
 */
export function Settle({ children, className, from = -3, rest = 0, to = 2, drift = 40 }: SettleProps) {
  const style = {
    "--settle-from": `${from}deg`,
    "--settle-rest": `${rest}deg`,
    "--settle-to": `${to}deg`,
    "--settle-drift": `${drift}px`,
  } as CSSProperties;
  return (
    <div className={className ? `v4-settle ${className}` : "v4-settle"} style={style}>
      {children}
    </div>
  );
}

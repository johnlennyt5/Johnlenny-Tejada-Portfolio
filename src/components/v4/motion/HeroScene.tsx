import type { CSSProperties, ReactNode } from "react";

/**
 * The hero desk. It names a view timeline (--v4-hero in theme.css) that runs from the hero's
 * top reaching the top of the screen to its bottom leaving it; its paper layers follow it.
 * A server component: the parallax is a CSS scroll-driven animation, so the hero (and the
 * polaroid inside it) ships no JavaScript and never waits for hydration.
 */
export function HeroScene({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className ? `v4-hero-scene ${className}` : "v4-hero-scene"}>{children}</div>;
}

export interface LayerProps {
  children: ReactNode;
  className?: string;
  /** px moved by the time the hero has scrolled away. Negative rises faster than the page. */
  y?: number;
  /** [start, end] rotation in degrees. The start value is the static state. */
  rotate?: [number, number];
  /** [start, end] horizontal drift in px. */
  x?: [number, number];
}

/**
 * One sheet on the desk. Layers move at different speeds and turn a little,
 * so the desk separates into depth as the reader scrolls. Starts exactly at rest, so the first
 * paint is the finished desk. Reduced motion, the motion toggle and browsers without scroll
 * timelines: stays at rest.
 */
export function Layer({ children, className, y = 0, rotate = [0, 0], x = [0, 0] }: LayerProps) {
  const style = {
    "--layer-x0": `${x[0]}px`,
    "--layer-x1": `${x[1]}px`,
    "--layer-y1": `${y}px`,
    "--layer-r0": `${rotate[0]}deg`,
    "--layer-r1": `${rotate[1]}deg`,
  } as CSSProperties;
  return (
    <div className={className ? `v4-layer ${className}` : "v4-layer"} style={style}>
      {children}
    </div>
  );
}

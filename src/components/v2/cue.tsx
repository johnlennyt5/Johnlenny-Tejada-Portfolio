import type { CSSProperties, ReactNode } from "react";

/*
 * v2 scroll motion with zero JavaScript. Server components only.
 *
 *   Scene   a tall section with a sticky 100svh stage. It names a CSS view timeline
 *           (--v2-scene) that every Cue inside it reads.
 *   Cue     one element that moves with its scene's scroll progress: an "enter" leg
 *           (from an offset to rest) and/or an "exit" leg (from rest to an offset).
 *   Reveal  a fade and rise as the element enters the viewport (its own view timeline).
 *
 * theme.css binds the timelines only where scroll-driven animations are supported, the
 * screen is large enough to pin, and motion is allowed (OS setting and the site toggle).
 * Everywhere else nothing animates and the markup is the final state, so the hero headline
 * paints straight from the static HTML, before any script runs.
 */

export interface SceneProps {
  id?: string;
  /** Scene height in vh while pinned. */
  length?: number;
  labelledBy?: string;
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}

export function Scene({ id, length = 250, labelledBy, className = "", stageClassName = "", children }: SceneProps) {
  const style = { "--scene-len": `${length}vh` } as CSSProperties;
  return (
    <section id={id} aria-labelledby={labelledBy} className={`v2-scene v2-cssx ${className}`} style={style}>
      <div className={`v2-stage ${stageClassName}`}>{children}</div>
    </section>
  );
}

/** One leg of a cue: the scene progress window (0 to 1) and the offset at its far end. */
export interface Leg {
  at: [number, number];
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
}

type Tag = "div" | "li" | "p";

export interface CueProps {
  /** Moves from these values to rest across `at`. */
  enter?: Leg;
  /** Moves from rest to these values across `at`. */
  exit?: Leg;
  /**
   * "pinned" (default): only while the scene pins, read on the pinned range.
   * "always": whenever motion is allowed, across the whole time the scene is on screen.
   */
  when?: "pinned" | "always";
  as?: Tag;
  className?: string;
  style?: CSSProperties;
  decorative?: boolean;
  children?: ReactNode;
}

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

function legVars(prefix: "i" | "o", leg: Leg): Record<string, string | number> {
  const vars: Record<string, string | number> = {
    [`--${prefix}a`]: pct(leg.at[0]),
    [`--${prefix}b`]: pct(leg.at[1]),
  };
  if (leg.x !== undefined) vars[`--${prefix}x`] = `${leg.x}px`;
  if (leg.y !== undefined) vars[`--${prefix}y`] = `${leg.y}px`;
  if (leg.scale !== undefined) vars[`--${prefix}s`] = leg.scale;
  if (leg.opacity !== undefined) vars[`--${prefix}o`] = leg.opacity;
  return vars;
}

/** A leg that fades to nothing also stops taking clicks there (stacked beats overlap). */
const fades = (leg?: Leg) => leg?.opacity === 0;

/**
 * A scroll-linked element inside a Scene. With both legs it renders two nested elements
 * (enter on the outer, exit on the inner) because one CSS animation per property is
 * simplest to reason about.
 */
export function Cue({ enter, exit, when = "pinned", as = "div", className = "", style, decorative = false, children }: CueProps) {
  const Outer = as;
  const always = when === "always" ? "" : undefined;
  const hidden = decorative || undefined;

  if (enter && exit) {
    return (
      <Outer
        className={`v2-cue v2-cue-in ${className}`}
        data-fade={fades(enter) ? "" : undefined}
        data-always={always}
        aria-hidden={hidden}
        style={{ ...style, ...legVars("i", enter) } as CSSProperties}
      >
        <div className="v2-cue v2-cue-out" data-fade={fades(exit) ? "" : undefined} data-always={always} style={legVars("o", exit) as CSSProperties}>
          {children}
        </div>
      </Outer>
    );
  }

  const leg = enter ?? exit;
  const kind = enter ? "v2-cue-in" : exit ? "v2-cue-out" : "";
  return (
    <Outer
      className={`v2-cue ${kind} ${className}`}
      data-fade={fades(leg) ? "" : undefined}
      data-always={always}
      aria-hidden={hidden}
      style={{ ...style, ...(leg ? legVars(enter ? "i" : "o", leg) : {}) } as CSSProperties}
    >
      {children}
    </Outer>
  );
}

/**
 * Fade and rise as the element scrolls into view. Pure CSS (a view timeline), so the content
 * is visible in the static HTML and simply stays put where scroll timelines are unsupported
 * or motion is reduced. `delay` (seconds, as before) becomes a later start in the entry range.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: Tag;
  y?: number;
}) {
  const Tag = as;
  const style = { "--rv-y": `${y}px`, "--rv-d": `${Math.round(delay * 400)}px` } as CSSProperties;
  return (
    <Tag className={`v2-reveal ${className}`} style={style}>
      {children}
    </Tag>
  );
}

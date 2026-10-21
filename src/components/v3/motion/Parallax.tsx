import type { ReactNode } from "react";
import { HeroSkip } from "./HeroSkip";

/**
 * Hero stage: as the hero scrolls away, the terminal sinks back (lift and scale, text stays at
 * full opacity) while the oversized [JT] glyph behind it drifts at a slower rate.
 * Server rendered: both moves are CSS scroll-driven animations on the stage's view timeline.
 * The only client code is HeroSkip: any key press or tap skips the typing.
 */
export function HeroStage({
  children,
  backdrop,
  className,
}: {
  children: ReactNode;
  backdrop: ReactNode;
  className?: string;
}) {
  return (
    <div id="v3-hero-stage" className={`v3-hero-stage relative${className ? ` ${className}` : ""}`}>
      <div aria-hidden="true" className="v3-hero-back pointer-events-none absolute inset-0 overflow-hidden">
        {backdrop}
      </div>
      <div className="v3-hero-front relative">{children}</div>
      <HeroSkip targetId="v3-hero-stage" />
    </div>
  );
}

/** Page progress, a bar that fills with scaleX on the root scroll timeline (CSS only). Hidden without support or motion. */
export function ScrollProgress() {
  return (
    <div className="v3-progress" aria-hidden="true">
      <div />
    </div>
  );
}

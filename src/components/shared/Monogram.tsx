"use client";

import { m } from "framer-motion";
import { useId } from "react";
import {
  ACCENT,
  DEFAULT_DURATION,
  PAPER,
  SHARED_BAR,
  SHARED_J,
  strokesFor,
  type MonogramProps,
} from "./monogram-geometry";
import { useMotionPreference } from "./MotionToggle";

export type { MonogramProps, MonogramVariant } from "./monogram-geometry";

/**
 * The "JT" monogram. Each stroke draws on with pathLength. Under reduced motion
 * (OS setting or the site's motion toggle) it renders the finished mark immediately.
 * Colors: --mono-ink (strokes), --mono-paper (cut-out and fills), --mono-accent (glow, caret, seal letters).
 */
export function Monogram({
  variant = "editorial",
  size = 48,
  animate = true,
  delay = 0,
  duration,
  title = "Johnlenny Tejada",
  decorative = false,
  className,
}: MonogramProps) {
  const { reduced } = useMotionPreference();
  const rawId = useId();
  const filterId = `jt-glow-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const isStatic = !animate || reduced;
  const per = duration ?? DEFAULT_DURATION[variant];
  const strokes = strokesFor(variant);
  const dim = typeof size === "number" ? `${size}px` : size;

  // Cinematic draws outer and inner passes together.
  const orderOf = (i: number) => (variant === "cinematic" ? i % 2 : i);
  const total = strokes.reduce((acc, _s, i) => Math.max(acc, orderOf(i) + 1), 0);

  const paths = strokes.map((s, i) => (
    <m.path
      key={`${s.d}-${i}`}
      d={s.d}
      fill="none"
      style={{ stroke: s.color, strokeWidth: s.width, strokeLinecap: s.cap ?? "butt", strokeLinejoin: "miter" }}
      initial={isStatic ? false : { pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={
        isStatic
          ? { duration: 0 }
          : { duration: per, delay: delay + orderOf(i) * per, ease: [0.22, 1, 0.36, 1] }
      }
    />
  ));

  return (
    <svg
      className={`jt-monogram${className ? ` ${className}` : ""}`}
      data-variant={variant}
      data-static={isStatic ? "true" : "false"}
      viewBox="0 0 100 100"
      width={dim}
      height={dim}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      {variant === "cinematic" ? (
        <>
          <defs>
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          <m.g
            style={{ filter: `url(#${filterId})` }}
            initial={isStatic ? false : { opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={isStatic ? { duration: 0 } : { duration: 0.6, delay: delay + total * per }}
          >
            <path d={SHARED_BAR} fill="none" style={{ stroke: ACCENT, strokeWidth: 11, strokeLinecap: "round" }} />
            <path d={SHARED_J} fill="none" style={{ stroke: ACCENT, strokeWidth: 11, strokeLinecap: "round" }} />
          </m.g>
        </>
      ) : null}
      {variant === "seal" ? <circle cx="50" cy="50" r="39" style={{ fill: PAPER }} /> : null}
      {paths}
      {variant === "terminal" ? (
        <rect className="jt-caret" x="72" y="60" width="6" height="12" style={{ fill: ACCENT }} />
      ) : null}
    </svg>
  );
}

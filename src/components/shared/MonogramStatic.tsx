import { useId } from "react";
import { ACCENT, PAPER, SHARED_BAR, SHARED_J, strokesFor, type MonogramProps } from "./monogram-geometry";

export type MonogramStaticProps = Omit<MonogramProps, "animate" | "delay" | "duration">;

/**
 * The finished "JT" monogram with no draw-on. A server component: it ships no JavaScript and
 * does not pull framer-motion into the page, so use it wherever the mark never animates.
 * Renders the same SVG as `<Monogram animate={false} />`. Each stroke has pathLength 1, so a
 * version can draw it on in CSS (stroke-dasharray 1, stroke-dashoffset 1 to 0).
 */
export function MonogramStatic({
  variant = "editorial",
  size = 48,
  title = "Johnlenny Tejada",
  decorative = false,
  className,
}: MonogramStaticProps) {
  const rawId = useId();
  const filterId = `jt-glow-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const dim = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      className={`jt-monogram${className ? ` ${className}` : ""}`}
      data-variant={variant}
      data-static="true"
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
          <g style={{ filter: `url(#${filterId})`, opacity: 0.85 }}>
            <path d={SHARED_BAR} fill="none" style={{ stroke: ACCENT, strokeWidth: 11, strokeLinecap: "round" }} />
            <path d={SHARED_J} fill="none" style={{ stroke: ACCENT, strokeWidth: 11, strokeLinecap: "round" }} />
          </g>
        </>
      ) : null}
      {variant === "seal" ? <circle cx="50" cy="50" r="39" style={{ fill: PAPER }} /> : null}
      {strokesFor(variant).map((s, i) => (
        <path
          key={`${s.d}-${i}`}
          d={s.d}
          pathLength={1}
          fill="none"
          style={{ stroke: s.color, strokeWidth: s.width, strokeLinecap: s.cap ?? "butt", strokeLinejoin: "miter" }}
        />
      ))}
      {variant === "terminal" ? (
        <rect className="jt-caret" x="72" y="60" width="6" height="12" style={{ fill: ACCENT }} />
      ) : null}
    </svg>
  );
}

import type { CSSProperties } from "react";
import { MonogramStatic } from "@/components/shared/MonogramStatic";

export interface SealStampProps {
  size?: number | string;
  /** Degrees the seal turns over the whole page, like a barber pole. 0 to keep it still. */
  spin?: number;
  /** "load": stamps in on page load. "view": stamps as it scrolls into view. "none": no entrance. */
  trigger?: "load" | "view" | "none";
  /** Seconds before the "load" stamp. */
  delay?: number;
  className?: string;
  /** Accessible name. When omitted the seal is decorative. */
  title?: string;
}

/**
 * The JT seal (shared Monogram, "seal" variant) pressed onto the page like a shop stamp:
 * scale 1.15 to 1 in 250 ms, then it turns slowly with page progress.
 *
 * No JavaScript of its own: the stamp is a CSS animation and the turn is a CSS scroll-driven
 * animation on the page's scroll timeline (.v4-seal in theme.css). It used to be a client island
 * with a scroll listener and a spring per seal. Reduced motion, the motion toggle and browsers
 * without scroll timelines get the finished, still seal.
 */
export function SealStamp({ size = 120, spin = 90, trigger = "load", delay = 0, className, title }: SealStampProps) {
  const style = { "--seal-spin": `${spin}deg`, "--seal-delay": `${delay}s` } as CSSProperties;
  const classes = [
    "v4-seal",
    spin !== 0 ? "v4-seal-spin" : null,
    trigger === "load" ? "v4-seal-load" : trigger === "view" ? "v4-seal-view" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style}>
      <MonogramStatic variant="seal" size={size} decorative={!title} title={title} />
    </div>
  );
}

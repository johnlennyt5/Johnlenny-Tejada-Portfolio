/**
 * Monogram geometry and props, shared by the animated Monogram (client, framer-motion) and
 * MonogramStatic (server, no JavaScript). No React and no framer-motion here.
 */

export type MonogramVariant = "editorial" | "cinematic" | "terminal" | "seal";

export interface MonogramProps {
  variant?: MonogramVariant;
  /** Width and height. Number = px, string = any CSS length. Default 48. */
  size?: number | string;
  /** Play the draw-on animation. Always static when motion is reduced. Default true. */
  animate?: boolean;
  /** Seconds before the first stroke starts. */
  delay?: number;
  /** Seconds per stroke. Defaults per variant. */
  duration?: number;
  /** Accessible name. Ignored when `decorative`. */
  title?: string;
  /** Hide from assistive tech when the name is already next to it. */
  decorative?: boolean;
  className?: string;
}

/**
 * Stroke geometry on a 100 by 100 canvas.
 *   editorial: block JT sharing one stem (crossbar first, then the J hook)
 *   cinematic: same letterform, outlined, with a glow that fades in after the draw
 *   terminal:  [JT] brackets with a blinking caret
 *   seal:      the shared-stem JT inside a double ring, like a stamp
 */
export const SHARED_BAR = "M18 22 H82";
export const SHARED_J = "M50 22 V60 C50 75 42 83 31 83 C24 83 19 79 17 73";
const SEAL_BAR = "M30 33 H70";
const SEAL_J = "M50 33 V58 C50 67 45 72 38 72 C33 72 30 69 29 65";
const SEAL_RING = "M50 4 A46 46 0 1 1 49.99 4";
const SEAL_INNER = "M50 10 A40 40 0 1 1 49.99 10";

export interface Stroke {
  d: string;
  width: number;
  /** CSS color expression. */
  color: string;
  cap?: "butt" | "round" | "square";
}

export const INK = "var(--mono-ink, currentColor)";
export const PAPER = "var(--mono-paper, transparent)";
export const ACCENT = "var(--mono-accent, currentColor)";

export function strokesFor(variant: MonogramVariant): Stroke[] {
  switch (variant) {
    case "editorial":
      return [
        { d: SHARED_BAR, width: 12, color: INK, cap: "butt" },
        { d: SHARED_J, width: 12, color: INK, cap: "butt" },
      ];
    case "cinematic":
      return [
        { d: SHARED_BAR, width: 11, color: INK, cap: "round" },
        { d: SHARED_J, width: 11, color: INK, cap: "round" },
        { d: SHARED_BAR, width: 6, color: PAPER, cap: "round" },
        { d: SHARED_J, width: 6, color: PAPER, cap: "round" },
      ];
    case "terminal":
      return [
        { d: "M16 16 H8 V84 H16", width: 5, color: INK, cap: "square" },
        { d: "M84 16 H92 V84 H84", width: 5, color: INK, cap: "square" },
        { d: "M38 30 V60 C38 68 34 72 28 72 C24 72 21 69 20 65", width: 6, color: INK, cap: "square" },
        { d: "M44 30 H68", width: 6, color: INK, cap: "square" },
        { d: "M56 30 V72", width: 6, color: INK, cap: "square" },
      ];
    case "seal":
      return [
        { d: SEAL_RING, width: 3, color: INK, cap: "round" },
        { d: SEAL_INNER, width: 1.25, color: INK, cap: "round" },
        { d: SEAL_BAR, width: 8, color: ACCENT, cap: "butt" },
        { d: SEAL_J, width: 8, color: ACCENT, cap: "butt" },
      ];
  }
}

export const DEFAULT_DURATION: Record<MonogramVariant, number> = {
  editorial: 0.2,
  cinematic: 0.3,
  terminal: 0.12,
  seal: 0.25,
};

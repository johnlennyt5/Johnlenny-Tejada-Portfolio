/* v4 fonts. Loaded only by this version's Shell. */
import { Caveat, Fraunces, Source_Serif_4 } from "next/font/google";

/*
 * Budget (latin subset, measured from Google Fonts): body 51 KB (preloaded), Fraunces upright
 * 37 KB, Fraunces italic about 23 KB, Caveat 51 KB (captions, below the fold). About 160 KB in all,
 * down from 269 KB, and only the body file competes with the CSS for the first paint.
 */

/**
 * Fraunces upright, variable weight only. The optical-size axis is not requested: it nearly
 * doubled the file (67 KB against 37 KB). Not preloaded, and display "optional": on a slow first
 * visit the title page keeps the metric-matched fallback serif instead of swapping late and
 * moving the layout; the face is cached for every page after that.
 */
export const display = Fraunces({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-v4-display",
  display: "optional",
  preload: false,
});

/**
 * Fraunces italic at one static weight (400), no optical-size axis: about 23 KB instead of the
 * 80 KB variable file. Every italic rule in theme.css asks for 400.
 */
export const displayItalic = Fraunces({
  subsets: ["latin"],
  style: "italic",
  weight: "400",
  variable: "--font-v4-display-italic",
  display: "optional",
  preload: false,
});

/**
 * Body serif. It sets the LCP text (the hero intro), so it is the only preloaded file.
 * Weights 400 and 600 only, no optical-size axis. Google serves one wght-only file for the pair,
 * so the 600 labels and buttons cost nothing extra; 700 requests resolve to the 600 face.
 */
export const body = Source_Serif_4({
  subsets: ["latin"],
  style: "normal",
  weight: ["400", "600"],
  variable: "--font-v4-body",
  display: "swap",
});

/** Chapter captions only, all below the fold. One static weight: 51 KB, the variable pair was 75 KB. */
export const hand = Caveat({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-v4-hand",
  display: "swap",
  preload: false,
});

/* v4 has no mono family; dates and labels use small caps in the body serif. */
export const fontClassName = [display.variable, displayItalic.variable, body.variable, hand.variable].join(" ");

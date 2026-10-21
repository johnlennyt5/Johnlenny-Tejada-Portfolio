/* v3 fonts. Loaded only by this version's Shell. */
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, JetBrains_Mono } from "next/font/google";

/**
 * UI labels, terminal text and numbers. Variable font, one file. Not preloaded: nothing above
 * the fold that counts for LCP waits on it (the hero [JT] glyph is an inline SVG).
 */
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-v3-mono", display: "swap", preload: false });

/** Body copy. Not preloaded, so the display face is the only font competing with first paint. */
export const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-v3-body",
  display: "swap",
  preload: false,
});

/** Headlines, including the hero name (the LCP element), so it stays preloaded. */
export const display = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-v3-display",
  display: "swap",
});

export const fontClassName = [display.variable, body.variable, mono.variable].join(" ");

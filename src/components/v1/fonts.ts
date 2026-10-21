/*
 * v1 fonts. Loaded only by this version's Shell.
 * Display ships a single 900 file: the CSS font matcher renders every 800 request
 * (font-extrabold, theme.css) with the 900 face, so one preload covers the whole display set.
 * Preloaded: Inter Tight 900 and Inter. JetBrains Mono is labels only and loads on demand.
 * The display face skips next/font's generated fallback (Arial Regular, faux-bolded, far
 * narrower than Inter Tight Black): theme.css declares a metric-matched "v1 Display Fallback"
 * built on Arial Bold, listed right after this variable in --ff-display.
 */
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

export const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-v1-display",
  display: "swap",
  adjustFontFallback: false,
});
export const body = Inter({ subsets: ["latin"], variable: "--font-v1-body", display: "swap" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-v1-mono", display: "swap", preload: false });

export const fontClassName = [display.variable, body.variable, mono.variable].join(" ");

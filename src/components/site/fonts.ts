/* Fonts for the main site. Loaded only by SiteShell. */
import { Inter, JetBrains_Mono, Sora } from "next/font/google";

/** Headlines, including the hero name (the LCP text), so it is preloaded. */
export const display = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--ff-site-display",
  display: "swap",
});

export const body = Inter({
  subsets: ["latin"],
  variable: "--ff-site-body",
  display: "swap",
  preload: false,
});

/** Labels, code and numbers. */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--ff-site-mono",
  display: "swap",
  preload: false,
});

export const fontClassName = [display.variable, body.variable, mono.variable].join(" ");

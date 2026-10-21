/* v3 fonts. Loaded only by this version's Shell. */
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, JetBrains_Mono } from "next/font/google";

export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-v3-mono", display: "swap" });
export const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-v3-body", display: "swap" });
export const display = IBM_Plex_Sans_Condensed({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-v3-display", display: "swap", preload: false });

export const fontClassName = [display.variable, body.variable, mono.variable].join(" ");

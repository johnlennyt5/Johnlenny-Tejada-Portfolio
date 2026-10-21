/* v2 fonts. Loaded only by this version's Shell. */
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";

export const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-v2-display", display: "swap" });
export const body = Inter({ subsets: ["latin"], variable: "--font-v2-body", display: "swap" });
export const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-v2-mono", display: "swap", preload: false });

export const fontClassName = [display.variable, body.variable, mono.variable].join(" ");

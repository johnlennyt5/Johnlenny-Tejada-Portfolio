/* v1 fonts. Loaded only by this version's Shell. */
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";

export const display = Inter_Tight({ subsets: ["latin"], weight: ["800", "900"], variable: "--font-v1-display", display: "swap" });
export const body = Inter({ subsets: ["latin"], variable: "--font-v1-body", display: "swap" });
export const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-v1-mono", display: "swap", preload: false });

export const fontClassName = [display.variable, body.variable, mono.variable].join(" ");

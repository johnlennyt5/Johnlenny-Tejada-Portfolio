/* v4 fonts. Loaded only by this version's Shell. */
import { Caveat, Fraunces, Source_Serif_4 } from "next/font/google";

export const display = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-v4-display", display: "swap" });
export const body = Source_Serif_4({ subsets: ["latin"], variable: "--font-v4-body", display: "swap" });
/** Captions only. */
export const hand = Caveat({ subsets: ["latin"], variable: "--font-v4-hand", display: "swap", preload: false });

/* v4 has no mono family; dates use the body serif. */
export const fontClassName = [display.variable, body.variable, hand.variable].join(" ");

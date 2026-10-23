/* Palette preference. Shared by the boot script and the client toggles. */

export const PALETTE_KEY = "jt-palette";
export const MODE_KEY = "jt-mode";
export const BG_KEY = "jt-bg";

export type PaletteId =
  | "ember"
  | "royalflame"
  | "volt"
  | "midnight"
  | "royal"
  | "daylight"
  | "teal"
  | "luminous"
  | "harvest"
  | "espresso"
  | "lilac"
  | "neon"
  | "brass"
  | "swiss"
  | "sunset";
export type Mode = "dark" | "light";
export type BackgroundId = "void" | "aurora" | "wavegrid" | "swarm" | "field" | "glass";

/** Page backgrounds. "void" is the original solid background with the hero grid. */
export const backgrounds: { id: BackgroundId; name: string; mood: string }[] = [
  { id: "void", name: "Void", mood: "Clean, solid (default)" },
  { id: "wavegrid", name: "Wave Grid", mood: "3D energy landscape" },
  { id: "aurora", name: "Aurora", mood: "Flowing light ribbons" },
  { id: "swarm", name: "Neural Swarm", mood: "Particles that link up" },
  { id: "field", name: "Force Field", mood: "Plasma around your cursor" },
  { id: "glass", name: "Liquid Glass", mood: "Floating 3D glass orbs" },
];

export interface Palette {
  id: PaletteId;
  name: string;
  mood?: string;
  swatch: string[];
}

/** The site's own palettes. Each has a fixed light or dark look. */
export const palettes: Palette[] = [
  { id: "royalflame", name: "Royal Flame", mood: "Royal blue into fire (default)", swatch: ["#05071c", "#0909ed", "#ff8a1f"] },
  { id: "ember", name: "Ember", mood: "Warm, bold", swatch: ["#0b0c10", "#ff6b2c"] },
  { id: "volt", name: "Volt", mood: "Electric, sharp", swatch: ["#0a0a0a", "#b6ff2e"] },
  { id: "midnight", name: "Midnight", mood: "Cool, focused", swatch: ["#070d1a", "#38bdf8"] },
  { id: "royal", name: "Royal", mood: "Rich, creative", swatch: ["#140b20", "#c084fc"] },
  { id: "daylight", name: "Daylight", mood: "Light, clean", swatch: ["#fbf8f5", "#e8442a"] },
];

/** Trend palettes, matched to the truckWhat splash pages. Each works in dark and light (MODE_KEY). */
export const trendPalettes: Palette[] = [
  { id: "teal", name: "Transformative Teal", mood: "Calm, trusted", swatch: ["#e7e5e0", "#14898b", "#e97056", "#0f1f21"] },
  { id: "luminous", name: "Luminous", mood: "Electric, optimistic", swatch: ["#f1f2f6", "#356ef9", "#f64097", "#0c1024"] },
  { id: "harvest", name: "Harvest Road", mood: "Warm, grounded", swatch: ["#f0ebe0", "#b0542f", "#347f5b", "#1a1510"] },
  { id: "espresso", name: "Espresso", mood: "Premium, tactile", swatch: ["#ede8e2", "#9a6d58", "#a02f41", "#191412"] },
  { id: "lilac", name: "Lilac Dusk", mood: "Soft, modern", swatch: ["#f1f0f5", "#896fd2", "#238862", "#151120"] },
  { id: "neon", name: "Neon Night", mood: "Cyber, high-contrast", swatch: ["#eceeea", "#3ef81b", "#f62ecf", "#0c0e0d"] },
  { id: "brass", name: "Navy & Brass", mood: "Established, luxe", swatch: ["#efede6", "#31519c", "#bf9830", "#0d101c"] },
  { id: "swiss", name: "Swiss Signal", mood: "Graphic, severe", swatch: ["#f7f7f7", "#dc0c18", "#414148", "#101010"] },
  { id: "sunset", name: "Sunset Highway", mood: "Retro-future, warm", swatch: ["#f4ece7", "#de457c", "#ed9b10", "#1f1121"] },
];

export const defaultPalette: PaletteId = "royalflame";

/**
 * Runs in <head> before first paint so a saved palette never flashes.
 * A ?palette= query (for sharing a look) wins over the saved one. Storage can throw, so it is guarded.
 * It also turns off content-visibility (site.css) before any #fragment jump, so jumps land exactly.
 */
export const prefsBootScript = `(function(){var d=document.documentElement;var ids=${JSON.stringify(
  [...palettes, ...trendPalettes].map((p) => p.id),
)};var p=null,m=null,b=null;try{p=localStorage.getItem("${PALETTE_KEY}");m=localStorage.getItem("${MODE_KEY}");b=localStorage.getItem("${BG_KEY}")}catch(e){}try{var qb=new URLSearchParams(location.search).get("bg");if(qb)b=qb}catch(e){}d.dataset.bg=${JSON.stringify(["void","aurora","wavegrid","swarm","field","glass"])}.indexOf(b)>-1?b:"void";d.dataset.mode=m==="light"?"light":"dark";try{var q=new URLSearchParams(location.search).get("palette");if(q)p=q}catch(e){}d.dataset.palette=ids.indexOf(p)>-1?p:"${defaultPalette}";if(location.hash.length>1)d.dataset.cv="off";document.addEventListener("click",function(e){var t=e.target;var a=t&&t.closest?t.closest("a[href*='#']"):null;if(a)d.dataset.cv="off"},true)})();`;

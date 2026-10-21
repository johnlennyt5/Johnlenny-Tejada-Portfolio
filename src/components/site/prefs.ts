/* Palette and language preferences. Shared by the boot script and the client toggles. */

export const PALETTE_KEY = "jt-palette";
export const LANG_KEY = "jt-lang";

export type PaletteId = "ember" | "volt" | "midnight" | "royal" | "daylight";
export type Lang = "en" | "es";

export const palettes: { id: PaletteId; name: string; swatch: [string, string] }[] = [
  { id: "ember", name: "Ember", swatch: ["#0b0c10", "#ff6b2c"] },
  { id: "volt", name: "Volt", swatch: ["#0a0a0a", "#b6ff2e"] },
  { id: "midnight", name: "Midnight", swatch: ["#070d1a", "#38bdf8"] },
  { id: "royal", name: "Royal", swatch: ["#140b20", "#c084fc"] },
  { id: "daylight", name: "Daylight", swatch: ["#fbf8f5", "#e8442a"] },
];

export const defaultPalette: PaletteId = "ember";

/**
 * Runs in <head> before first paint so a saved palette or language never flashes.
 * A ?palette= query (for sharing a look) wins over the saved one. Storage can throw, so it is guarded.
 */
export const prefsBootScript = `(function(){var d=document.documentElement;var ids=${JSON.stringify(
  palettes.map((p) => p.id),
)};var p=null,l=null;try{p=localStorage.getItem("${PALETTE_KEY}");l=localStorage.getItem("${LANG_KEY}")}catch(e){}try{var q=new URLSearchParams(location.search).get("palette");if(q)p=q}catch(e){}d.dataset.palette=ids.indexOf(p)>-1?p:"${defaultPalette}";if(l==="es"){d.dataset.lang="es";d.lang="es"}else{d.dataset.lang="en"}})();`;

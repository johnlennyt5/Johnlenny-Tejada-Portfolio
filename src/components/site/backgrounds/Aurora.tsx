"use client";

import { useEffect, useRef } from "react";
import type { BgProps } from "./BackgroundLayer";
import { useShaderCanvas, type FrameState, type RGB } from "./useShaderCanvas";

/*
 * Aurora: three parallax curtains of northern light over faint star dust.
 * Each curtain has a razor-bright lower hem that folds in S-curves, a soft body above it and
 * vertical rays that come in bursts. The light sweeps from the top center to the top right so
 * the text on the left stays calm. The cursor is a gravity well, hovering the name pulls the
 * front hem down to trace it, a click sends a wave of light that flares the hems, and every
 * section of the page gets its own aurora weather.
 */
const FRAG = `
uniform vec3 u_cA;      // hem color
uniform vec3 u_cB;      // upper curtain color
uniform vec3 u_weather; // x: height shift, y: color bias, z: intensity
uniform vec4 u_name;    // hero name: x0, x1, top (0..1, y up), hover 0..1
uniform float u_page;   // scrollY in viewport heights

// Dave Hoskins hash, stable for large inputs.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm3(vec2 p) {
  const mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p = rot * p * 2.07 + 5.3;
    a *= 0.5;
  }
  return v / 0.875;
}

float fbm2(vec2 p) {
  return (noise(p) + 0.5 * noise(p * 2.07 + 5.3)) / 1.5;
}

// One curtain. body is the soft light above the hem, edge the bright hem, h the height above it.
void curtain(vec2 p, vec2 uv, float L, float t, float ring, float rip, float lightMode,
             out float body, out float edge, out float h, out float pull) {
  float depth = 1.0 + L * 0.45;
  // Parallax: far layers move less with the pointer.
  vec2 par = (u_mouse - 0.5) * 0.06 / depth * u_mouseOn;
  float x = (p.x + par.x) * (0.75 + L * 0.3) + L * 3.7;

  // Domain warp gives the folds of a real curtain.
  float w = fbm3(vec2(x * 0.55, t * 0.045 + L * 5.0));
  float x2 = x + 1.1 * w + rip;

  // Hem sweeps diagonally: high at the top center, lower toward the right edge.
  float after = smoothstep(0.6, 1.2, u_page);
  float sweep = mix(0.9, 0.58, smoothstep(0.35, 1.0, uv.x));
  float base = mix(sweep, 0.5, after) - L * 0.035 + u_weather.x;
  float yc = base + 0.36 * (fbm3(vec2(x2 * 1.1, t * 0.06 + L * 9.0)) - 0.5);
  yc += 0.08 * sin(x2 * 2.2 + t * 0.07 + L * 2.4);

  // Gravity well: the hem bends toward the cursor.
  float dx = (uv.x - u_mouse.x) * u_res.x / u_res.y;
  float g = exp(-dx * dx * 5.0) * u_mouseOn;
  yc = mix(yc, u_mouse.y + 0.05, 0.3 * g / depth);

  // Hovering the name pulls the front hem down to trace its top edge.
  float wn = smoothstep(u_name.x - 0.03, u_name.x + 0.05, uv.x) * smoothstep(u_name.y + 0.03, u_name.y - 0.05, uv.x);
  pull = u_name.w * clamp(0.65 * exp(-dx * dx * 12.0) + 0.55 * wn, 0.0, 1.0) / (1.0 + L * 1.6);
  yc = mix(yc, u_name.z - 0.012 + 0.004 * sin(x2 * 9.0 + t * 1.3), pull);

  float dy = p.y + par.y - yc;
  h = dy;
  float hem = smoothstep(-0.02, 0.006, dy);
  float fade = exp(-max(dy, 0.0) * mix(4.2 + L * 1.6, 2.6, lightMode));

  // Razor hem with a second thinner fold just above it (the S-curve).
  float yc2 = 0.05 * sin(x2 * 6.0 + t * 0.4);
  float e1 = exp(-abs(dy) * 70.0);
  float e2 = exp(-abs(dy - 0.018 - yc2 * 0.35) * 110.0) * 0.55 * smoothstep(0.0, 0.03, abs(yc2));
  edge = (e1 * 1.6 + e2) * (1.0 + ring * 4.0);

  // Rays come in bursts along the curtain, few and sharp.
  float r = noise(vec2(x2 * 55.0, p.y * 0.8 - t * 0.12 + L * 3.0));
  r *= r;
  float burst = smoothstep(0.2, 0.8, noise(vec2(x2 * 3.0, t * 0.05 + L * 7.0)));
  float rays = (0.12 + 2.4 * r * r) * mix(0.35, 1.0, burst) * (1.0 + ring * 3.0);
  rays = mix(rays, 0.55, lightMode * 0.9);

  // Folds: wide gaps and bright bunches along the curtain.
  float fold = smoothstep(0.3, 0.72, fbm2(vec2(x2 * 1.4 - t * 0.05, L * 2.0)));
  float lit = 0.08 + 1.05 * fold;

  body = hem * fade * 1.1 * rays * lit + exp(min(dy, 0.0) * 40.0) * 0.12 * lit;
  edge *= lit * mix(0.7, 1.0, burst);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  // Wrapped time keeps noise inputs small; the light breathes out over the wrap.
  float t = mod(u_time, 900.0);
  float wrap = u_time < 2.0 ? 1.0 : smoothstep(0.0, 1.5, t) * smoothstep(900.0, 898.5, t);
  float lightMode = u_light;

  // Click: a wide ring of light that travels out from the click.
  vec2 cp = vec2(u_click.x * aspect, u_click.y);
  float ct = u_click.z;
  float cd = distance(p, cp);
  float life = exp(-ct * 0.6) * step(ct, 6.0);
  float ring = exp(-pow((cd - ct * 1.2) * 6.0, 2.0)) * life;
  // A crisp shock front on the leading edge of the ring.
  float front = exp(-pow((cd - ct * 1.2) * 30.0, 2.0)) * life;

  // Pointer speed ripple around the cursor, skipped at rest.
  vec2 mp = vec2(u_mouse.x * aspect, u_mouse.y);
  float md = distance(p, mp);
  float speed = min(length(u_mouseVel), 2.5) * u_mouseOn;
  float rip = 0.0;
  if (speed > 0.01) rip = sin(md * 34.0 - t * 9.0) * exp(-md * 5.0) * speed * 0.035;

  vec3 bodyGlow = vec3(0.0);
  vec3 hemGlow = vec3(0.0);
  float bodyTot = 0.0;
  float edgeTot = 0.0;
  float trace = 0.0;
  for (int i = 0; i < 3; i++) {
    float L = float(i);
    float body;
    float edge;
    float h;
    float pull;
    curtain(p, uv, L, t, ring, rip, lightMode, body, edge, h, pull);
    // Hem color low, counter color higher up the curtain.
    float k = clamp(smoothstep(0.0, 0.16, h) + u_weather.y + L * 0.12, 0.0, 1.0);
    vec3 c = mix(u_cA, u_cB, k);
    vec3 hc = mix(u_cA, u_fg, 0.25 * (1.0 - lightMode));
    float weight = 1.0 / (1.0 + L * 0.7);
    bodyGlow += c * body * weight;
    bodyTot += body * weight;
    hemGlow += hc * edge * 0.6 * weight;
    edgeTot += edge * 0.6 * weight;
    trace = max(trace, pull);
  }


  // Cursor brightens nearby light, and the whole sky breathes slowly.
  float near = 1.0 + 0.7 * exp(-md * md * 7.0) * u_mouseOn;
  float breathe = 0.86 + 0.14 * sin(t * 0.598);
  float energy = near * breathe * wrap * u_weather.z;

  // Readability masks run after every boost so nothing can light up the copy.
  float side = mix(0.18, 1.0, smoothstep(0.30, 0.85, uv.x));
  float vert = mix(0.35, 1.0, smoothstep(0.35, 0.85, uv.y));
  float hero = side * vert;
  // Phone: text spans the width, so keep light above the headline only.
  float phone = smoothstep(0.85, 0.6, aspect);
  hero = mix(hero, mix(0.12, 1.0, smoothstep(0.74, 0.9, uv.y)), phone);
  // Nav links stay crisp.
  hero *= 1.0 - 0.6 * smoothstep(0.9, 0.97, uv.y) * (1.0 - smoothstep(0.8, 0.9, uv.x));
  // After the hero the light retreats to the outer gutters.
  float after = smoothstep(0.6, 1.2, u_page);
  float gutter = smoothstep(0.1, 0.0, uv.x) + smoothstep(0.9, 1.0, uv.x);
  float m = mix(hero, 0.06 + 0.9 * gutter, after) * energy;
  // The name trace keeps its glow even on the calm left side.
  float mEdge = max(m, trace * 0.85 * energy);

  // The click wave reads in the sky and over the name, never behind the intro copy.
  float mRing = max(m, 0.45 * smoothstep(0.5, 0.62, uv.y) * energy);
  vec3 ringCol = mix(mix(u_cA, u_cB, 0.5), u_fg, 0.35 * (1.0 - lightMode));
  float wave = ring * 0.45 + front * 1.3;

  vec3 glow = bodyGlow * m + hemGlow * mEdge + ringCol * wave * mRing;
  float total = bodyTot * m + edgeTot * mEdge + wave * mRing;
  // Cap the light behind section copy.
  float over = min(1.0, mix(10.0, 0.45, after) / max(total, 1e-3));
  glow *= over;
  total *= over;

  vec3 col;
  if (lightMode < 0.5) {
    // Dark palettes: additive light, softly tone mapped. Hot cores lean toward the text color.
    vec3 hot = glow * 1.8 + u_fg * max(total * 1.8 - 0.9, 0.0) * 0.3;
    vec3 lit = 1.0 - exp(-hot);
    vec3 sky = u_bg + u_cB * 0.03 * smoothstep(0.4, 1.0, uv.y) * side;
    col = sky + lit * 0.92;
    // Star dust in the dark sky, skipped under bright light.
    if (total < 0.6) {
      vec2 sg = p * 150.0;
      vec2 sid = floor(sg);
      float sh = hash(sid);
      vec2 sp = fract(sg) - 0.5 - (vec2(hash(sid + 3.1), hash(sid + 7.7)) - 0.5) * 0.6;
      float star = step(0.965, sh) * smoothstep(0.22, 0.0, length(sp));
      star *= 0.55 + 0.45 * sin(t * (1.0 + sh * 3.0) + sh * 60.0);
      star *= (1.0 - clamp(total * 1.7, 0.0, 1.0)) * mix(0.4, 1.0, uv.y);
      col += star * mix(u_fg, u_cB, 0.3) * 0.5;
    }
    float vig = smoothstep(1.25, 0.35, length(uv - vec2(0.55, 0.55)));
    col = mix(u_bg, col, mix(0.75, 1.0, vig));
  } else {
    // Light palettes: a smooth watercolor ribbon plus a fine ink line on the hem.
    vec3 ink = (glow / max(total, 1e-3)) * 0.85;
    float amt = clamp(1.0 - exp(-total * 2.6), 0.0, 1.0) * 0.28;
    col = mix(u_bg, ink, amt);
    float line = clamp(edgeTot * mEdge * over * 0.8, 0.0, 1.0);
    col = mix(col, u_cA * 0.85, line * 0.35);
  }

  col += (hash(gl_FragCoord.xy + fract(t) * 17.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Small color helpers, run once per frame on the CPU instead of per pixel.
function toHsl([r, g, b]: RGB): RGB {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function fromHsl([h, s, l]: RGB): RGB {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

const mixRgb = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const wrapHue = (h: number) => ((h % 1) + 1) % 1;
const hueGap = (a: number, b: number) => {
  const d = wrapHue(b - a);
  return d > 0.5 ? d - 1 : d;
};

/** Aurora colors from the palette: a hem color and a contrasting upper color. */
function auroraColors(accent: RGB, accent2: RGB, light: boolean, shift: number): [RGB, RGB] {
  const a = toHsl(accent);
  const gap = hueGap(a[0], toHsl(accent2)[0]);
  let top = accent2;
  if (light) {
    // Light palettes keep the second color within about 45 degrees of the brand color.
    if (Math.abs(gap) > 60 / 360) top = fromHsl([wrapHue(a[0] + Math.sign(gap) * (45 / 360)), Math.max(a[1], 0.6), a[2]]);
  } else if (Math.abs(gap) < 50 / 360) {
    // Accents too close together: add a cool counter hue, like green against red in a real aurora.
    top = mixRgb(accent2, fromHsl([wrapHue(a[0] + 155 / 360), 0.7, 0.5]), 0.7);
  }
  const rot = (c: RGB): RGB => {
    const hsl = toHsl(c);
    return fromHsl([wrapHue(hsl[0] + shift), hsl[1], hsl[2]]);
  };
  return [rot(accent), rot(top)];
}

/** Per section weather: height shift, color bias, intensity, hue shift. */
function weather(n: number): [number, number, number, number] {
  return [0.05 * Math.sin(n * 1.7 + 1.0) - 0.02, 0.25 * Math.sin(n * 2.9 + 0.5), 0.92 + 0.08 * Math.cos(n * 2.1), 0.035 * Math.sin(n * 2.4)];
}

interface Live {
  sect: number;
  target: number;
  hover: number;
  frame: number;
  /** Name box: x0, x1, top, bottom (0..1, y up). */
  name: [number, number, number, number];
  sections: Element[];
  scrim: number;
  loc: Record<string, WebGLUniformLocation | null> | null;
}

export default function Aurora({ onFail, onReady }: BgProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const live = useRef<Live>({ sect: 0, target: 0, hover: 0, frame: 0, name: [0, 0, -1, -1], sections: [], scrim: 0, loc: null });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bg-scrim", "32%");
    return () => {
      root.style.removeProperty("--bg-scrim");
    };
  }, []);

  // Phones and dense screens render at a lower resolution.
  const small = typeof window !== "undefined" && (window.innerWidth < 600 || window.devicePixelRatio > 2);

  const extraUniforms = (gl: WebGLRenderingContext, prog: WebGLProgram, s: FrameState) => {
    const st = live.current;
    if (!st.loc) {
      st.loc = Object.fromEntries(["u_cA", "u_cB", "u_weather", "u_name", "u_page"].map((n) => [n, gl.getUniformLocation(prog, n)]));
    }
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const page = s.scrollPx / vh;
    const still = s.dt === 0;

    // Layout reads are throttled; the name and section anchors move only on scroll or resize.
    if (st.frame++ % 8 === 0 || still) {
      const h1 = document.getElementById("hero-title");
      if (h1) {
        const r = h1.getBoundingClientRect();
        const top = h1.querySelector(".im")?.getBoundingClientRect().bottom ?? r.top;
        st.name = [r.left / vw, r.right / vw, 1 - top / vh, 1 - r.bottom / vh];
      }
      if (!st.sections.length) st.sections = Array.from(document.querySelectorAll("main section"));
      let n = 0;
      st.sections.forEach((el, i) => {
        if (el.getBoundingClientRect().top < vh * 0.45) n = i;
      });
      st.target = n;
    }

    // Ease toward the section weather over about 0.8 s.
    st.sect += (st.target - st.sect) * (still ? 1 : 1 - Math.exp(-s.dt * 4));
    const [nx0, nx1, ntop, nbot] = st.name;
    const [px, py] = s.pointer;
    const over = s.pointerActive && px > nx0 - 0.02 && px < nx1 + 0.02 && py < ntop + 0.04 && py > nbot - 0.02 ? 1 : 0;
    st.hover += (over - st.hover) * (still ? 1 : 1 - Math.exp(-s.dt * 3.5));

    const w = weather(st.sect);
    const [cA, cB] = auroraColors(s.palette.accent, s.palette.accent2, s.palette.light > 0.5, w[3]);
    const loc = st.loc;
    gl.uniform3f(loc.u_cA ?? null, ...cA);
    gl.uniform3f(loc.u_cB ?? null, ...cB);
    gl.uniform3f(loc.u_weather ?? null, w[0], w[1], w[2]);
    gl.uniform4f(loc.u_name ?? null, nx0, nx1, ntop, st.hover);
    gl.uniform1f(loc.u_page ?? null, page);

    // A stronger veil once the copy-heavy sections start.
    const scrim = Math.round(32 + 10 * Math.min(1, Math.max(0, (page - 0.5) / 0.6)));
    if (scrim !== st.scrim) {
      st.scrim = scrim;
      document.documentElement.style.setProperty("--bg-scrim", `${scrim}%`);
    }
  };

  useShaderCanvas(ref, FRAG, { onFail, onReady, renderScale: small ? 0.4 : 0.5, extraUniforms });
  return <canvas ref={ref} className="bg-canvas" />;
}

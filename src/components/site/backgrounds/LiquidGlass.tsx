"use client";

import { useEffect, useRef } from "react";
import type { BgProps } from "./BackgroundLayer";
import { useShaderCanvas, type FrameState } from "./useShaderCanvas";

/*
 * LiquidGlass: thick glass orbs (smooth-min metaballs) ray-marched over a soft palette backdrop.
 * Seen through the glass, the backdrop gains a fine grid and crisp flow lines, so each orb
 * visibly bends, shrinks and flips them like a real lens (entry and exit refraction, chromatic
 * split on the rims). A liquid pair orbits in the hero and fuses into one blob every ~9 s.
 * The camera orbits with the pointer, near orbs pull out a liquid strand toward it, scroll lifts
 * the orbs by depth and stretches them with speed, and a click either jiggles the orb it lands
 * on or drops a bead of glass that rises and merges into the nearest orb. Past the hero the
 * orbs slide out to the gutters and their highlights calm down behind the text.
 */

const N = 6;
// Half height of the view on the z = 0 plane (camera at z = 5, focal 2.78).
const HALF_H = 1.8;

const FRAG = `
uniform vec4 u_orb[${N}];  // xyz center, w radius (orbs 0 and 1 are the liquid pair)
uniform vec4 u_wobO;      // the jiggling orb (its slot above is emptied): xyz, w radius
uniform vec4 u_wob;       // xyz squash axis, w scale offset
uniform vec4 u_cur;       // cursor strand: xyz, w radius
uniform vec4 u_drop;      // click bead: xyz, w radius
uniform vec2 u_cam;       // yaw, pitch
uniform float u_calm;     // 0 in the hero, 1 once text sits over the glass
uniform float u_sy;       // vertical stretch from scroll speed

// Smooth min with its blend weight (y = share of a), so gradients blend the same way.
vec2 sminH(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return vec2(mix(b, a, h) - k * h * (1.0 - h), h);
}

float sph(vec3 q, float r) {
  q.y /= u_sy;
  return length(q) - r;
}

// Squashed and stretched along the click axis.
vec3 wobQ(vec3 q) {
  q.y /= u_sy;
  float s = 1.0 + u_wob.w;
  return q + u_wob.xyz * dot(q, u_wob.xyz) * (1.0 / s - 1.0);
}

float map(vec3 p) {
  float d = sminH(sph(p - u_orb[0].xyz, u_orb[0].w), sph(p - u_orb[1].xyz, u_orb[1].w), 0.65).x;
  for (int i = 2; i < ${N}; i++) d = sminH(d, sph(p - u_orb[i].xyz, u_orb[i].w), 0.5).x;
  d = sminH(d, (length(wobQ(p - u_wobO.xyz)) - u_wobO.w) * min(1.0, 1.0 + u_wob.w), 0.5).x;
  d = sminH(d, length(p - u_drop.xyz) - u_drop.w, 0.5).x;
  return sminH(d, length(p - u_cur.xyz) - u_cur.w, 0.6).x;
}

// Analytic normal: blend each shape's gradient with the same smooth-min weights (one pass
// instead of four map calls). Also returns the blended orb under p, used for the exit refraction.
vec3 gradOf(vec3 q) { return normalize(vec3(q.x, q.y / (u_sy * u_sy), q.z) + 1e-5); }

vec3 calcNormal(vec3 p, out vec4 dom) {
  vec3 q0 = p - u_orb[0].xyz;
  vec3 q1 = p - u_orb[1].xyz;
  float e0 = sph(q0, u_orb[0].w);
  float e1 = sph(q1, u_orb[1].w);
  vec2 m = sminH(e0, e1, 0.65);
  float d = m.x;
  vec3 g = mix(gradOf(q1), gradOf(q0), m.y);
  dom = mix(u_orb[1], u_orb[0], m.y);
  for (int i = 2; i < ${N}; i++) {
    vec3 q = p - u_orb[i].xyz;
    float e = sph(q, u_orb[i].w);
    m = sminH(d, e, 0.5);
    g = mix(gradOf(q), g, m.y);
    d = m.x;
    dom = mix(u_orb[i], dom, m.y);
  }
  vec3 qw = wobQ(p - u_wobO.xyz);
  float s = 1.0 + u_wob.w;
  float e = (length(qw) - u_wobO.w) * min(1.0, s);
  m = sminH(d, e, 0.5);
  g = mix(normalize(qw + u_wob.xyz * dot(qw, u_wob.xyz) * (1.0 / s - 1.0) + 1e-5), g, m.y);
  d = m.x;
  dom = mix(u_wobO, dom, m.y);
  vec3 qd = p - u_drop.xyz;
  m = sminH(d, length(qd) - u_drop.w, 0.5);
  g = mix(normalize(qd + 1e-5), g, m.y);
  d = m.x;
  vec3 qc = p - u_cur.xyz;
  m = sminH(d, length(qc) - u_cur.w, 0.6);
  g = mix(normalize(qc + 1e-5), g, m.y);
  return normalize(g);
}

float flowW(vec2 q, float t) {
  return q.x * 1.6 + q.y * 1.1 + sin(q.y * 1.9 + t * 2.0) * 0.7 + sin(q.x * 1.3 - t * 1.4) * 0.4;
}

// Calm backdrop on a plane behind the orbs: the palette bg with soft flowing color bands.
// Seen through glass (refr > 0) it gains a fine grid and crisp flow lines, so the lens visibly
// magnifies, bends and flips structure. The open page never shows these. refr fades toward
// the rims, where the lines would get too fine to draw cleanly.
vec3 backdrop(vec2 q, float refr) {
  float t = u_time * 0.08;
  float w = flowW(q, t);
  float band = 0.5 + 0.5 * sin(w * 1.7 + t * 3.0);
  band *= band;
  band *= band;
  float a = 0.5 + 0.5 * sin(q.x * 0.8 - q.y * 0.6 + t * 2.0);
  vec3 col = mix(u_accent, u_accent2, a);
  vec3 c = mix(u_bg, col, 0.1 + 0.08 * step(0.0001, refr) + mix(0.28 + 0.14 * step(0.0001, refr), 0.5, u_light) * band);
  if (refr > 0.0) {
    vec2 gq = abs(fract(q / 0.5) - 0.5) * 0.5;
    float grid = 1.0 - smoothstep(0.008, 0.035, min(gq.x, gq.y));
    float line = smoothstep(0.035, 0.0, abs(fract(w * 0.5 + t) - 0.5) - 0.012);
    vec3 ink = u_light > 0.5 ? mix(u_fg, u_accent, 0.35) : mix(u_fg, col, 0.35);
    c = mix(c, ink, grid * mix(0.16, 0.1, u_light) * refr);
    c = mix(c, u_light > 0.5 ? mix(u_accent, u_fg, 0.25) : mix(col, u_fg, 0.3), line * 0.75 * refr);
  }
  return c;
}

vec2 toPlane(vec3 o, vec3 d, float z, float maxT) {
  float t = min((z - o.z) / min(d.z, -0.05), maxT);
  return (o + d * t).xy;
}

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

// Widens the march interval by a bound sphere.
void bound(vec3 ro, vec3 rd, vec3 c, float R, inout float tmin, inout float tmax) {
  vec3 oc = ro - c;
  float b = dot(oc, rd);
  float disc = b * b - (dot(oc, oc) - R * R);
  if (disc > 0.0) {
    float s = sqrt(disc);
    tmin = min(tmin, -b - s);
    tmax = max(tmax, -b + s);
  }
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y * 2.0;
  vec2 uv = gl_FragCoord.xy / u_res;
  mat3 cam = rotY(u_cam.x) * rotX(u_cam.y);
  vec3 ro = cam * vec3(0.0, 0.0, 5.0);
  vec3 rd = cam * normalize(vec3(p, -2.78));

  // Background: the palette bg with a faint tint of the backdrop, stronger to the right.
  vec3 tint = backdrop(toPlane(ro, rd, -2.5, 1e3), 0.0);
  float side = smoothstep(-0.1, 1.0, uv.x) * 0.7 + 0.3 * smoothstep(0.55, 1.0, uv.y);
  float bgAmt = mix(0.1, 0.3, side) * mix(1.0, 0.7, u_light) * mix(1.0, 0.75, u_calm);
  vec3 col = mix(u_bg, tint, bgAmt);

  // Bounds: only march where a ray passes near an orb. Also collect halo and caustics.
  float tmin = 1e3, tmax = 0.0;
  float halo = 0.0, caus = 0.0;
  for (int i = 0; i < ${N}; i++) {
    vec4 o = u_orb[i];
    vec3 oc = ro - o.xyz;
    float b = dot(oc, rd);
    float dist = sqrt(max(dot(oc, oc) - b * b, 0.0));
    bound(ro, rd, o.xyz, o.w * u_sy + 0.17, tmin, tmax);
    halo += exp(-max(dist - o.w, 0.0) * 5.0) * o.w;
    // Caustic: light focused through the orb lands below-right of it on the backdrop.
    vec3 cc = ro - (o.xyz + vec3(0.35, -0.55, -0.6) * o.w);
    float cb = dot(cc, rd);
    float cd = sqrt(max(dot(cc, cc) - cb * cb, 0.0));
    caus += smoothstep(o.w * 0.75, 0.0, cd) * o.w;
  }
  if (u_wobO.w > 0.0) bound(ro, rd, u_wobO.xyz, u_wobO.w * 1.5 * u_sy + 0.14, tmin, tmax);
  if (u_drop.w > 0.0) bound(ro, rd, u_drop.xyz, u_drop.w + 0.14, tmin, tmax);
  if (u_cur.w > 0.02) bound(ro, rd, u_cur.xyz, u_cur.w + 0.17, tmin, tmax);

  vec3 glowCol = mix(u_accent, u_accent2, 0.5 + 0.5 * sin(u_time * 0.2 + uv.y * 3.0));
  if (u_light > 0.5) {
    // Soft colored ink shadow and a hint of focused light.
    col = mix(col, glowCol * 0.85 + u_bg * 0.15, clamp(halo * 0.2, 0.0, 0.2));
    col = mix(col, u_bg, clamp(caus * 0.5, 0.0, 0.35));
  } else {
    col += glowCol * clamp(halo * 0.1, 0.0, 0.16);
    col += mix(glowCol, u_fg, 0.4) * clamp(caus * 0.3, 0.0, 0.2);
  }

  if (tmax > tmin) {
    // March, remembering the closest approach so silhouettes get a soft antialiased edge.
    float t = max(tmin, 0.0);
    float pix = 2.4 / (u_res.y * 2.78);
    float dmin = 1e3, tbest = t;
    for (int i = 0; i < 40; i++) {
      float d = map(ro + rd * t);
      if (d < dmin) { dmin = d; tbest = t; }
      if (d < pix * t * 0.5 || t > tmax || (i > 12 && d > 0.25)) break;
      t += d;
    }
    float cover = 1.0 - smoothstep(0.0, pix * tbest, dmin);
    if (cover > 0.0) {
      vec3 pos = ro + rd * tbest;
      vec4 dom;
      vec3 n = calcNormal(pos, dom);
      float ndv = max(dot(-rd, n), 0.0);
      float fres = pow(1.0 - ndv, 3.0);
      float spk = mix(1.0, 0.25, u_calm);
      float rimK = mix(1.0, 0.6, u_calm);

      // Thick glass: refract in, cross the dominant orb, refract out, then sample the backdrop.
      vec3 r1 = refract(rd, n, 0.7);
      vec3 oc = pos - dom.xyz;
      float b = dot(oc, r1);
      float tx = -b + sqrt(max(b * b - dot(oc, oc) + dom.w * dom.w, 0.0));
      vec3 pe = pos + r1 * max(tx, 0.0);
      vec3 ne = normalize(pe - dom.xyz + 1e-5);
      vec3 r2 = refract(r1, -ne, 1.0 / 0.7);
      if (dot(r2, r2) < 1e-3) r2 = reflect(r1, -ne);
      // The plane sits about two focal lengths behind each orb, so every orb shows the same
      // slightly magnified, upside-down image whatever its size.
      vec2 qg = toPlane(pe, r2, dom.z - 3.2 * dom.w, 4.5 * dom.w);
      float sk = 0.001 + 0.999 * (1.0 - smoothstep(0.15, 0.55, fres));
      vec3 inner = backdrop(qg, sk);
      // Chromatic split only on the rims, where the bend is strongest.
      if (fres > 0.15) {
        vec2 dq = (r2.xy - rd.xy) * (0.35 * fres);
        inner.r = backdrop(qg + dq, sk).r;
        inner.b = backdrop(qg - dq, sk).b;
      }

      // Reflection of a soft studio: a softbox up-left, a dim fill down-right, a sharp spec.
      vec3 rf = reflect(rd, n);
      vec3 hi = u_light > 0.5 ? u_bg : mix(u_fg, u_accent2, 0.15);
      float box = smoothstep(0.88, 0.97, dot(rf, normalize(vec3(-0.55, 0.7, 0.45))));
      float box2 = smoothstep(0.9, 0.99, dot(rf, normalize(vec3(0.7, -0.25, 0.65))));
      float spec = pow(max(dot(rf, normalize(vec3(-0.4, 0.6, 0.7))), 0.0), 80.0);
      // Thin-film tint that slides around the rim. In dark palettes it also drifts into a
      // counter-hue (the accent with its channels reversed), strongest when both accents share
      // a hue, so the glass always shows two colors.
      vec3 film = mix(u_accent, u_accent2, 0.5 + 0.5 * sin(n.x * 3.0 + n.y * 2.0 + u_time * 0.4));
      float same = 1.0 - smoothstep(0.25, 0.6, length(u_accent - u_accent2));
      vec3 counter = mix(u_fg, u_accent.bgr, 0.7);
      float cw = (0.35 + 0.5 * same) * (1.0 - u_light) * (0.5 + 0.5 * sin(n.y * 4.0 - n.x * 2.0 + u_time * 0.3));
      film = mix(film, counter, cw);
      // Light leaving the bottom of the glass, and a thin bright inner ring of focused light.
      float exit = smoothstep(0.1, -0.9, n.y) * (1.0 - fres);
      float ring = smoothstep(0.12, 0.16, ndv) * (1.0 - smoothstep(0.18, 0.23, ndv));

      vec3 g;
      if (u_light > 0.5) {
        // Light palettes: clear tinted glass, colored ink rim, white highlights.
        g = mix(u_bg, inner, 0.88);
        g = mix(g, film * 0.8, (fres * 0.6 + exit * 0.12) * rimK);
        g = mix(g, hi, clamp(box * 0.85 + box2 * 0.3 + spec + ring * 0.35, 0.0, 1.0) * spk);
      } else {
        g = inner * 0.92 + u_bg * 0.08;
        g = mix(g, u_bg, 0.2 * (1.0 - fres));
        g += film * (fres * 1.0 + exit * 0.2) * rimK;
        g = mix(g, hi, clamp(box * 0.5 + box2 * 0.18 + spec * 0.9 + ring * 0.25, 0.0, 1.0) * spk);
      }
      col = mix(col, g, cover);
    }
  }

  // Gentle vignette toward the palette bg keeps edges calm.
  float v = smoothstep(1.25, 0.4, length((uv - 0.5) * vec2(1.2, 1.0)));
  col = mix(u_bg, col, mix(0.75, 1.0, v));
  gl_FragColor = vec4(col, 1.0);
}
`;

interface Orb {
  x: number; // fraction of half width (-1..1)
  y: number; // world y
  z: number;
  r: number;
  ph: number; // motion phase
  par: number; // scroll parallax
}

// Orbs 0 and 1 are the liquid pair; their x/y is the pair's shared center.
const DESKTOP: Orb[] = [
  { x: 0.42, y: 0.98, z: 0.1, r: 0.38, ph: 0.0, par: 0.25 },
  { x: 0.42, y: 0.98, z: 0.1, r: 0.3, ph: 0.0, par: 0.25 },
  { x: 1.0, y: 0.12, z: -0.3, r: 0.82, ph: 1.7, par: 0.15 },
  { x: 0.35, y: -1.28, z: 0.3, r: 0.27, ph: 3.1, par: 0.35 },
  { x: -1.08, y: -1.2, z: -0.4, r: 0.3, ph: 2.2, par: 0.3 },
  { x: -1.06, y: -2.7, z: -0.2, r: 0.45, ph: 5.3, par: 0.4 },
];

// Phone: three orbs, none behind the paragraph or buttons. The pair slots stay empty.
const PHONE: Orb[] = [
  { x: 0, y: 40, z: 0, r: 0, ph: 0, par: 0 },
  { x: 0, y: 40, z: 0, r: 0, ph: 0, par: 0 },
  { x: 0.95, y: 0.95, z: 0.0, r: 0.38, ph: 1.7, par: 0.25 },
  { x: -0.95, y: -1.35, z: 0.2, r: 0.3, ph: 3.1, par: 0.3 },
  { x: 0.92, y: -2.5, z: -0.2, r: 0.34, ph: 2.2, par: 0.4 },
  { x: 0, y: 40, z: 0, r: 0, ph: 0, par: 0 },
];

type V4 = [number, number, number, number];
const AWAY: V4 = [0, 40, 0, 0];

interface Locs {
  prog: WebGLProgram;
  orb: WebGLUniformLocation | null;
  wobO: WebGLUniformLocation | null;
  wob: WebGLUniformLocation | null;
  cur: WebGLUniformLocation | null;
  drop: WebGLUniformLocation | null;
  cam: WebGLUniformLocation | null;
  calm: WebGLUniformLocation | null;
  sy: WebGLUniformLocation | null;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Render scale: a little sharper on small phone canvases, and capped near 0.8 MP on big or
// high-DPR screens so the fragment count stays flat.
function pickScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const base = w < 700 ? 0.65 : 0.55;
  return Math.min(base, Math.sqrt(8e5 / (w * h * dpr * dpr)));
}

export default function LiquidGlass({ onFail, onReady }: BgProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sim = useRef({
    orbs: new Float32Array(N * 4),
    vh: 900,
    scroll: -1,
    scrollVel: 0,
    clickSeen: -1,
    wobI: -1,
    axis: [1, 0, 0] as [number, number, number],
    dropFrom: [0, 0] as [number, number],
    dropTo: -1,
    locs: null as Locs | null,
  });

  // The glass is fairly vivid, so the veil over it is a little stronger than the default.
  // Viewport height is read on resize, not per frame.
  useEffect(() => {
    const m = sim.current;
    const onResize = () => {
      m.vh = Math.max(1, window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    document.documentElement.style.setProperty("--bg-scrim", "32%");
    return () => {
      window.removeEventListener("resize", onResize);
      document.documentElement.style.removeProperty("--bg-scrim");
    };
  }, []);

  const extraUniforms = (gl: WebGLRenderingContext, prog: WebGLProgram, s: FrameState) => {
    const m = sim.current;
    if (!m.locs || m.locs.prog !== prog) {
      const u = (n: string) => gl.getUniformLocation(prog, n);
      m.locs = { prog, orb: u("u_orb"), wobO: u("u_wobO"), wob: u("u_wob"), cur: u("u_cur"), drop: u("u_drop"), cam: u("u_cam"), calm: u("u_calm"), sy: u("u_sy") };
    }
    const aspect = s.width / s.height;
    const halfW = HALF_H * aspect;
    const phone = aspect < 0.9;
    const defs = phone ? PHONE : DESKTOP;
    const sizeK = phone ? 1 : Math.min(1, 0.55 + aspect * 0.28);
    const vh = m.vh;
    const t = s.time;

    // Smoothed scroll, its speed (viewports per second) and the calm factor past the hero.
    const prev = m.scroll;
    m.scroll = s.reducedMotion || prev < 0 ? s.scrollPx : prev + (s.scrollPx - prev) * (1 - Math.exp(-s.dt * 5));
    const v = prev >= 0 && s.dt > 0 ? Math.abs(m.scroll - prev) / vh / s.dt : 0;
    m.scrollVel += (v - m.scrollVel) * (1 - Math.exp(-s.dt * 6));
    const sy = 1 + Math.min(0.25, m.scrollVel * 0.12);
    const calm = smooth(0.5 * vh, 1.1 * vh, m.scroll);

    const on = s.pointerActive && !phone ? 1 : 0;
    // Pointer and last click on the z = 0 plane.
    const cx = (s.pointer[0] - 0.5) * 2 * halfW;
    const cy = (s.pointer[1] - 0.5) * 2 * HALF_H;
    const kx = (s.click[0] - 0.5) * 2 * halfW;
    const ky = (s.click[1] - 0.5) * 2 * HALF_H;
    const span = HALF_H * 2 + 2.4;

    // The liquid pair orbits a shared center; its gap breathes so the neck forms and snaps
    // about every 9 s. Past the hero it turns upright to fit the gutter.
    const ra = (defs[0]?.r ?? 0) * sizeK;
    const rb = (defs[1]?.r ?? 0) * sizeK;
    const sep = (ra + rb) * (1 + 0.45 * Math.sin(t * 0.7 + 0.82));
    const ang = t * 0.11;
    const ux = Math.cos(ang) * (1 - calm);
    const uy = Math.sin(ang) * 0.2 * (1 - calm) + calm;
    const uz = Math.sin(ang) * 0.5;
    const ul = Math.hypot(ux, uy, uz) || 1;

    let nearest = -1;
    let nearestD = 1e9;
    let visNearest = -1;
    let visD = 1e9;
    let nearPointer = 1e9;
    defs.forEach((o, i) => {
      const r = o.r * sizeK;
      if (r <= 0) {
        m.orbs.set(AWAY, i * 4);
        return;
      }
      const bob = i < 2 ? 0.05 : 0.12;
      let x = o.x * halfW + Math.cos(t * 0.33 + o.ph) * 0.08;
      let y = o.y + Math.sin(t * 0.45 + o.ph) * bob + (m.scroll / vh) * HALF_H * 2 * o.par;
      y = ((((y + span / 2) % span) + span) % span) - span / 2;
      let z = o.z + Math.sin(t * 0.27 + o.ph * 2) * 0.15;
      if (i < 2) {
        const f = (i === 0 ? -rb / (ra + rb) : ra / (ra + rb)) * (sep / ul);
        x += ux * f;
        y += uy * f;
        z += uz * f;
      }
      // Past the hero, orbs over the content slide out to the gutters.
      if (Math.abs(o.x) < 1) x += ((x >= 0 ? 1.0 : -1.0) * halfW - x) * calm;
      // Lean toward the pointer like liquid.
      const ddx = cx - x;
      const ddy = cy - y;
      const d2 = ddx * ddx + ddy * ddy;
      const pull = on * 0.2 * Math.exp(-d2 / 1.4);
      x += ddx * pull;
      y += ddy * pull;
      nearPointer = Math.min(nearPointer, Math.sqrt(d2) - r);
      const kd = Math.hypot(kx - x, ky - y) - r;
      if (kd < nearestD) {
        nearestD = kd;
        nearest = i;
      }
      if (Math.abs(x) < halfW * 0.98 && Math.abs(y) < HALF_H * 0.95 && kd < visD) {
        visD = kd;
        visNearest = i;
      }
      m.orbs.set([x, y, z, r], i * 4);
    });

    // A new click on (or right beside) an orb jiggles it; anywhere else it drops a bead.
    const key = s.click[0] * 7 + s.click[1];
    if (s.click[2] < 0.1 && m.clickSeen !== key) {
      m.clickSeen = key;
      if (nearest >= 0 && nearestD < 0.6) {
        m.wobI = nearest;
        m.dropTo = -1;
        const ax = kx - (m.orbs[nearest * 4] ?? 0);
        const ay = ky - (m.orbs[nearest * 4 + 1] ?? 0);
        const l = Math.hypot(ax, ay, 0.3) || 1;
        m.axis = [ax / l, ay / l, 0.3 / l];
      } else {
        m.wobI = -1;
        m.dropFrom = [kx, ky];
        m.dropTo = visNearest >= 0 ? visNearest : nearest;
      }
    }
    const ct = s.click[2];
    const amt = m.wobI >= 0 && ct < 3 ? 0.45 * Math.exp(-ct * 1.8) * Math.sin(ct * 12) : 0;
    let wob = AWAY;
    if (amt !== 0 && m.wobI >= 0) {
      const o = m.wobI * 4;
      wob = [m.orbs[o] ?? 0, m.orbs[o + 1] ?? 0, m.orbs[o + 2] ?? 0, m.orbs[o + 3] ?? 0];
      m.orbs.set(AWAY, o);
    }

    // The bead pops in at the click, rises and is swallowed by the nearest visible orb.
    let drop = AWAY;
    if (m.dropTo >= 0 && ct < 1.2) {
      const o = m.dropTo * 4;
      const tx = m.orbs[o] ?? 0;
      const ty = m.orbs[o + 1] ?? 0;
      const tz = m.orbs[o + 2] ?? 0;
      const k = smooth(0.1, 1.2, ct);
      const ease = k * k;
      const lift = Math.sin(k * Math.PI) * 0.35;
      drop = [
        m.dropFrom[0] + (tx - m.dropFrom[0]) * ease,
        m.dropFrom[1] + (ty - m.dropFrom[1]) * ease + lift,
        0.3 + (tz - 0.3) * ease,
        0.13 * smooth(0, 0.12, ct) * (1 - smooth(0.9, 1.2, ct) * 0.6),
      ];
    }

    // The cursor strand shows only near an orb, as liquid pulled out of it.
    const curR = on * 0.15 * smooth(0.9, 0.3, nearPointer);
    const cur: V4 = curR > 0.01 ? [cx, cy, 0.2, curR] : AWAY;

    const l = m.locs;
    gl.uniform4fv(l.orb, m.orbs);
    gl.uniform4f(l.wobO, ...wob);
    gl.uniform4f(l.wob, m.axis[0], m.axis[1], m.axis[2], amt);
    gl.uniform4f(l.cur, ...cur);
    gl.uniform4f(l.drop, ...drop);
    gl.uniform2f(l.cam, (s.pointer[0] - 0.5) * 0.22 * on, -(s.pointer[1] - 0.5) * 0.14 * on);
    gl.uniform1f(l.calm, calm);
    gl.uniform1f(l.sy, sy);
  };

  useShaderCanvas(ref, FRAG, { onFail, onReady, renderScale: pickScale(), extraUniforms });
  return <canvas ref={ref} className="bg-canvas" />;
}

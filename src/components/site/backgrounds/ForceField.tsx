"use client";

import { useRef } from "react";
import type { BgProps } from "./BackgroundLayer";
import { useShaderCanvas, type FrameState } from "./useShaderCanvas";

/*
 * Force Field: an electric field drawn analytically. Field lines are level sets of the stream
 * function (sum of q * angle), so every line is exact and anti-aliased with |E| as its gradient.
 *
 * The hero photo orb is the source (+2.5): lines leave its rim, which burns with a plasma corona.
 * The cursor is a second positive charge (+1.5) that bends the field and throws lightning at the
 * orb when it comes close. Three sinks park in the gutter opposite each section's text, so the
 * field reshapes per section. A small mask texture of the visible text calms the lines wherever
 * there is copy to read. A click fires a pulse ring and a brief charge that snaps the lines in.
 * Charge strengths times LINES are whole numbers, so the angle seams never show.
 */
const FRAG = `
#define PI 3.14159265
uniform vec2 u_P;       // main source (+2.5): the orb, or the section source when it is off screen
uniform vec2 u_M;       // cursor (+1.5)
uniform vec2 u_N1;      // sinks (-1.5, -1.5, -1.0)
uniform vec2 u_N2;
uniform vec2 u_N3;
uniform vec4 u_orb;     // orb center and radii in height units; z = 0 when there is none
uniform float u_srcCore;// glow on the section source while it is not the orb
uniform vec4 u_a1;      // lightning arcs: from xy toward zw
uniform vec4 u_a2;
uniform vec4 u_a3;
uniform vec3 u_aw;      // arc strengths
uniform vec3 u_afull;   // 1 when an arc reaches all the way
uniform float u_lines;
uniform sampler2D u_mask;

float hash(float n) { return fract(sin(mod(n, 997.0) * 1.37 + 0.71) * 43758.5453); }
float hash2(vec2 p) { p = mod(p, 289.0); return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash2(i);
  float b = hash2(i + vec2(1.0, 0.0));
  float c = hash2(i + vec2(0.0, 1.0));
  float d = hash2(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm2(vec2 p) {
  return 0.66 * vnoise(p) + 0.34 * vnoise(p * 2.03 + vec2(1.7, 9.2));
}
float fbm3(vec2 p) {
  float s = 0.5 * vnoise(p);
  p = p * 2.03 + vec2(1.7, 9.2);
  s += 0.3 * vnoise(p);
  p = p * 2.03 + vec2(4.1, 2.3);
  s += 0.2 * vnoise(p);
  return s;
}

// One charge: adds to stream function, potential and field.
void addCharge(vec2 p, vec2 c, float q, inout float psi, inout float phi, inout vec2 E) {
  vec2 d = p - c;
  float r2 = max(dot(d, d), 1e-5);
  psi += q * atan(d.y, d.x);
  phi += q * 0.5 * log(r2);
  E += q * d / r2;
}

// A crackling arc from ab.xy toward ab.zw. Partial arcs reach part of the way and fade out.
float arc(vec2 p, vec4 ab, float seed, float full, float px) {
  vec2 a = ab.xy;
  vec2 v = ab.zw - a;
  float L = max(length(v), 1e-3);
  vec2 dir = v / L;
  vec2 ap = p - a;
  float side = dot(ap, vec2(-dir.y, dir.x));
  if (abs(side) > 0.12) return 0.0;
  float along = dot(ap, dir);
  float tick = mod(floor(u_time * 9.0 + seed * 3.0), 997.0);
  float reach = mix(0.35 + 0.4 * hash(tick + seed * 17.0), 1.0, full);
  float tt = along / L;
  if (tt < 0.0 || tt > reach) return 0.0;
  float wob = (vnoise(vec2(along * 18.0, tick * 1.3 + seed)) - 0.5) * 0.09
            + (vnoise(vec2(along * 55.0, tick * 2.1 + seed * 5.0)) - 0.5) * 0.03;
  wob *= smoothstep(0.0, 0.2, tt) * mix(1.0, smoothstep(1.0, 0.8, tt), full) * min(1.0, L * 2.0);
  float d = abs(side - wob);
  float fade = mix(1.0 - tt / reach, 1.0, full);
  float lit = step(0.15, hash(tick * 1.7 + seed));
  float glow = 0.006 / (d + 0.004) * 0.3 * smoothstep(0.12, 0.05, abs(side));
  return lit * fade * (smoothstep(px * 2.2, 0.0, d) + glow);
}

// A small boiling plasma ball (cursor, section source).
float plasmaBall(vec2 p, vec2 c, float t, float size) {
  vec2 d = p - c;
  float r = length(d);
  if (r > size * 4.0) return 0.0;
  float n = fbm3(d * (0.28 / size) + vec2(t * 0.9, -t * 0.7));
  float sx = r - size - size * 0.6 * n;
  float shell = exp(-sx * sx / (size * size * 0.18));
  float s2 = size * size * 0.7;
  return exp(-r / size * 2.2) * (0.5 + 0.7 * n) + shell * (0.3 + 0.9 * n) + s2 / (r * r + s2) * 0.35;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  float px = 1.0 / u_res.y;
  float t = u_time;
  float mask = texture2D(u_mask, vec2(uv.x, 1.0 - uv.y)).r;

  // Click: an expanding ring pushes the field and a brief negative charge snaps lines in.
  vec2 cp = vec2(u_click.x * asp, u_click.y);
  float ct = u_click.z;
  float alive = step(ct, 4.0);
  float cfade = exp(-ct * 1.6) * alive;
  float cr = ct * 0.9;
  vec2 cd = p - cp;
  float cl = length(cd);
  float rx = cl - cr;
  float ring = exp(-rx * rx / 0.0025) * cfade;
  float ex = cl - cr * 0.62;
  float echo = exp(-ex * ex / 0.0009) * cfade * 0.6;
  vec2 q = p - (cd / max(cl, 1e-4)) * ring * 0.07;
  float qk = -2.0 * exp(-ct * 2.0) * alive;

  float psi = 0.0;
  float phi = 0.0;
  vec2 E = vec2(0.0);
  addCharge(q, u_P, 2.5, psi, phi, E);
  addCharge(q, u_M, 1.5, psi, phi, E);
  addCharge(q, u_N1, -1.5, psi, phi, E);
  addCharge(q, u_N2, -1.5, psi, phi, E);
  addCharge(q, u_N3, -1.0, psi, phi, E);
  addCharge(q, cp, qk, psi, phi, E);
  // The click charge is fractional, so hide its branch cut (the ray to its left).
  vec2 kd = q - cp;
  float seam = 1.0 - (1.0 - smoothstep(0.0, 0.025, abs(kd.y))) * step(kd.x, 0.0) * smoothstep(0.0, 0.05, -qk);

  float e = max(length(E), 1e-4);
  // Field lines: distance to the nearest stream contour, in pixels.
  float f = psi * u_lines / (2.0 * PI);
  float spacing = 2.0 * PI / (u_lines * e);
  float dpx = (0.5 - abs(fract(f) - 0.5)) * spacing / px;
  float line = smoothstep(mix(1.4, 1.8, u_light), mix(0.2, 0.4, u_light), dpx);
  float halo = exp(-dpx * 0.35) * 0.18;
  float dense = smoothstep(2.5, 9.0, spacing / px);

  // Energy pulses flow along the potential from + to -: a bright head with a long tail.
  // Each line gets its own rate and phase so the pulses never line up into rings.
  float lid = floor(f + 0.5);
  float flow = fract(phi * (1.5 + 0.8 * hash(lid + 3.0)) - t * (0.45 + 0.3 * hash(lid + 7.0)) + hash(lid) * 7.0);
  float f2 = flow * flow;
  // Where lines crowd in near a charge the pulses would stack into rings, so they stand down there.
  float dash = smoothstep(1.0, 0.965, flow) * f2 * f2 * smoothstep(8.0, 26.0, spacing / px);
  float head = smoothstep(0.9, 0.985, flow) * smoothstep(1.0, 0.985, flow) * smoothstep(1.5, 0.0, dpx);
  float strength = 1.0 - exp(-e * 0.18);
  float energize = 1.0 + (ring + echo) * 4.0;
  float lineAmt = dense * (0.35 + 0.65 * strength) * energize * seam;
  float lines = (line * (0.08 + 2.4 * dash) + halo * (0.3 + 2.8 * dash)) * lineAmt;
  float heads = head * lineAmt;
  float dashInk = dash * line * lineAmt;

  // Orb: nothing draws inside it; its rim carries a plasma corona with flame tongues.
  float hasOrb = step(0.001, u_orb.z);
  vec2 od = p - u_orb.xy;
  float on = length(od / max(u_orb.zw, vec2(1e-3)));
  float rim = (on - 1.0) * min(u_orb.z, u_orb.w);
  float inside = mix(1.0, smoothstep(-0.004, 0.004, rim), hasOrb);
  float plasma = 0.0;
  if (hasOrb > 0.5 && rim > -0.01 && rim < 0.13) {
    vec2 dir = od / max(length(od), 1e-4);
    float warp = fbm2(dir * 2.5 - rim * 9.0 + vec2(t * 0.35, -t * 0.27));
    float n = fbm3(dir * 4.0 + vec2(t * 0.15, -t * 0.11) + warp * 1.4);
    float sx = rim - 0.006 - 0.03 * n;
    float shell = exp(-sx * sx / 0.00014);
    float corona = exp(-rim * 15.0) * (0.2 + 1.2 * n * n);
    float tongue = 1.0 - abs(2.0 * vnoise(dir * 9.0 + vec2(-rim * 7.0 + t * 0.6, t * 0.2)) - 1.0);
    tongue = pow(tongue, 10.0) * exp(-rim * 11.0);
    plasma = (shell * (0.45 + 0.9 * n) + corona * 0.6 + tongue * 0.8) * smoothstep(-0.01, 0.0, rim);
  }
  plasma += plasmaBall(p, u_M, t, 0.03) * 0.8;
  if (u_srcCore > 0.01) plasma += plasmaBall(p, u_P, t + 3.0, 0.028) * u_srcCore;

  // Faint equipotentials for depth, kept clear of the orb so they never echo its ring.
  float ep = abs(fract(phi * 0.9) - 0.5);
  float epx = (0.5 - ep) / (0.9 * e) / px;
  float equi = smoothstep(1.2, 0.0, epx) * 0.05 * dense * mix(1.0, smoothstep(0.3, 0.45, length(od)), hasOrb);

  // Sink cores.
  float r1 = length(p - u_N1);
  float r2 = length(p - u_N2);
  float r3 = length(p - u_N3);
  float coresN = 0.004 / (r1 * r1 + 0.004) + 0.004 / (r2 * r2 + 0.004) + 0.003 / (r3 * r3 + 0.003);

  // Lightning.
  float arcs = arc(p, u_a1, 1.0, u_afull.x, px) * u_aw.x;
  arcs += arc(p, u_a2, 2.0, u_afull.y, px) * u_aw.y;
  arcs += arc(p, u_a3, 3.0, u_afull.z, px) * u_aw.z;

  // Pulse ring itself.
  float ringLine = exp(-rx * rx / 0.000036) * cfade + ring * 0.3 + echo * 0.5;

  // Readability: calm everything under text; the drama lives in the gutters and at the cursor.
  float rm = length(p - u_M);
  float calm = mix(1.0, 0.15, mask);
  calm = min(1.0, calm + 0.3 * exp(-rm * 10.0)) * inside;
  float soft = mix(1.0, calm, 0.6) * inside;
  lines *= calm;
  heads *= calm;
  equi *= calm;
  dashInk *= calm;
  arcs *= soft;
  plasma *= soft;

  // Sign mix: the source side reads as accent, the sinks as accent2.
  float sgn = smoothstep(-0.8, 0.8, phi - 0.2);

  if (u_light > 0.5) {
    // Ink on paper: tinted strokes, never a white wash. Pulses are saturated accent ink.
    vec3 inkA = mix(u_accent, u_fg, 0.15);
    vec3 inkB = mix(u_accent2, u_fg, 0.15);
    vec3 ink = mix(inkA, inkB, sgn);
    vec3 col = u_bg;
    col = mix(col, inkB, clamp(coresN * 0.06, 0.0, 0.2));
    col = mix(col, ink, clamp(lines * 0.5 + equi, 0.0, 0.55));
    col = mix(col, u_accent, clamp(dashInk * 0.5 + heads * 0.35, 0.0, 0.65));
    col = mix(col, inkA, clamp(plasma * 0.28, 0.0, 0.4));
    col = mix(col, inkA, clamp(arcs * 0.8, 0.0, 0.85));
    col = mix(col, inkA, clamp(ringLine * 0.6, 0.0, 0.6));
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  vec3 lineCol = mix(u_accent, u_accent2, sgn);
  vec3 glow = vec3(0.0);
  glow += lineCol * (lines + equi) * 0.75;
  glow += mix(lineCol, u_fg, 0.35) * heads * 0.9;
  glow += u_accent2 * coresN * 0.05;
  glow += u_accent * plasma * 0.6;
  glow += mix(u_accent, u_fg, 0.45) * arcs * 1.2;
  glow += mix(u_accent, u_accent2, 0.5) * ringLine * 0.8;
  // Soft tonemap so hot spots roll off instead of clipping.
  glow = 1.0 - exp(-glow * 1.4);
  vec3 col = u_bg + glow * (1.0 - u_bg * 0.6);
  gl_FragColor = vec4(col, 1.0);
}
`;

type V2 = [number, number];
type Layout = { p: V2; n: [V2, V2, V2] };

/* Charge layouts in uv (y up). Section layouts are written for text on the right, with the source
   parked in the left gutter; they mirror when the text sits on the left. In the hero the orb is the source. */
const HERO: Layout = { p: [0.73, 0.49], n: [[1.03, 0.04], [0.42, 1.1], [-0.06, 0.3]] };
const HERO_PHONE: Layout = { p: [0.5, 0.0], n: [[1.08, 0.6], [-0.08, 0.82], [0.5, 1.14]] };
const LAYOUTS: Layout[] = [
  { p: [0.05, 0.6], n: [[0.12, -0.06], [0.16, 1.08], [1.1, 0.3]] },
  { p: [0.04, 0.3], n: [[0.22, 1.07], [-0.08, 0.92], [1.08, 0.95]] },
  { p: [0.06, 0.45], n: [[0.26, -0.08], [1.1, 0.7], [0.02, 1.02]] },
  { p: [0.05, 0.72], n: [[0.3, 1.08], [1.08, 0.12], [-0.06, 0.05]] },
  { p: [0.04, 0.5], n: [[0.1, 1.1], [0.1, -0.1], [1.1, 0.5]] },
];
const TEXT_SEL = "h1,h2,h3,h4,p,li,dt,dd,blockquote,figcaption,label,.btn,td,th,pre";
const UNIFORMS = ["u_P", "u_M", "u_N1", "u_N2", "u_N3", "u_orb", "u_srcCore", "u_a1", "u_a2", "u_a3", "u_aw", "u_afull", "u_lines", "u_mask"];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const k = clamp01((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

interface Sim {
  loc: Record<string, WebGLUniformLocation | null>;
  tex: WebGLTexture | null;
  raw: HTMLCanvasElement;
  blur: HTMLCanvasElement;
  rects: number[][]; // x, document y, w, h in CSS px
  orb: number[] | null; // center x, document center y, rx, ry in CSS px
  sections: number[][]; // document top, bottom
  scanAt: number;
  maskKey: string;
  mirror: boolean;
  section: number;
  pos: number[]; // smoothed source and sinks (uv)
  ready: boolean;
}

// Measures text boxes, the orb and the sections in document coordinates (cheap, once a second).
function scan(sim: Sim) {
  const sy = window.scrollY;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  sim.rects = [];
  document.querySelectorAll(TEXT_SEL).forEach((el) => {
    if (el.closest(".bg-layer")) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (r.width > vw * 0.95 && r.height > vh * 0.6) return;
    sim.rects.push([r.left, r.top + sy, r.width, r.height]);
  });
  const dr = document.querySelector(".stage-disc")?.getBoundingClientRect();
  sim.orb = dr && dr.width > 0 ? [dr.left + dr.width / 2, dr.top + dr.height / 2 + sy, dr.width / 2, dr.height / 2] : null;
  sim.sections = [];
  document.querySelectorAll("main section").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 0) sim.sections.push([r.top + sy, r.bottom + sy]);
  });
}

// Paints the visible text boxes into a small feathered mask and works out which side holds the text.
function paintMask(gl: WebGLRenderingContext, sim: Sim, scrollY: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const mw = vw >= vh ? 128 : 64;
  const mh = Math.max(16, Math.min(256, Math.round((mw * vh) / vw)));
  for (const c of [sim.raw, sim.blur]) {
    if (c.width !== mw || c.height !== mh) {
      c.width = mw;
      c.height = mh;
    }
  }
  const ctx = sim.raw.getContext("2d");
  const bctx = sim.blur.getContext("2d");
  if (!ctx || !bctx) return;
  const kx = mw / vw;
  const ky = mh / vh;
  const pad = 14;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, mw, mh);
  ctx.fillStyle = "#fff";
  let left = 0;
  let right = 0;
  for (const [x = 0, y = 0, w = 0, h = 0] of sim.rects) {
    const top = y - scrollY;
    if (top > vh || top + h < 0) continue;
    ctx.fillRect((x - pad) * kx, (top - pad) * ky, (w + pad * 2) * kx, (h + pad * 2) * ky);
    const vis = (Math.min(top + h, vh) - Math.max(top, 0)) * w;
    if (x + w / 2 < vw / 2) left += vis;
    else right += vis;
  }
  bctx.filter = "blur(2px)";
  bctx.fillStyle = "#000";
  bctx.fillRect(0, 0, mw, mh);
  bctx.drawImage(sim.raw, 0, 0);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, sim.tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sim.blur);
  if (right > left * 1.3) sim.mirror = false;
  else if (left > right * 1.3) sim.mirror = true;
  const mid = scrollY + vh / 2;
  sim.sections.forEach(([a = 0, b = 0], i) => {
    if (mid >= a && mid < b) sim.section = i;
  });
}

function createSim(gl: WebGLRenderingContext, prog: WebGLProgram): Sim {
  const loc = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(prog, n)]));
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.uniform1i(loc.u_mask ?? null, 0);
  return {
    loc,
    tex,
    raw: document.createElement("canvas"),
    blur: document.createElement("canvas"),
    rects: [],
    orb: null,
    sections: [],
    scanAt: -1e9,
    maskKey: "",
    mirror: false,
    section: 0,
    pos: [],
    ready: false,
  };
}

function frame(gl: WebGLRenderingContext, sim: Sim, s: FrameState) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const asp = s.width / s.height;
  const phone = asp < 0.8;
  const now = performance.now();
  if (now - sim.scanAt > 1000) {
    scan(sim);
    sim.scanAt = now;
    sim.maskKey = "";
  }
  const key = `${s.scrollPx}|${vw}|${vh}`;
  if (key !== sim.maskKey) {
    paintMask(gl, sim, s.scrollPx);
    sim.maskKey = key;
  }

  // Orb in height units and how much it still owns the source as it scrolls away.
  let orbP: V2 | null = null;
  let orbRx = 0;
  let orbRy = 0;
  let orbW = 0;
  if (sim.orb) {
    const [ox = 0, oy = 0, rx = 0, ry = 0] = sim.orb;
    const y = 1 - (oy - s.scrollPx) / vh;
    orbP = [(ox / vw) * asp, y];
    orbRx = rx / vh;
    orbRy = ry / vh;
    orbW = (1 - smooth(1.2, 1.8, y)) * (1 - smooth(-0.2, -0.8, y));
  }
  const orbR = Math.min(orbRx, orbRy);

  // Target layout for the current section; charges glide to it.
  let lay: Layout = phone ? HERO_PHONE : HERO;
  let mirror = false;
  if (sim.section !== 0 || !orbP) {
    lay = LAYOUTS[Math.max(0, sim.section - 1) % LAYOUTS.length] ?? lay;
    mirror = sim.mirror;
  }
  const mx = (v: V2): V2 => (mirror ? [1 - v[0], v[1]] : v);
  const target = [mx(lay.p), mx(lay.n[0]), mx(lay.n[1]), mx(lay.n[2])].flat();
  const k = s.reducedMotion || !sim.ready ? 1 : 1 - Math.exp(-s.dt * 1.1);
  if (sim.pos.length !== target.length) sim.pos = [...target];
  for (let i = 0; i < target.length; i++) sim.pos[i] = (sim.pos[i] ?? 0) + ((target[i] ?? 0) - (sim.pos[i] ?? 0)) * k;
  sim.ready = true;

  // Positions in height units (x scaled by aspect), with a slow drift.
  const t = s.time;
  const at = (i: number): V2 => {
    const x = (sim.pos[i * 2] ?? 0) + 0.018 * Math.sin(t * 0.11 + i * 2.1);
    const y = (sim.pos[i * 2 + 1] ?? 0) + 0.03 * Math.cos(t * 0.09 + i * 1.3);
    return [x * asp, y];
  };
  let P = at(0);
  const N: [V2, V2, V2] = [at(1), at(2), at(3)];
  if (orbP) P = [P[0] + (orbP[0] - P[0]) * orbW, P[1] + (orbP[1] - P[1]) * orbW];

  // Cursor charge: rests near the orb until the pointer moves, and rides the rim instead of hiding behind the photo.
  const rest: V2 = phone ? [0.8, 0.12] : [0.9, 0.86];
  const mu: V2 = s.pointerActive ? s.pointer : [rest[0] + 0.02 * Math.sin(t * 0.2), rest[1] + 0.03 * Math.cos(t * 0.17)];
  let M: V2 = [mu[0] * asp, mu[1]];
  if (orbP) {
    const dx = M[0] - orbP[0];
    const dy = M[1] - orbP[1];
    const d = Math.hypot(dx / orbRx, dy / orbRy);
    if (d < 1.12 && d > 1e-4) M = [orbP[0] + (dx / d) * 1.12, orbP[1] + (dy / d) * 1.12];
  }

  // Lightning: rim (or source) to the nearest sink, cursor to the orb or a sink, and a third bolt.
  const useRim = orbP !== null && orbW > 0.5;
  const rimFrom = (to: V2): V2 => {
    if (!orbP || !useRim) return P;
    const d = Math.max(1e-4, dist(to, orbP));
    return [orbP[0] + ((to[0] - orbP[0]) / d) * orbR * 1.02, orbP[1] + ((to[1] - orbP[1]) / d) * orbR * 1.02];
  };
  const onScreen = (a: V2) => a[0] > -0.1 && a[0] < asp + 0.1 && a[1] > -0.1 && a[1] < 1.1;
  const byP = [...N].sort((a, b) => dist(a, P) - dist(b, P));
  const n0 = byP[0] ?? N[0];
  const n1 = byP[1] ?? N[1];
  const a1 = [...rimFrom(n0), ...n0];
  let a2: number[];
  let w2: number;
  let full2 = 0;
  const gap = orbP ? dist(M, orbP) - orbR : 1;
  if (useRim && gap > 0.07 && gap < 0.38) {
    a2 = [...rimFrom(M), ...M];
    w2 = 1.1;
    full2 = 1;
  } else {
    const nm = [...N].sort((a, b) => dist(a, M) - dist(b, M))[0] ?? n0;
    a2 = [...M, ...nm];
    w2 = 0.5 + 0.6 * (1 - smooth(0.35, 1.2, dist(M, nm)));
  }
  let a3 = [...rimFrom(n1), ...n1];
  let w3 = 0.5;
  let full3 = 0;
  for (let i = 0; i < 3; i++) {
    const a = N[i] ?? n0;
    const b = N[(i + 1) % 3] ?? n1;
    if (dist(a, b) < 0.5 && (onScreen(a) || onScreen(b))) {
      a3 = [...a, ...b];
      w3 = 0.7;
      full3 = 1;
    }
  }

  const u = sim.loc;
  const v4 = (n: string, a: number[]) => gl.uniform4f(u[n] ?? null, a[0] ?? 0, a[1] ?? 0, a[2] ?? 0, a[3] ?? 0);
  gl.uniform2f(u.u_P ?? null, P[0], P[1]);
  gl.uniform2f(u.u_M ?? null, M[0], M[1]);
  gl.uniform2f(u.u_N1 ?? null, N[0][0], N[0][1]);
  gl.uniform2f(u.u_N2 ?? null, N[1][0], N[1][1]);
  gl.uniform2f(u.u_N3 ?? null, N[2][0], N[2][1]);
  v4("u_orb", orbP ? [orbP[0], orbP[1], orbRx, orbRy] : [0, 0, 0, 0]);
  gl.uniform1f(u.u_srcCore ?? null, 1 - orbW);
  v4("u_a1", a1);
  v4("u_a2", a2);
  v4("u_a3", a3);
  gl.uniform3f(u.u_aw ?? null, 1, w2, w3);
  gl.uniform3f(u.u_afull ?? null, 0, full2, full3);
  gl.uniform1f(u.u_lines ?? null, phone ? 6 : 10);
}

export default function ForceField({ onFail, onReady }: BgProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const sim = useRef<Sim | null>(null);
  useShaderCanvas(ref, FRAG, {
    onFail,
    onReady,
    renderScale: 0.75,
    maxDpr: 1,
    extraUniforms: (gl, prog, s) => {
      if (!sim.current) sim.current = createSim(gl, prog);
      frame(gl, sim.current, s);
    },
  });
  return <canvas ref={ref} className="bg-canvas" />;
}

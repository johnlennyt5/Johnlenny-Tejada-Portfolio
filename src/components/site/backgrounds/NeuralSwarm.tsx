"use client";

import { useRef } from "react";
import type { BgProps } from "./BackgroundLayer";
import { useFrameLoop, type FrameState } from "./useShaderCanvas";

/*
 * Neural Swarm: a distributed system thinking out loud.
 * - Dust: a few thousand particles drift through a curl-noise flow field (sampled from a small
 *   velocity grid, rebuilt every few frames, so the main thread stays cheap).
 * - Hubs: a constellation of agents wired to their nearest neighbours. Signals (comets) hop
 *   from hub to hub, and a hub flashes when a signal lands.
 * - Focus: around the pointer (or an idle orbit around the portrait) particles gather into an
 *   orbiting cluster and link up like a neural network, with pulses firing along the links.
 * Scroll turns the flow and spins up a vortex, a click sends a shockwave and lights the network.
 * On dark palettes the cluster and signals leave short glowing trails in a half-res layer; on
 * light palettes everything is drawn as crisp colored ink with no trails.
 */

const PT = 5; // point vertex: x, y, hue, alpha, size
const LN = 8; // line vertex: x, y, hue, alpha, side, along, signal head, signal strength
const MAX_LINKS = 2200;
const LINK_DIST = 0.075;
const FOCUS_R = 0.48;
const LINK_R = 0.36;
const MAX_DEG = 3;
const CELLS = 20;
const GX = 64;
const GY = 40;
const MAX_HUBS = 30;
const MAX_COMETS = 6;
const HUB_D = 0.42;

const PT_VERT = `
attribute vec4 a;
attribute float s;
uniform float u_aspect;
uniform float u_psz;
varying vec2 v;
void main() {
  gl_Position = vec4(a.x / u_aspect * 2.0 - 1.0, a.y * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = s * u_psz;
  v = a.zw;
}`;

const COLOR = `
precision mediump float;
uniform vec3 u_accent;
uniform vec3 u_accent2;
uniform vec3 u_fg;
uniform float u_light;
vec3 tone(float t) {
  vec3 c = mix(u_accent, u_accent2, t);
  // Light palettes: deeper ink so it reads as drawn, not as haze.
  return mix(c, mix(c, u_fg, 0.35), u_light);
}
`;

// Modes: 0 dot, 1 soft halo, 2 hub (core plus ring).
const PT_FRAG = `${COLOR}
uniform float u_mode;
varying vec2 v;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r2 = dot(c, c) * 4.0;
  if (r2 > 1.0) discard;
  float a;
  float hot = 0.0;
  if (u_mode < 0.5) {
    float core = exp(-r2 * 9.0);
    float glow = (core + 0.3 * exp(-r2 * 2.5)) * (1.0 - r2);
    float disc = smoothstep(1.0, 0.45, r2);
    a = mix(glow, disc, u_light);
    hot = core * 0.4;
  } else if (u_mode < 1.5) {
    a = exp(-r2 * 3.5) * (1.0 - r2);
  } else {
    float r = sqrt(r2);
    float core = smoothstep(0.34, 0.2, r);
    float ring = exp(-pow((r - 0.74) / 0.08, 2.0)) * 0.75;
    float glow = exp(-r2 * 5.0) * 0.4 * (1.0 - u_light);
    a = core + ring + glow;
    hot = core * 0.55;
  }
  a *= v.y;
  vec3 col = mix(tone(v.x), u_fg, hot * (1.0 - u_light));
  gl_FragColor = vec4(col * a, a);
}`;

const LN_VERT = `
attribute vec4 a;
attribute vec4 b;
uniform float u_aspect;
varying vec2 v;
varying vec4 w;
void main() {
  gl_Position = vec4(a.x / u_aspect * 2.0 - 1.0, a.y * 2.0 - 1.0, 0.0, 1.0);
  v = a.zw;
  w = b;
}`;

// Thin soft quad; w.y runs 0..1 along the link and w.z is where a signal head sits.
const LN_FRAG = `${COLOR}
varying vec2 v;
varying vec4 w;
void main() {
  float edge = mix(1.0 - w.x * w.x, smoothstep(1.0, 0.4, abs(w.x)), u_light);
  float d = w.z - w.y;
  float head = exp(-d * d * 900.0);
  float tail = d > 0.0 && d < 0.6 ? exp(-d * 6.0) * (1.0 - d / 0.6) : 0.0;
  float sig = (head * 1.5 + tail * 0.5) * w.w;
  float a = edge * (v.y + sig);
  vec3 col = mix(tone(v.x), u_fg, head * w.w * 0.45 * (1.0 - u_light));
  gl_FragColor = vec4(col * a, a);
}`;

const QUAD_VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Half-res trail layer: decays every frame, with a small bias so 8-bit values reach zero.
const FADE_FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform float u_keep;
void main() {
  vec3 c = texture2D(u_tex, gl_FragCoord.xy / u_res).rgb;
  gl_FragColor = vec4(max(c * u_keep - 1.5 / 255.0, 0.0), 1.0);
}`;

// Final background: palette base, focus glow, trail layer and the click shockwave.
const COMP_FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform vec3 u_bg;
uniform vec3 u_fg;
uniform vec3 u_accent;
uniform vec3 u_accent2;
uniform float u_light;
uniform float u_trail;
uniform vec3 u_focus;
uniform vec3 u_click;
float ring(float d, float age) {
  if (age < 0.0 || age > 2.2) return 0.0;
  float w = 0.006 + age * 0.016;
  float x = (d - age * 0.62) / w;
  return exp(-x * x) * exp(-age * 1.8);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 fd = (uv - u_focus.xy) * vec2(asp, 1.0);
  float g = exp(-dot(fd, fd) * 7.0) * u_focus.z;
  float edge = smoothstep(0.5, 1.15, uv.x) * (0.55 + 0.45 * uv.y);
  vec3 ink = mix(u_accent, u_fg, 0.35);
  vec3 col = u_bg;
  vec3 dark = col + texture2D(u_tex, uv).rgb * u_trail + u_accent2 * g * 0.06 + u_accent * edge * 0.03;
  vec3 light = mix(col, u_accent, g * 0.05 + edge * 0.02);
  col = mix(dark, light, u_light);
  float d = length((uv - u_click.xy) * vec2(asp, 1.0));
  float r = ring(d, u_click.z) * 0.9 + ring(d, u_click.z - 0.12) * 0.45;
  col = mix(col + mix(u_accent, u_accent2, 0.35) * r * 1.1, mix(col, ink, r * 0.55), u_light);
  gl_FragColor = vec4(col, 1.0);
}`;

type Uniforms = Record<string, WebGLUniformLocation | null>;

interface Sim {
  n: number;
  px: Float32Array;
  py: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  z: Float32Array;
  ring: Float32Array;
  hue: Float32Array;
  spin: Float32Array;
  near: Float32Array;
  // Link grid (counting sort on typed arrays, no per-frame allocation).
  deg: Uint8Array;
  cellOf: Int16Array;
  cand: Uint16Array;
  sorted: Uint16Array;
  cellStart: Int32Array;
  cellCount: Int32Array;
  // Flow velocity grid.
  fu: Float32Array;
  fv: Float32Array;
}

interface Hubs {
  n: number;
  ax: Float32Array;
  ay: Float32Array;
  ph: Float32Array;
  x: Float32Array;
  y: Float32Array;
  alpha: Float32Array;
  flash: Float32Array;
  adj: Uint8Array;
  near0: number;
  near1: number;
}

interface Comet {
  on: boolean;
  a: number; // -1 means the focus cluster
  b: number;
  t0: number;
  dur: number;
  hops: number;
}

interface Gl {
  gl: WebGLRenderingContext;
  pts: WebGLProgram;
  lines: WebGLProgram;
  fade: WebGLProgram;
  comp: WebGLProgram;
  uPts: Uniforms;
  uLines: Uniforms;
  uFade: Uniforms;
  uComp: Uniforms;
  tex: [WebGLTexture, WebGLTexture];
  fbo: [WebGLFramebuffer, WebGLFramebuffer];
  cur: number;
  tw: number;
  th: number;
  quad: WebGLBuffer;
  ptBuf: WebGLBuffer;
  lnBuf: WebGLBuffer;
  ptData: Float32Array;
  lnData: Float32Array;
}

interface Focus {
  x: number;
  y: number;
  on: number;
  sc: number;
}

interface Mem {
  warm: boolean;
  clickAge: number;
  scrollPx: number;
  fx: number;
  fy: number;
  aspect: number;
  frame: number;
  boost: number;
  vort: number;
  nextComet: number;
  comets: Comet[];
  hubs: Hubs | null;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function makeSim(n: number, aspect: number): Sim {
  const sim: Sim = {
    n,
    px: new Float32Array(n),
    py: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    z: new Float32Array(n),
    ring: new Float32Array(n),
    hue: new Float32Array(n),
    spin: new Float32Array(n),
    near: new Float32Array(n),
    deg: new Uint8Array(n),
    cellOf: new Int16Array(n),
    cand: new Uint16Array(n),
    sorted: new Uint16Array(n),
    cellStart: new Int32Array(CELLS * CELLS + 1),
    cellCount: new Int32Array(CELLS * CELLS),
    fu: new Float32Array(GX * GY),
    fv: new Float32Array(GX * GY),
  };
  // Seeded so the still frame is the same on every load.
  const rnd = rng(1337);
  for (let i = 0; i < n; i++) {
    sim.px[i] = rnd() * aspect;
    sim.py[i] = rnd();
    sim.z[i] = rnd() * rnd();
    sim.ring[i] = 0.08 + 0.1 * Math.sqrt(rnd());
    sim.hue[i] = rnd();
    sim.spin[i] = rnd() < 0.85 ? 1 : -0.6;
  }
  return sim;
}

function makeHubs(narrow: boolean): Hubs {
  const cols = narrow ? 3 : 6;
  const rows = narrow ? 6 : 5;
  const n = Math.min(MAX_HUBS, cols * rows);
  const h: Hubs = {
    n,
    ax: new Float32Array(n),
    ay: new Float32Array(n),
    ph: new Float32Array(n),
    x: new Float32Array(n),
    y: new Float32Array(n),
    alpha: new Float32Array(n),
    flash: new Float32Array(n),
    adj: new Uint8Array(n * n),
    near0: 0,
    near1: 1,
  };
  const rnd = rng(4242);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      // Jittered grid over a band slightly taller than the screen, so hubs can wrap off screen.
      h.ax[i] = (c + 0.5 + (rnd() - 0.5) * 0.7) / cols;
      h.ay[i] = -0.1 + ((r + 0.5 + (rnd() - 0.5) * 0.7) / rows) * 1.2;
      h.ph[i] = rnd() * 6.283;
    }
  }
  return h;
}

/* Rebuilds the flow grid: the curl of a layered sine stream function, turned and roughened by scroll. */
function buildFlow(sim: Sim, t: number, scroll: number, aspect: number, light: number) {
  const ang = scroll * 2.4;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const turb = light ? 1 + scroll * 1.2 : 1 + scroll * 2.2;
  const freq = 1 + scroll * 0.6;
  const kC = 0.12 * turb * 5.3;
  for (let gy = 0; gy < GY; gy++) {
    const y = -0.05 + (gy / (GY - 1)) * 1.1;
    for (let gx = 0; gx < GX; gx++) {
      const x = -0.05 + (gx / (GX - 1)) * (aspect + 0.1);
      const rx = (x * ca - y * sa) * freq;
      const ry = (x * sa + y * ca) * freq;
      const s1 = 1.3 * ry - 0.17 * t;
      const cA = 0.55 * Math.cos(1.6 * rx + 0.21 * t + Math.sin(s1));
      const cB = 0.35 * Math.cos(2.7 * ry - 0.23 * t + 1.1 * rx);
      const cC = kC * Math.cos(5.3 * (rx + ry) + 0.4 * t);
      const dx = cA * 1.6 + cB * 1.1 + cC;
      const dy = cA * 1.3 * Math.cos(s1) + cB * 2.7 + cC;
      const k = gy * GX + gx;
      sim.fu[k] = dy * ca - dx * sa;
      sim.fv[k] = -dy * sa - dx * ca;
    }
  }
}

function step(sim: Sim, dt: number, aspect: number, f: Focus, burst: [number, number] | null, scrollDy: number, vort: number) {
  const { n, px, py, vx, vy, z, ring, spin, near, fu, fv } = sim;
  const relax = Math.min(1, dt * 2.0);
  const FR = FOCUS_R * f.sc;
  const R2 = FR * FR;
  const sx = (GX - 1) / (aspect + 0.1);
  const sy = (GY - 1) / 1.1;
  const vcx = 0.52 * aspect;
  for (let i = 0; i < n; i++) {
    const x = px[i]!;
    const y = py[i]!;
    const zi = z[i]!;
    // Bilinear sample of the flow grid.
    const gxf = Math.min(GX - 1.001, Math.max(0, (x + 0.05) * sx));
    const gyf = Math.min(GY - 1.001, Math.max(0, (y + 0.05) * sy));
    const i0 = gxf | 0;
    const j0 = gyf | 0;
    const fx = gxf - i0;
    const fy = gyf - j0;
    const k = j0 * GX + i0;
    const u0 = fu[k]! + (fu[k + 1]! - fu[k]!) * fx;
    const u1 = fu[k + GX]! + (fu[k + GX + 1]! - fu[k + GX]!) * fx;
    const v0 = fv[k]! + (fv[k + 1]! - fv[k]!) * fx;
    const v1 = fv[k + GX]! + (fv[k + GX + 1]! - fv[k + GX]!) * fx;
    const speed = 0.026 * (0.55 + 0.9 * zi);
    let tx = (u0 + (u1 - u0) * fy) * speed;
    let ty = (v0 + (v1 - v0) * fy) * speed;
    // Scroll vortex in the gutter between the text column and the right side.
    if (vort !== 0) {
      const ox = x - vcx;
      const oy = y - 0.5;
      const w = vort * Math.exp(-(ox * ox + oy * oy) * 5);
      tx += -oy * w;
      ty += ox * w;
    }
    let ax = vx[i]! + (tx - vx[i]!) * relax;
    let ay = vy[i]! + (ty - vy[i]!) * relax;

    // Focus: spring toward a personal orbit radius plus a tangential swirl.
    const dx = x - f.x;
    const dy = y - f.y;
    const r2 = dx * dx + dy * dy;
    let nr = 0;
    if (f.on > 0 && r2 < R2 && r2 > 1e-8) {
      const r = Math.sqrt(r2);
      const f0 = 1 - r / FR;
      nr = f0 * f.on;
      const kk = f0 * f0 * f.on * dt * 3.4;
      const pull = (r - ring[i]! * f.sc) * 1.7;
      const sw = 0.22 * spin[i]! * (0.6 + zi) * f.sc;
      ax += ((-dx / r) * pull + (-dy / r) * sw) * kk;
      ay += ((-dy / r) * pull + (dx / r) * sw) * kk;
    }
    near[i] = nr;
    if (burst) {
      const ex = x - burst[0];
      const ey = y - burst[1];
      const r = Math.sqrt(ex * ex + ey * ey) + 1e-4;
      const im = 0.55 * Math.exp(-r / 0.13) * (0.6 + zi);
      ax += (ex / r) * im;
      ay += (ey / r) * im;
    }
    vx[i] = ax;
    vy[i] = ay;
    let nx = x + ax * dt;
    // Scroll parallax: nearer particles slide further with the page.
    let ny = y + ay * dt + scrollDy * (0.1 + 0.3 * zi);
    if (nx < -0.02) nx += aspect + 0.04;
    else if (nx > aspect + 0.02) nx -= aspect + 0.04;
    if (ny < -0.02) ny += 1.04;
    else if (ny > 1.02) ny -= 1.04;
    px[i] = nx;
    py[i] = ny;
  }
}

/* Hub positions, neighbour graph, and the two hubs nearest the focus. */
function updateHubs(h: Hubs, t: number, aspect: number, scrollPx: number, f: Focus, narrow: boolean, dt: number) {
  const drift = (scrollPx / Math.max(1, window.innerHeight)) * 0.12;
  for (let i = 0; i < h.n; i++) {
    const ph = h.ph[i]!;
    let y = h.ay[i]! + 0.03 * Math.sin(t * 0.11 + ph * 1.7) + drift;
    y = ((((y + 0.1) % 1.2) + 1.2) % 1.2) - 0.1;
    const xn = h.ax[i]! + 0.025 * Math.sin(t * 0.09 + ph);
    h.x[i] = xn * aspect;
    h.y[i] = y;
    // Quieter behind the hero text column, fading out at the top and bottom wrap.
    const side = narrow ? 0.75 : 0.32 + 0.68 * Math.min(1, Math.max(0, (xn - 0.12) / 0.5));
    const ends = Math.min(1, Math.max(0, (y + 0.06) / 0.12)) * Math.min(1, Math.max(0, (1.06 - y) / 0.12));
    h.alpha[i] = side * ends;
    h.flash[i] = h.flash[i]! * Math.exp(-dt * 3);
  }
  h.adj.fill(0);
  const D2 = HUB_D * HUB_D * (narrow ? 0.6 : 1);
  for (let i = 0; i < h.n; i++) {
    // Three nearest neighbours within range.
    let b0 = -1;
    let b1 = -1;
    let b2 = -1;
    let d0 = D2;
    let d1 = D2;
    let d2 = D2;
    for (let j = 0; j < h.n; j++) {
      if (j === i) continue;
      const dx = h.x[j]! - h.x[i]!;
      const dy = h.y[j]! - h.y[i]!;
      const d = dx * dx + dy * dy;
      if (d < d0) {
        b2 = b1;
        d2 = d1;
        b1 = b0;
        d1 = d0;
        b0 = j;
        d0 = d;
      } else if (d < d1) {
        b2 = b1;
        d2 = d1;
        b1 = j;
        d1 = d;
      } else if (d < d2) {
        b2 = j;
        d2 = d;
      }
    }
    if (b0 >= 0) h.adj[i * h.n + b0] = h.adj[b0 * h.n + i] = 1;
    if (b1 >= 0) h.adj[i * h.n + b1] = h.adj[b1 * h.n + i] = 1;
    if (b2 >= 0) h.adj[i * h.n + b2] = h.adj[b2 * h.n + i] = 1;
  }
  let n0 = 0;
  let n1 = 1;
  let e0 = 1e9;
  let e1 = 1e9;
  for (let i = 0; i < h.n; i++) {
    if (h.alpha[i]! < 0.2) continue;
    const dx = h.x[i]! - f.x;
    const dy = h.y[i]! - f.y;
    const d = dx * dx + dy * dy;
    if (d < e0) {
      n1 = n0;
      e1 = e0;
      n0 = i;
      e0 = d;
    } else if (d < e1) {
      n1 = i;
      e1 = d;
    }
  }
  h.near0 = n0;
  h.near1 = n1;
}

/* Where a comet endpoint sits: a hub, or the rim of the focus cluster facing its nearest hub. */
function endpoint(h: Hubs, f: Focus, i: number, out: [number, number]) {
  if (i < 0) {
    const dx = h.x[h.near0]! - f.x;
    const dy = h.y[h.near0]! - f.y;
    const d = Math.sqrt(dx * dx + dy * dy) + 1e-6;
    out[0] = f.x + (dx / d) * 0.1 * f.sc;
    out[1] = f.y + (dy / d) * 0.1 * f.sc;
  } else {
    out[0] = h.x[i]!;
    out[1] = h.y[i]!;
  }
  return out;
}

function pickNeighbour(h: Hubs, at: number, not: number) {
  let count = 0;
  let pick = -1;
  for (let j = 0; j < h.n; j++) {
    if (j === not || !h.adj[at * h.n + j] || h.alpha[j]! < 0.15) continue;
    count++;
    if (Math.random() * count < 1) pick = j;
  }
  return pick;
}

const PA: [number, number] = [0, 0];
const PB: [number, number] = [0, 0];

function launch(c: Comet, h: Hubs, f: Focus, a: number, b: number, t: number, hops: number) {
  endpoint(h, f, a, PA);
  endpoint(h, f, b, PB);
  const d = Math.hypot(PB[0] - PA[0], PB[1] - PA[1]);
  c.on = true;
  c.a = a;
  c.b = b;
  c.t0 = t;
  c.dur = Math.min(1.3, Math.max(0.4, d / 0.36));
  c.hops = hops;
}

/* Signals between hubs: spawn, advance, hop onward or end with a flash. */
function updateComets(m: Mem, h: Hubs, t: number, f: Focus, aspect: number) {
  if (t > m.nextComet) {
    const c = m.comets.find((k) => !k.on);
    if (c) {
      if (f.on > 0 && Math.random() < 0.4) launch(c, h, f, -1, h.near0, t, 0);
      else {
        // Prefer hubs on the open right side, away from the hero text.
        for (let tries = 0; tries < 8; tries++) {
          const a = (Math.random() * h.n) | 0;
          if (h.alpha[a]! < 0.5 || h.x[a]! / aspect < 0.4) continue;
          const b = pickNeighbour(h, a, -1);
          if (b >= 0) {
            launch(c, h, f, a, b, t, 0);
            break;
          }
        }
      }
    }
    m.nextComet = t + 0.8 + Math.random() * 1.4;
  }
  for (const c of m.comets) {
    if (!c.on || t - c.t0 < c.dur) continue;
    h.flash[c.b] = 1;
    const next = c.hops < 4 && Math.random() < 0.7 ? pickNeighbour(h, c.b, c.a) : -1;
    if (next >= 0) launch(c, h, f, c.b, next, t, c.hops + 1);
    else c.on = false;
  }
}

function draw(g: Gl, sim: Sim, m: Mem, s: FrameState, t: number, aspect: number, f: Focus, keep: number, narrow: boolean) {
  const { gl, ptData, lnData } = g;
  const h = m.hubs!;
  const light = s.palette.light;
  const { n, px, py, z, hue, near } = sim;
  const dpr = s.width / Math.max(1, window.innerWidth);
  const boost = m.boost;

  // Point segments in one buffer: cluster | comet heads | hubs | halos | dust.
  const oHead = n;
  const oHub = oHead + MAX_COMETS;
  const oHalo = oHub + MAX_HUBS;
  const oDust = oHalo + n;
  let nCl = 0;
  let nHalo = 0;
  let nDust = 0;
  const LR = LINK_R * f.sc * (1 + 0.35 * boost);
  const LR2 = LR * LR;
  const LD = LINK_DIST * (narrow ? 0.75 : 1);
  const G = Math.min(CELLS, Math.ceil((2 * LR) / LD));
  const gx0 = f.x - LR;
  const gy0 = f.y - LR;
  sim.cellCount.fill(0);
  let nc = 0;
  for (let i = 0; i < n; i++) {
    const x = px[i]!;
    const y = py[i]!;
    const zi = z[i]!;
    const nr = near[i]!;
    const xn = x / aspect;
    // Calmer behind the hero text on the left, livelier toward the right and at the focus.
    const side = narrow ? 0.7 : 0.35 + 0.65 * Math.min(1, Math.max(0, (xn - 0.1) / 0.5));
    const tw = 0.82 + 0.18 * Math.sin(t * 2.3 + i * 1.7);
    let o: number;
    if (nr > 0.12) {
      o = nCl++ * PT;
      ptData[o + 2] = light ? 0 : Math.min(1, 0.2 * hue[i]! + nr * 1.15);
      ptData[o + 3] = Math.min(1, light ? (0.3 + 0.4 * zi) * side + nr * 0.6 : ((0.2 + 0.45 * zi) * side + nr * 0.95) * tw);
      ptData[o + 4] = (1.6 + 3.4 * zi + nr * 2.2) * dpr;
      if (nr > 0.3 && !narrow) {
        const q = (oHalo + nHalo++) * PT;
        ptData[q] = x;
        ptData[q + 1] = y;
        ptData[q + 2] = ptData[o + 2]!;
        ptData[q + 3] = light ? 0.05 : 0.09;
        ptData[q + 4] = ptData[o + 4]! * 3.2;
      }
    } else {
      o = (oDust + nDust++) * PT;
      ptData[o + 2] = light ? (zi < 0.09 ? 0.9 : 0) : hue[i]! * 0.5;
      ptData[o + 3] = light ? (0.22 + 0.35 * zi) * side : (0.14 + 0.42 * zi) * side * tw;
      ptData[o + 4] = (light ? 1.5 + 2.2 * zi : 1.4 + 3.2 * zi) * dpr;
    }
    ptData[o] = x;
    ptData[o + 1] = y;
    // Bin the ones near the focus into the link grid.
    const dx = x - f.x;
    const dy = y - f.y;
    if (f.on > 0 && dx * dx + dy * dy < LR2) {
      const cx = Math.floor((x - gx0) / LD);
      const cy = Math.floor((y - gy0) / LD);
      if (cx >= 0 && cy >= 0 && cx < G && cy < G) {
        const c = cy * G + cx;
        sim.cellOf[i] = c;
        sim.cellCount[c] = sim.cellCount[c]! + 1;
        sim.cand[nc++] = i;
        sim.deg[i] = 0;
      }
    }
  }
  // Counting sort of the candidates by cell.
  let acc = 0;
  for (let c = 0; c < G * G; c++) {
    sim.cellStart[c] = acc;
    acc += sim.cellCount[c]!;
    sim.cellCount[c] = 0;
  }
  sim.cellStart[G * G] = acc;
  for (let k = 0; k < nc; k++) {
    const i = sim.cand[k]!;
    const c = sim.cellOf[i]!;
    sim.sorted[sim.cellStart[c]! + sim.cellCount[c]!] = i;
    sim.cellCount[c] = sim.cellCount[c]! + 1;
  }

  // Line quads.
  let links = 0;
  const px1 = dpr / Math.max(1, s.height);
  const quad = (x1: number, y1: number, x2: number, y2: number, hc: number, al: number, half: number, head: number, amp: number) => {
    if (links >= MAX_LINKS) return;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) + 1e-6;
    const nx = (-dy / len) * half * px1;
    const ny = (dx / len) * half * px1;
    let o = links * LN * 6;
    for (let c = 0; c < 6; c++) {
      const end = c === 1 || c === 2 || c === 4 ? 1 : 0;
      const sd = c === 0 || c === 1 || c === 3 ? -1 : 1;
      lnData[o++] = (end ? x2 : x1) + nx * sd;
      lnData[o++] = (end ? y2 : y1) + ny * sd;
      lnData[o++] = hc;
      lnData[o++] = al;
      lnData[o++] = sd;
      lnData[o++] = end;
      lnData[o++] = head;
      lnData[o++] = amp;
    }
    links++;
  };

  // Hub constellation links.
  for (let i = 0; i < h.n; i++) {
    for (let j = i + 1; j < h.n; j++) {
      if (!h.adj[i * h.n + j]) continue;
      const al = Math.min(h.alpha[i]!, h.alpha[j]!) * (light ? 0.2 : 0.13) * (1 + 0.6 * boost);
      if (al < 0.01) continue;
      quad(h.x[i]!, h.y[i]!, h.x[j]!, h.y[j]!, light ? 0 : 0.25, al, light ? 0.7 : 1.3, -9, 0);
    }
  }
  // Bridges from the cluster to its two nearest hubs.
  if (f.on > 0) {
    const r0 = 0.1 * f.sc;
    for (const k of [h.near0, h.near1]) {
      const dx = h.x[k]! - f.x;
      const dy = h.y[k]! - f.y;
      const d = Math.sqrt(dx * dx + dy * dy) + 1e-6;
      if (d < r0 * 1.5) continue;
      const al = (light ? 0.24 : 0.16) * h.alpha[k]! * f.on;
      quad(f.x + (dx / d) * r0, f.y + (dy / d) * r0, h.x[k]!, h.y[k]!, light ? 0 : 0.6, al, light ? 0.8 : 1.3, -9, 0);
    }
  }
  // Comets: a brighter quad along their path carrying the moving head, plus a head sprite.
  let nHead = 0;
  for (const c of m.comets) {
    if (!c.on) continue;
    endpoint(h, f, c.a, PA);
    endpoint(h, f, c.b, PB);
    const p = Math.min(1, (t - c.t0) / c.dur);
    const e = p * p * (3 - 2 * p);
    const al = c.a < 0 ? 1 : Math.max(0.35, Math.min(h.alpha[c.a]!, h.alpha[c.b]!));
    quad(PA[0], PA[1], PB[0], PB[1], light ? 0 : 0.85, (light ? 0.06 : 0.05) * al, light ? 1.6 : 2.6, e, light ? 0.8 * al : al);
    const o = (oHead + nHead++) * PT;
    ptData[o] = PA[0] + (PB[0] - PA[0]) * e;
    ptData[o + 1] = PA[1] + (PB[1] - PA[1]) * e;
    ptData[o + 2] = light ? 0 : 1;
    ptData[o + 3] = al * (light ? 0.85 : 1);
    ptData[o + 4] = (light ? 5 : 7) * dpr;
  }

  // Cluster links: close neighbours inside the link radius, at most MAX_DEG each.
  const L2 = LD * LD;
  const lAlpha = (light ? 0.35 : 0.6) * (1 + 0.9 * boost);
  const lHalf = light ? 0.75 : 1.5;
  for (let cy = 0; cy < G && links < MAX_LINKS; cy++) {
    for (let cx = 0; cx < G; cx++) {
      const c = cy * G + cx;
      const s0 = sim.cellStart[c]!;
      const s1 = sim.cellStart[c + 1]!;
      if (s0 === s1) continue;
      for (let q = 0; q < 5; q++) {
        // Own cell plus four forward neighbours, so each pair is visited once.
        const ncx = cx + (q === 1 || q === 4 ? 1 : q === 2 ? -1 : 0);
        const ncy = cy + (q >= 2 ? 1 : 0);
        if (ncx < 0 || ncx >= G || ncy >= G) continue;
        const nc2 = ncy * G + ncx;
        const same = q === 0;
        const t0 = sim.cellStart[nc2]!;
        const t1 = sim.cellStart[nc2 + 1]!;
        for (let a = s0; a < s1; a++) {
          const i = sim.sorted[a]!;
          if (sim.deg[i]! >= MAX_DEG) continue;
          const xi = px[i]!;
          const yi = py[i]!;
          for (let b = same ? a + 1 : t0; b < t1; b++) {
            const j = sim.sorted[b]!;
            if (sim.deg[j]! >= MAX_DEG) continue;
            const dx = px[j]! - xi;
            const dy = py[j]! - yi;
            const d2 = dx * dx + dy * dy;
            if (d2 > L2) continue;
            const mx = xi + dx * 0.5 - f.x;
            const my = yi + dy * 0.5 - f.y;
            const fr = 1 - Math.sqrt(mx * mx + my * my) / LR;
            if (fr <= 0) continue;
            // Softer over the hero text column so the name and intro stay clean.
            const xn = (xi + dx * 0.5) / aspect;
            const calm = narrow ? 0.8 : 0.45 + 0.55 * Math.min(1, Math.max(0, (xn - 0.3) / 0.25));
            const al = Math.sqrt(1 - Math.sqrt(d2) / LD) * Math.min(1, fr * 1.6) * f.on * lAlpha * calm;
            // A third of the links carry a travelling pulse.
            const hsh = (((i * 73856093) ^ (j * 19349663)) >>> 0) % 997;
            const head = hsh % 3 === 0 ? ((t * (0.5 + (hsh % 7) * 0.08) + hsh * 0.013) % 3) - 0.8 : -9;
            quad(xi, yi, xi + dx, yi + dy, light ? 0 : Math.min(1, 0.35 + fr * 0.6), al, lHalf, head, light ? 0.6 : 0.9);
            sim.deg[i] = sim.deg[i]! + 1;
            sim.deg[j] = sim.deg[j]! + 1;
            if (sim.deg[i]! >= MAX_DEG || links >= MAX_LINKS) break;
          }
          if (links >= MAX_LINKS) break;
        }
      }
    }
  }

  // Hubs: breathing core plus ring, flashing when a signal lands.
  let nHub = 0;
  for (let i = 0; i < h.n; i++) {
    const al = h.alpha[i]!;
    if (al < 0.03) continue;
    const br = 0.75 + 0.25 * Math.sin(t * 1.1 + h.ph[i]! * 3);
    const fl = h.flash[i]!;
    const o = (oHub + nHub++) * PT;
    ptData[o] = h.x[i]!;
    ptData[o + 1] = h.y[i]!;
    ptData[o + 2] = light ? 0 : 0.3 + 0.7 * fl;
    ptData[o + 3] = Math.min(1, al * (light ? 0.7 : 0.75) * br + fl * 0.8 * al);
    ptData[o + 4] = (narrow ? 8 : 11) * (1 + 0.5 * fl) * dpr;
  }

  // Upload only what is used.
  gl.bindBuffer(gl.ARRAY_BUFFER, g.ptBuf);
  const up = (first: number, count: number) => {
    if (count > 0) gl.bufferSubData(gl.ARRAY_BUFFER, first * PT * 4, ptData.subarray(first * PT, (first + count) * PT));
  };
  up(0, nCl);
  up(oHead, nHead);
  up(oHub, nHub);
  up(oHalo, nHalo);
  up(oDust, nDust);
  if (links > 0) {
    gl.bindBuffer(gl.ARRAY_BUFFER, g.lnBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, lnData.subarray(0, links * LN * 6));
  }

  const { bg, accent, accent2, fg } = s.palette;
  const setCommon = (p: WebGLProgram, u: Uniforms) => {
    gl.useProgram(p);
    gl.uniform1f(u.u_aspect!, aspect);
    gl.uniform3f(u.u_accent!, ...accent);
    gl.uniform3f(u.u_accent2!, ...accent2);
    gl.uniform3f(u.u_fg!, ...fg);
    gl.uniform1f(u.u_light!, light);
  };
  const bindPts = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, g.ptBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, PT * 4, 0);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, PT * 4, 16);
  };
  const bindQuad = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, g.quad);
    gl.disableVertexAttribArray(1);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  };

  // Trail layer (dark palettes only): decay last frame, then add the cluster and comet heads.
  const tw = Math.max(1, s.width >> 1);
  const th = Math.max(1, s.height >> 1);
  if (g.tw !== tw || g.th !== th) {
    for (const tx of g.tex) {
      gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    for (const fb of g.fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    g.tw = tw;
    g.th = th;
  }
  const useTrail = !light;
  if (useTrail) {
    const dst = 1 - g.cur;
    gl.bindFramebuffer(gl.FRAMEBUFFER, g.fbo[dst]!);
    gl.viewport(0, 0, tw, th);
    gl.disable(gl.BLEND);
    gl.useProgram(g.fade);
    gl.bindTexture(gl.TEXTURE_2D, g.tex[g.cur]!);
    gl.uniform2f(g.uFade.u_res!, tw, th);
    gl.uniform1f(g.uFade.u_keep!, keep);
    bindQuad();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    setCommon(g.pts, g.uPts);
    gl.uniform1f(g.uPts.u_psz!, 0.5);
    gl.uniform1f(g.uPts.u_mode!, 0);
    bindPts();
    if (nCl > 0) gl.drawArrays(gl.POINTS, 0, nCl);
    if (nHead > 0) gl.drawArrays(gl.POINTS, oHead, nHead);
    g.cur = dst;
  }

  // Composite to the screen.
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, s.width, s.height);
  gl.disable(gl.BLEND);
  gl.useProgram(g.comp);
  gl.bindTexture(gl.TEXTURE_2D, g.tex[g.cur]!);
  const uc = g.uComp;
  gl.uniform2f(uc.u_res!, s.width, s.height);
  gl.uniform3f(uc.u_bg!, ...bg);
  gl.uniform3f(uc.u_fg!, ...fg);
  gl.uniform3f(uc.u_accent!, ...accent);
  gl.uniform3f(uc.u_accent2!, ...accent2);
  gl.uniform1f(uc.u_light!, light);
  gl.uniform1f(uc.u_trail!, useTrail ? 0.8 : 0);
  gl.uniform3f(uc.u_focus!, f.x / aspect, f.y, f.on);
  gl.uniform3f(uc.u_click!, s.click[0], s.click[1], s.click[2]);
  bindQuad();
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  // Additive glow on dark palettes, ink over the background on light ones.
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, light ? gl.ONE_MINUS_SRC_ALPHA : gl.ONE);
  if (links > 0) {
    setCommon(g.lines, g.uLines);
    gl.bindBuffer(gl.ARRAY_BUFFER, g.lnBuf);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, LN * 4, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, LN * 4, 16);
    gl.drawArrays(gl.TRIANGLES, 0, links * 6);
  }
  setCommon(g.pts, g.uPts);
  gl.uniform1f(g.uPts.u_psz!, 1);
  bindPts();
  gl.uniform1f(g.uPts.u_mode!, 1);
  if (nHalo > 0) gl.drawArrays(gl.POINTS, oHalo, nHalo);
  gl.uniform1f(g.uPts.u_mode!, 0);
  if (nDust > 0) gl.drawArrays(gl.POINTS, oDust, nDust);
  if (nCl > 0) gl.drawArrays(gl.POINTS, 0, nCl);
  gl.uniform1f(g.uPts.u_mode!, 2);
  if (nHub > 0) gl.drawArrays(gl.POINTS, oHub, nHub);
  gl.uniform1f(g.uPts.u_mode!, 0);
  if (nHead > 0) gl.drawArrays(gl.POINTS, oHead, nHead);
}

/* A click flashes the hub nearest to it and fires signals out along its links. */
function clickBurst(m: Mem, h: Hubs, f: Focus, bx: number, by: number, t: number) {
  let best = 0;
  let bd = 1e9;
  for (let i = 0; i < h.n; i++) {
    const d = (h.x[i]! - bx) ** 2 + (h.y[i]! - by) ** 2;
    if (d < bd && h.alpha[i]! > 0.2) {
      bd = d;
      best = i;
    }
  }
  h.flash[best] = 1;
  let fired = 0;
  for (let j = 0; j < h.n && fired < 3; j++) {
    if (!h.adj[best * h.n + j] || h.alpha[j]! < 0.15) continue;
    const c = m.comets.find((k) => !k.on);
    if (!c) break;
    launch(c, h, f, best, j, t, 2);
    c.dur *= 0.6;
    fired++;
  }
}

export default function NeuralSwarm({ onFail, onReady }: BgProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<Gl | null>(null);
  const simRef = useRef<Sim | null>(null);
  const mem = useRef<Mem>({
    warm: false,
    clickAge: 1e4,
    scrollPx: 0,
    fx: 0.7,
    fy: 0.6,
    aspect: 1.6,
    frame: 0,
    boost: 0,
    vort: 0,
    nextComet: 0,
    comets: Array.from({ length: MAX_COMETS }, () => ({ on: false, a: 0, b: 0, t0: 0, dur: 1, hops: 0 })),
    hubs: null,
  });

  useFrameLoop(
    ref,
    (canvas) => {
      const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
      if (!gl) return false;
      const compile = (type: number, src: string) => {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          console.warn("[background] shader error:", gl.getShaderInfoLog(sh));
          return null;
        }
        return sh;
      };
      const link = (vsrc: string, fsrc: string, attrs: string[], uniforms: string[]) => {
        const vs = compile(gl.VERTEX_SHADER, vsrc);
        const fs = compile(gl.FRAGMENT_SHADER, fsrc);
        if (!vs || !fs) return null;
        const p = gl.createProgram()!;
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        attrs.forEach((name, i) => gl.bindAttribLocation(p, i, name));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
        const u: Uniforms = Object.fromEntries(uniforms.map((name) => [name, gl.getUniformLocation(p, name)]));
        return { p, u };
      };
      const common = ["u_aspect", "u_accent", "u_accent2", "u_fg", "u_light"];
      const pts = link(PT_VERT, PT_FRAG, ["a", "s"], [...common, "u_psz", "u_mode"]);
      const lines = link(LN_VERT, LN_FRAG, ["a", "b"], common);
      const fade = link(QUAD_VERT, FADE_FRAG, ["p"], ["u_tex", "u_res", "u_keep"]);
      const comp = link(QUAD_VERT, COMP_FRAG, ["p"], ["u_tex", "u_res", "u_bg", "u_fg", "u_accent", "u_accent2", "u_light", "u_trail", "u_focus", "u_click"]);
      if (!pts || !lines || !fade || !comp) return false;
      const mkTex = () => {
        const tex = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        const fbo = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        return { tex, fbo };
      };
      const t0 = mkTex();
      const t1 = mkTex();
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      const quad = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);

      // Particle count follows the viewport area: about 2,600 at 1440x900, fewer on phones.
      const area = window.innerWidth * window.innerHeight;
      const aspect = window.innerWidth / Math.max(1, window.innerHeight);
      const narrow = aspect < 1;
      const n = Math.round(Math.min(narrow ? 1100 : 2800, Math.max(900, (area / (1440 * 900)) * 2600)));
      simRef.current = makeSim(n, aspect);
      mem.current.aspect = aspect;
      mem.current.scrollPx = window.scrollY;
      mem.current.hubs = makeHubs(narrow);
      // Both buffers are allocated once and refreshed with bufferSubData.
      const ptLen = (3 * n + MAX_COMETS + MAX_HUBS) * PT;
      const lnLen = MAX_LINKS * LN * 6;
      const ptBuf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
      gl.bufferData(gl.ARRAY_BUFFER, ptLen * 4, gl.DYNAMIC_DRAW);
      const lnBuf = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, lnBuf);
      gl.bufferData(gl.ARRAY_BUFFER, lnLen * 4, gl.DYNAMIC_DRAW);
      glRef.current = {
        gl,
        pts: pts.p,
        lines: lines.p,
        fade: fade.p,
        comp: comp.p,
        uPts: pts.u,
        uLines: lines.u,
        uFade: fade.u,
        uComp: comp.u,
        tex: [t0.tex, t1.tex],
        fbo: [t0.fbo, t1.fbo],
        cur: 0,
        tw: 1,
        th: 1,
        quad,
        ptBuf,
        lnBuf,
        ptData: new Float32Array(ptLen),
        lnData: new Float32Array(lnLen),
      };
      return () => {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        glRef.current = null;
        simRef.current = null;
      };
    },
    (s) => {
      const sim = simRef.current;
      const g = glRef.current;
      const m = mem.current;
      const h = m.hubs;
      if (!sim || !g || !h) return;
      const aspect = s.width / Math.max(1, s.height);
      // Keep particles inside the field when the window changes shape.
      if (Math.abs(aspect - m.aspect) > 1e-3) {
        const k = aspect / m.aspect;
        for (let i = 0; i < sim.n; i++) sim.px[i] = sim.px[i]! * k;
        m.aspect = aspect;
      }
      const t = s.time;
      const light = s.palette.light;
      const narrow = aspect < 1;
      // Idle focus: a slow orbit around the outside of the portrait ring (bottom right on phones).
      const oa = t * 0.08 + 2.4;
      const ix = narrow ? 0.74 + 0.04 * Math.sin(t * 0.2) : 0.72 + (0.3 * Math.cos(oa)) / aspect;
      const iy = narrow ? 0.13 + 0.03 * Math.sin(t * 0.17) : 0.49 + 0.3 * Math.sin(oa);
      // A pointer over the hero text pulls the cluster only partway left.
      const tx = s.pointerActive ? (narrow ? s.pointer[0] : Math.max(0.45, s.pointer[0])) : ix;
      const ty = s.pointerActive ? s.pointer[1] : iy;
      const k = s.reducedMotion || !m.warm ? 1 : 1 - Math.exp(-s.dt * (s.pointerActive ? 7 : 1.5));
      m.fx += (tx - m.fx) * k;
      m.fy += (ty - m.fy) * k;
      const f: Focus = { x: m.fx * aspect, y: m.fy, on: s.pointerActive ? 1 : 0.9, sc: narrow ? 0.55 : 1 };

      const clicked = m.warm && s.click[2] < m.clickAge && s.click[2] < 1;
      m.clickAge = s.click[2];
      const burst: [number, number] | null = clicked ? [s.click[0] * aspect, s.click[1]] : null;
      if (clicked) m.boost = 1;
      m.boost *= Math.exp(-s.dt / 0.35);
      // Clamped so a jump to an anchor does not smear the whole field.
      const scrollDy = Math.max(-0.03, Math.min(0.03, (s.scrollPx - m.scrollPx) / Math.max(1, window.innerHeight)));
      m.scrollPx = s.scrollPx;
      // Scrolling spins up a vortex that winds down slowly.
      m.vort = Math.max(-1, Math.min(1, m.vort + scrollDy * 5)) * Math.exp(-s.dt * 0.45);
      const vort = light ? m.vort * 0.6 : m.vort;

      if (!m.warm) {
        // Settle the swarm before the first frame so it never starts as random noise.
        for (let i = 0; i < 150; i++) {
          if (i % 6 === 0) buildFlow(sim, t - (150 - i) / 30, s.scroll, aspect, light);
          step(sim, 1 / 30, aspect, f, null, 0, 0);
        }
        m.nextComet = t + 0.3;
        m.warm = true;
      }
      if (s.reducedMotion) {
        // Still frame (drawn once per resize or palette change): a few sub-frames build the trails.
        buildFlow(sim, t, s.scroll, aspect, light);
        updateHubs(h, t, aspect, s.scrollPx, f, narrow, 0);
        for (let i = 0; i < 12; i++) {
          step(sim, 1 / 30, aspect, f, null, 0, 0);
          draw(g, sim, m, s, t, aspect, f, 0.8, narrow);
        }
        return;
      }
      if (m.frame++ % 4 === 0) buildFlow(sim, t, s.scroll, aspect, light);
      const dt = Math.min(s.dt, 1 / 20);
      step(sim, dt, aspect, f, burst, scrollDy, vort);
      updateHubs(h, t, aspect, s.scrollPx, f, narrow, dt);
      if (burst) clickBurst(m, h, f, burst[0], burst[1], t);
      updateComets(m, h, t, f, aspect);
      // Trails: about a third of a second on desktop, shorter on phones.
      const keep = Math.pow(narrow ? 0.62 : 0.8, dt * 60);
      draw(g, sim, m, s, t, aspect, f, keep, narrow);
    },
    { onFail, onReady, renderScale: 1, maxDpr: 1.25 },
  );

  return <canvas ref={ref} className="bg-canvas" />;
}

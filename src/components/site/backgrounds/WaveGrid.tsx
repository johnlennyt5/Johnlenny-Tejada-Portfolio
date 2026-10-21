"use client";

import { useRef } from "react";
import type { BgProps } from "./BackgroundLayer";
import { useShaderCanvas, type FrameState } from "./useShaderCanvas";

/*
 * WaveGrid: a glowing wireframe energy landscape seen in perspective. The floor is a height field
 * of rolling energy swells with ridged mountains on the flanks. Each pixel marches its ray to the
 * surface, then draws analytic anti-aliased grid lines with comet pulses racing along them and a
 * scan plane sweeping toward the viewer. A sun rises on the horizon behind the hero portrait, its
 * corona leaning toward the cursor. The cursor bends and lights the floor where it points, a click
 * fires a shockwave across the grid, scroll flies the camera forward and tilts it down.
 * Lines dim behind the copy column so text stays easy to read.
 */
const FRAG = `
uniform vec3 u_sun;    // portrait disc center (uv) and radius, z <= 0 when not found
uniform float u_steps; // march steps, lowered by the frame-time governor

#define MAX_STEPS 28
#define FAR 64.0
#define HMAX 3.0
#define HMIN -0.6
#define FOCAL 1.55
#define ZP 96.0
#define W0 0.0654498
#define GS 1.5

// Every z frequency is a multiple of 2pi/ZP (and ZP * GS is whole), so the camera z wraps without a seam.
float camZ(float t) { return mod(t * 1.1 + u_scroll * 46.0, ZP); }

vec3 ro;
vec2 mouseGround;
vec2 clickGround;
float rippleAmp;
float clickAge;

float hash1(float n) { return fract(sin(n * 127.1) * 43758.5453); }

// Rolling energy swells across the whole floor.
float swell(vec2 p) {
  return sin(p.y * W0 * 8.0 + u_time * 1.3 + sin(p.x * 0.35) * 1.2) * 0.1
       + sin(p.x * 0.9 - p.y * W0 * 4.0 + u_time * 0.7) * 0.045;
}

// Terrain without the pointer terms (also used for normals).
float baseHeight(vec2 p) {
  float h = swell(p);
  // Tall ridges on the right past the portrait, a low far ridge on the left beyond the fog.
  float zr = p.y - ro.z;
  float side = smoothstep(4.5, 11.0, p.x) * 2.4
             + smoothstep(6.0, 14.0, -p.x) * 2.9 * smoothstep(24.0, 34.0, zr);
  if (side > 0.001) {
    float r1 = 1.0 - abs(sin(p.x * 0.41 + 1.4 * sin(p.y * W0 * 2.0)));
    float r2 = 1.0 - abs(sin(p.y * W0 * 4.0 + p.x * 0.18 + 1.7));
    h += side * (r1 * r1 * 0.65 + r2 * r2 * 0.45) * (0.85 + 0.15 * sin(u_time * 0.45 + p.y * W0));
  }
  return h;
}

float height(vec2 p) {
  float h = baseHeight(p);
  float dm = length(p - mouseGround);
  if (dm < 12.0) h += rippleAmp * sin(dm * 3.0 - u_time * 5.5) * exp(-dm * 0.38) * smoothstep(0.0, 0.6, dm);
  if (clickAge < 4.5) {
    float dc = length(p - clickGround) - clickAge * 5.0;
    if (abs(dc) < 3.0) h += exp(-dc * dc * 1.6) * 1.4 * exp(-clickAge * 0.8) * smoothstep(0.0, 0.12, clickAge);
  }
  return h;
}

// Coverage of a grid line of half width w (cell units) for a pixel footprint fp.
float gridLine(float c, float w, float fp) {
  float d = abs(fract(c + 0.5) - 0.5);
  float a = 1.0 - smoothstep(w, w + fp, d);
  float v = a * (2.0 * w / max(2.0 * w, fp));
  return mix(v, 2.0 * w * 1.6, smoothstep(0.25, 0.7, fp));
}

vec3 camRay(vec2 uv, float pitch) {
  vec3 f = vec3(0.0, sin(pitch), cos(pitch));
  vec3 up = vec3(0.0, cos(pitch), -sin(pitch));
  return normalize(vec3(uv.x, 0.0, 0.0) + up * uv.y + f * FOCAL);
}

void main() {
  float aspect = u_res.x / u_res.y;
  vec2 suv = gl_FragCoord.xy / u_res;
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float light = u_light;
  float wide = smoothstep(0.85, 1.15, aspect);

  // Horizon: just under the hero name on desktop, below the hero copy on phones.
  float hy0 = mix(-0.4, -0.035, wide);
  float pitch = atan(-hy0 / FOCAL) - u_scroll * 0.3;
  float camY = 1.45 + u_scroll * 0.35;
  float zc = camZ(u_time);
  ro = vec3(0.0, camY, zc);
  float hy = -FOCAL * tan(pitch);
  float scrolled = smoothstep(0.03, 0.1, u_scroll);

  // Sun: centered on the portrait disc when it is found, else a fixed spot.
  vec2 sc = mix(vec2(0.0, hy0 - 0.02), vec2(aspect * 0.22, hy0), wide);
  float discR = mix(0.1, 0.25, wide);
  if (u_sun.z > 0.0 && wide > 0.5) { sc = u_sun.xy; discR = u_sun.z; }
  float sunR = discR * mix(1.3, 1.36, wide);

  // Where the pointer and the last click land on the floor.
  vec2 muv = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 mg = vec2(muv.x, min(muv.y, hy - 0.04));
  vec3 mrd = camRay(mg, pitch);
  mouseGround = ro.xz + mrd.xz * (camY / -mrd.y);
  rippleAmp = u_mouseOn * (0.22 + 0.3 * clamp(length(u_mouseVel) * 1.5, 0.0, 1.0));
  clickAge = u_click.z;
  vec2 cuvRaw = (u_click.xy - 0.5) * vec2(aspect, 1.0);
  vec2 cuv = vec2(cuvRaw.x, min(cuvRaw.y, hy - 0.18));
  vec3 crd = camRay(cuv, pitch);
  clickGround = vec2(0.0, zc - clickAge * 1.1) + crd.xz * (camY / -crd.y);

  vec3 rd = camRay(uv, pitch);

  // Calm mask: lines dim behind the copy column (left, below the name) and the case studies.
  float heroCalm = mix(0.2, 1.0, smoothstep(0.12, 0.6, suv.x));
  heroCalm = mix(heroCalm, 1.0, smoothstep(0.02, 0.07, uv.y - hy) * 0.6);
  heroCalm = mix(0.5, heroCalm, wide);
  float edge = max(smoothstep(0.36, 0.5, abs(suv.x - 0.5)), exp(-abs(uv.y - hy) * 14.0) * 0.6);
  float calm = mix(heroCalm, 0.3 + 0.7 * edge, scrolled);

  // March the ray through the height band, then refine by bisection.
  float tN, tF;
  if (rd.y < -1e-4) {
    tN = max(0.0, (camY - HMAX) / -rd.y);
    tF = min(FAR, (camY - HMIN) / -rd.y);
  } else {
    tN = 0.0;
    tF = rd.y > 1e-4 ? min(FAR, (HMAX - camY) / rd.y) : FAR;
    // Sky between the ridges, or well above them, never hits anything.
    if (abs(uv.x) < 0.1 || uv.y > hy + 0.2) tF = 0.0;
  }
  float hitT = -1.0;
  if (tF > tN) {
    float dt = (tF - tN) / u_steps;
    float a = tN;
    for (int i = 0; i < MAX_STEPS; i++) {
      if (float(i) >= u_steps) break;
      float b = a + dt;
      vec3 q = ro + rd * b;
      if (q.y < height(q.xz)) {
        for (int k = 0; k < 4; k++) {
          float mid = 0.5 * (a + b);
          vec3 m = ro + rd * mid;
          if (m.y < height(m.xz)) b = mid; else a = mid;
        }
        hitT = b;
        break;
      }
      a = b;
    }
  }

  vec3 hot = mix(u_accent2, u_fg, 0.55);
  float above = uv.y - hy;
  vec2 sv = uv - sc;
  float sd = length(sv);
  float sunFade = (1.0 - scrolled) * (1.0 - smoothstep(0.0, 0.25, abs(sc.y - hy) - sunR * 0.6));
  float haze = exp(-max(above, 0.0) * 8.0) * exp(-abs(uv.x - sc.x) * 0.8);
  vec3 col = u_bg;

  if (hitT < 0.0) {
    // Sky: palette background, a soft glow over the horizon, faint stars.
    if (light < 0.5) {
      col += u_accent2 * haze * 0.14 * (0.4 + 0.6 * sunFade) + u_accent * exp(-max(above, 0.0) * 24.0) * 0.05;
      float cell = u_res.y * 0.018;
      vec2 sg = floor(gl_FragCoord.xy / cell);
      vec2 sf = gl_FragCoord.xy / cell - sg;
      float st = hash1(sg.x * 31.7 + sg.y * 7.3);
      vec2 sp = vec2(hash1(st * 91.0), hash1(st * 53.0)) * 0.6 + 0.2;
      float dot1 = smoothstep(1.6 / cell, 0.0, length(sf - sp) * 0.6);
      float tw = 0.55 + 0.45 * sin(u_time * 1.7 + st * 40.0);
      col += u_fg * step(0.97, st) * dot1 * smoothstep(0.03, 0.3, above) * 0.45 * tw * (0.5 + 0.5 * calm);
    } else {
      col = mix(col, u_accent, haze * 0.05);
    }

    // Sun rising behind the portrait: clipped by the horizon, striped toward its base.
    float yy = (uv.y - sc.y) / sunR; // -1 bottom .. 1 top
    float disc = smoothstep(sunR, sunR - 0.003, sd) * smoothstep(-0.002, 0.004, above);
    float band = fract(yy * 6.0 - u_time * 0.12);
    float cut = step(band, mix(0.55, 0.0, smoothstep(-0.2, 0.55, yy)));
    disc *= 1.0 - cut * step(yy, 0.55);
    // Corona flares that lean toward the cursor.
    float ang = atan(sv.y, sv.x);
    vec2 md = muv - sc;
    float lean = u_mouseOn * max(dot(sv / max(sd, 1e-3), md / max(length(md), 1e-3)), 0.0);
    float fl = 0.55 + 0.25 * sin(ang * 7.0 + u_time * 0.6) * sin(ang * 3.0 - u_time * 0.9) + 0.2 * sin(ang * 13.0 - u_time * 1.4);
    float rim = max(sd - sunR, 0.0);
    float corona = exp(-rim * mix(9.0, 6.0, lean) / (0.7 + fl * 0.6)) * (0.7 + 0.6 * lean);
    float bloom = exp(-rim * 14.0);
    float upper = smoothstep(-0.01, 0.03, above);
    if (light < 0.5) {
      vec3 sunCol = mix(hot, u_accent2, smoothstep(-0.6, 0.9, yy));
      col += u_accent2 * corona * 0.22 * upper * sunFade;
      col += sunCol * bloom * 0.5 * upper * sunFade;
      col = mix(col, sunCol, disc * mix(0.6, 0.85, wide) * sunFade);
    } else {
      vec3 sunInk = mix(u_accent, u_bg, mix(0.75, 0.55, smoothstep(-1.0, 0.8, yy)));
      col = mix(col, u_accent, corona * 0.07 * upper * sunFade);
      col = mix(col, sunInk, disc * 0.7 * sunFade);
    }
  } else {
    vec3 p = ro + rd * hitT;
    float hb = baseHeight(p.xz);
    float e = 0.08;
    vec3 n = normalize(vec3(hb - baseHeight(p.xz + vec2(e, 0.0)), e, hb - baseHeight(p.xz + vec2(0.0, e))));
    float zr = p.z - zc;

    // Pixel footprint on the surface, in grid cells.
    float angPx = 1.0 / (u_res.y * FOCAL);
    vec2 g = p.xz * GS;
    float fp = hitT * angPx * GS / max(abs(dot(rd, n)), 0.07);
    float fpx = hitT * angPx * GS * 1.3;
    float wMax = light > 0.5 ? 0.014 : 0.022;
    float lx = gridLine(g.x, min(wMax, fpx * 0.8 + 0.004), fpx);
    float lz = gridLine(g.y, min(wMax, fp * 0.8 + 0.004), fp);
    float lines = max(lx, lz);
    float nearFade = 1.0 - smoothstep(0.15, 0.6, fp);

    // Comet pulses racing to the horizon along lengthwise lines, slower ones crossing sideways.
    float lane = floor(g.x + 0.5);
    float hl = hash1(lane + 3.0);
    float pz = fract(p.z * (3.0 / ZP) + u_time * (0.18 + 0.3 * hl) + hl * 7.0);
    float onZ = step(0.25, hl) * lx;
    float row = mod(floor(g.y + 0.5), ZP * GS);
    float hr = hash1(row * 1.7 + 11.0);
    float pxp = fract(g.x * 0.03 * sign(hr - 0.5) + u_time * (0.08 + 0.12 * hr) + hr * 5.0);
    float onX = step(0.55, hr) * lz;
    float pulse = smoothstep(0.75, 1.0, pz) * onZ + smoothstep(0.8, 1.0, pxp) * onX * 0.8;
    float core = pow(smoothstep(0.9, 1.0, pz), 3.0) * onZ + pow(smoothstep(0.93, 1.0, pxp), 3.0) * onX;

    // Scan plane sweeping from the horizon to the camera every 6 s.
    float sweep = fract(u_time / 6.0);
    float scanZ = mix(48.0, 1.5, sweep * sweep * (3.0 - 2.0 * sweep));
    float scan = exp(-abs(zr - scanZ) * 1.6) * smoothstep(0.0, 0.1, sweep) * (1.0 - smoothstep(0.85, 1.0, sweep));

    // Soft glow around lines (dark palettes).
    float dx = abs(fract(g.x + 0.5) - 0.5);
    float dz = abs(fract(g.y + 0.5) - 0.5);
    float glow = (exp(-dx * 22.0) + exp(-dz * 22.0)) * 0.5 * nearFade;

    float fog = exp(-hitT * 0.042);
    float peak = smoothstep(0.35, 1.9, p.y);
    float crest = smoothstep(0.04, 0.13, swell(p.xz));
    float dm = length(p.xz - mouseGround);
    float near = u_mouseOn * exp(-dm * 0.32);
    float hotspot = u_mouseOn * exp(-dm * dm * 0.35);
    float ringGlow = 0.0;
    if (clickAge < 4.5) {
      float dc = length(p.xz - clickGround) - clickAge * 5.0;
      ringGlow = exp(-dc * dc * 0.5) * exp(-clickAge * 0.65) * 3.0;
    }
    float rimL = pow(1.0 - clamp(n.y, 0.0, 1.0), 2.0) * 0.6;
    vec3 lineCol = mix(u_accent, u_accent2, clamp(peak * 0.8 + pulse * 1.5 + near * 0.35 + hotspot * 0.6 + scan * 0.5, 0.0, 1.0));
    lineCol += u_accent2 * rimL;
    if (light > 0.5) lineCol = mix(u_accent, lineCol, 0.3);
    lineCol = mix(lineCol, mix(u_accent2, u_fg, 0.4), clamp(ringGlow * 0.5, 0.0, 1.0));
    float shade = clamp(dot(n, normalize(vec3(0.5, 0.7, 0.4))), 0.0, 1.0);

    // Pointer and click energy stays visible inside the calm zone.
    float act = clamp(near * 0.5 + hotspot + ringGlow * 0.4, 0.0, 1.0);
    float k = fog * mix(calm, 1.0, act * 0.6);
    float energy = lines * (0.8 + near * 1.2 + hotspot * 1.5 + ringGlow * 1.3 + scan * 1.4 + crest * 0.35) + pulse * 1.5;
    // Reflection streak of the sun on the floor.
    float refl = exp(-abs(uv.x - sc.x) * 7.0) * exp(-max(hy - uv.y, 0.0) * 4.0) * sunFade;
    if (light < 0.5) {
      col = u_bg * (0.92 - 0.12 * peak) + u_accent * 0.035 * shade * fog;
      col += u_accent2 * haze * 0.06 * (0.4 + 0.6 * sunFade);
      col += u_accent * crest * 0.03 * fog * calm;
      col += u_accent2 * (hotspot * 0.16 + scan * 0.025 + refl * 0.06) * fog;
      col += lineCol * (energy * 0.8 + glow * 0.12) * k;
      col += mix(u_accent2, u_fg, 0.6) * (core * 0.9 + ringGlow * lines * 0.35) * k;
    } else {
      col = mix(u_bg, u_accent, 0.03 * shade * fog + hotspot * 0.06 + scan * 0.012);
      float cap = mix(0.25, 0.5, calm);
      float ink = clamp((energy * 0.85 + core * 0.6 + glow * 0.03) * k, 0.0, cap);
      col = mix(col, mix(lineCol, u_fg, 0.15), ink);
    }
    // Merge distant terrain into the sky haze.
    vec3 hazeCol = light < 0.5 ? u_bg + u_accent2 * 0.1 * exp(-abs(uv.x - sc.x) * 0.8) * (0.4 + 0.6 * sunFade) : mix(u_bg, u_accent, 0.03);
    col = mix(hazeCol, col, smoothstep(FAR, FAR * 0.45, hitT));
  }

  // Thin horizon line, brightest under the sun.
  float hl2 = exp(-abs(above) * u_res.y * 0.35) * (0.35 + 0.65 * exp(-abs(uv.x - sc.x) * 1.4));
  col = light < 0.5 ? col + u_accent2 * hl2 * 0.32 * mix(0.6, 1.0, calm) : mix(col, u_accent, hl2 * 0.03);

  // Click: a screen-space energy ring from where the pointer hit.
  if (clickAge < 1.2) {
    float cr = length(uv - cuvRaw);
    float rr = 1.1 * (1.0 - pow(1.0 - clickAge / 1.2, 3.0));
    float fade = pow(1.0 - clickAge / 1.2, 1.5);
    float x = cr - rr;
    float ring = exp(-x * x * 2500.0) + exp(-x * x * 160.0) * 0.45 + exp(-cr * 9.0) * 0.25 * fade;
    ring *= fade;
    col = light < 0.5 ? col + mix(u_accent2, u_fg, 0.35) * ring * 0.9 : mix(col, u_accent, clamp(ring * 0.45, 0.0, 0.5));
  }

  // Gentle vignette into the page background.
  float vig = smoothstep(1.25, 0.35, length((suv - 0.5) * vec2(1.0, 1.2)));
  col = mix(u_bg, col, mix(0.6, 1.0, vig));
  gl_FragColor = vec4(col, 1.0);
}
`;

// Frame-time governor levels: relative resolution and march steps.
const LEVELS: ReadonlyArray<readonly [number, number]> = [
  [1, 28],
  [0.82, 22],
  [0.69, 17],
];

type Gov = {
  level: number;
  frames: number;
  sum: number;
  warm: number;
  disc: Element | null;
  prog: WebGLProgram | null;
  loc: Record<string, WebGLUniformLocation | null>;
};

export default function WaveGrid({ onFail, onReady }: BgProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const gov = useRef<Gov>({ level: 0, frames: 0, sum: 0, warm: 0, disc: null, prog: null, loc: {} });

  const extraUniforms = (gl: WebGLRenderingContext, prog: WebGLProgram, s: FrameState) => {
    const g = gov.current;
    if (g.prog !== prog) {
      g.prog = prog;
      g.loc = Object.fromEntries(["u_res", "u_steps", "u_sun"].map((n) => [n, gl.getUniformLocation(prog, n)]));
    }
    // Average frame time over 60 frames; step down a level when it runs over 20 ms.
    if (!s.reducedMotion && s.dt > 0 && s.dt < 0.1) {
      if (g.warm < 45) g.warm++;
      else {
        g.sum += s.dt;
        if (++g.frames >= 60) {
          if (g.sum / g.frames > 0.02 && g.level < LEVELS.length - 1) {
            g.level++;
            g.warm = 0;
          }
          g.frames = 0;
          g.sum = 0;
        }
      }
    }
    const lv = LEVELS[g.level] ?? [1, 28];
    const phone = s.width < s.height;
    const scale = lv[0] * (phone ? 0.42 / 0.55 : 1);
    const canvas = gl.canvas as HTMLCanvasElement;
    const w = Math.max(1, Math.round(s.width * scale));
    const h = Math.max(1, Math.round(s.height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(g.loc.u_res ?? null, w, h);
    gl.uniform1f(g.loc.u_steps ?? null, phone ? Math.min(lv[1], 22) : lv[1]);

    // The sun follows the hero portrait disc.
    if (!g.disc || !g.disc.isConnected) g.disc = document.querySelector(".stage-disc");
    const r = g.disc?.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (r && r.width > 0) {
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      gl.uniform3f(g.loc.u_sun ?? null, (cx - vw / 2) / vh, (vh / 2 - cy) / vh, r.width / 2 / vh);
    } else gl.uniform3f(g.loc.u_sun ?? null, 0, 0, 0);
  };

  useShaderCanvas(ref, FRAG, { onFail, onReady, renderScale: 0.55, extraUniforms });
  return <canvas ref={ref} className="bg-canvas" />;
}

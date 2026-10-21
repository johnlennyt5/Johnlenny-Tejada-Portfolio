"use client";

import { useEffect, useRef, type RefObject } from "react";

/*
 * Shared engine for the animated backgrounds. Every background is a full-viewport canvas fixed
 * behind the page. This file owns the frame loop, the inputs (pointer, scroll, clicks), the
 * palette colors and the safety rules, so each background only describes what it draws.
 *
 * Rules every background gets for free:
 * - Colors come from the palette tokens in site.css and update live when the palette or mode changes.
 * - Pauses while the tab is hidden. Reduced motion draws one still frame (and redraws on resize
 *   or palette change). Device pixel ratio is capped, and `renderScale` lowers resolution further.
 * - If WebGL is missing, `onFail` runs and the page keeps the plain background.
 */

export type RGB = [number, number, number];

export interface Palette {
  bg: RGB;
  fg: RGB;
  accent: RGB;
  accent2: RGB;
  /** 1 on light palettes (Daylight and the trend palettes in light mode), else 0. */
  light: number;
}

export interface FrameState {
  /** Seconds since start (frozen in reduced motion). */
  time: number;
  /** Seconds since the previous frame. */
  dt: number;
  /** Canvas size in device pixels. */
  width: number;
  height: number;
  /** Smoothed pointer, 0..1 with y up (0 = bottom). Rests at the center until the pointer moves. */
  pointer: [number, number];
  /** Pointer velocity in viewport units per second (smoothed). */
  pointerVel: [number, number];
  /** True once the pointer has moved over the page. */
  pointerActive: boolean;
  /** Page scroll progress 0..1 (smoothed) and raw scrollY in CSS pixels. */
  scroll: number;
  scrollPx: number;
  /** Last click: position 0..1 (y up) and seconds since it happened (large number if none). */
  click: [number, number, number];
  palette: Palette;
  reducedMotion: boolean;
}

export interface LoopOptions {
  /** Multiplier on the (capped) device pixel ratio. 0.5 renders at half resolution. Default 1. */
  renderScale?: number;
  /** Cap on device pixel ratio before renderScale. Default 1.5. */
  maxDpr?: number;
  /** Frames per second cap. Default 60. */
  fps?: number;
}

function parseColor(raw: string): RGB {
  const s = raw.trim();
  if (s.startsWith("#")) {
    const h = s.length === 4 ? s.slice(1).replace(/./g, (c) => c + c) : s.slice(1, 7);
    return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
  }
  const m = s.match(/[\d.]+/g);
  if (m && m.length >= 3) return [Number(m[0]) / 255, Number(m[1]) / 255, Number(m[2]) / 255];
  return [0, 0, 0];
}

export function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const bg = parseColor(cs.getPropertyValue("--s-bg"));
  const lum = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2];
  return {
    bg,
    fg: parseColor(cs.getPropertyValue("--s-fg")),
    accent: parseColor(cs.getPropertyValue("--s-accent")),
    accent2: parseColor(cs.getPropertyValue("--s-accent-2")),
    light: lum > 0.5 ? 1 : 0,
  };
}

/**
 * Runs `onFrame` on every animation frame with the shared inputs. `setup` runs once with the
 * canvas and returns an optional cleanup. Return false from setup to signal failure (no WebGL).
 */
export function useFrameLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  setup: (canvas: HTMLCanvasElement) => false | void | (() => void),
  onFrame: (s: FrameState) => void,
  opts: LoopOptions & { onFail?: () => void; onReady?: () => void } = {},
) {
  const frameRef = useRef(onFrame);
  frameRef.current = onFrame;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanup = setup(canvas);
    if (cleanup === false) {
      opts.onFail?.();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scaleOpt = opts.renderScale ?? 1;
    const maxDpr = opts.maxDpr ?? 1.5;
    const minGap = 1000 / (opts.fps ?? 60) - 2;

    const state: FrameState = {
      time: reduced ? 12 : 0,
      dt: 0,
      width: 1,
      height: 1,
      pointer: [0.5, 0.5],
      pointerVel: [0, 0],
      pointerActive: false,
      scroll: 0,
      scrollPx: 0,
      click: [0.5, 0.5, 1e4],
      palette: readPalette(),
      reducedMotion: reduced,
    };
    let target: [number, number] = [0.5, 0.5];
    let scrollTarget = 0;
    let clickAt = -1e4;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * scaleOpt;
      const w = Math.max(1, Math.round(window.innerWidth * dpr));
      const h = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      state.width = w;
      state.height = h;
    };
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      state.scrollPx = window.scrollY;
      scrollTarget = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onPointer = (e: PointerEvent) => {
      target = [e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight];
      if (!state.pointerActive) {
        state.pointer = [...target];
        state.pointerActive = true;
      }
    };
    const onDown = (e: PointerEvent) => {
      onPointer(e);
      clickAt = performance.now();
      state.click = [target[0], target[1], 0];
    };

    resize();
    readScroll();
    state.scroll = scrollTarget;

    let raf = 0;
    let last = performance.now();
    let lastDraw = 0;
    const start = last;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - lastDraw < minGap) return;
      lastDraw = now;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      state.dt = dt;
      state.time = (now - start) / 1000;
      const k = 1 - Math.exp(-dt * 6);
      const px = state.pointer[0];
      const py = state.pointer[1];
      state.pointer = [px + (target[0] - px) * k, py + (target[1] - py) * k];
      const vx = dt > 0 ? (state.pointer[0] - px) / dt : 0;
      const vy = dt > 0 ? (state.pointer[1] - py) / dt : 0;
      state.pointerVel = [state.pointerVel[0] + (vx - state.pointerVel[0]) * k, state.pointerVel[1] + (vy - state.pointerVel[1]) * k];
      state.scroll += (scrollTarget - state.scroll) * (1 - Math.exp(-dt * 4));
      state.click = [state.click[0], state.click[1], (now - clickAt) / 1000];
      frameRef.current(state);
    };

    const drawStill = () => {
      resize();
      readScroll();
      state.scroll = scrollTarget;
      frameRef.current(state);
    };

    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const mo = new MutationObserver(() => {
      state.palette = readPalette();
      if (reduced) drawStill();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-palette", "data-mode"] });

    const onResize = () => (reduced ? drawStill() : resize());
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", readScroll, { passive: true });
    if (!reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) drawStill();
    else raf = requestAnimationFrame(tick);
    opts.onReady?.();

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      if (typeof cleanup === "function") cleanup();
    };
    // The loop is set up once per mount; options are read at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

/** Standard uniforms every fragment shader can declare (all optional). */
export const SHADER_HEADER = `precision highp float;
uniform vec2 u_res;      // canvas size in pixels
uniform float u_time;    // seconds
uniform vec2 u_mouse;    // 0..1, y up, smoothed
uniform vec2 u_mouseVel; // viewport units per second
uniform float u_mouseOn; // 1 once the pointer has moved
uniform float u_scroll;  // page progress 0..1, smoothed
uniform float u_scrollPx;// scrollY in CSS px
uniform vec3 u_click;    // xy 0..1 and seconds since the last click
uniform vec3 u_bg;       // palette background
uniform vec3 u_fg;       // palette text color
uniform vec3 u_accent;   // palette accent
uniform vec3 u_accent2;  // palette second accent
uniform float u_light;   // 1 on light palettes
`;

/**
 * Full-screen fragment shader background. `frag` is GLSL ES 1.0 that starts after SHADER_HEADER
 * and defines `void main()`. `extraUniforms` can set more uniforms each frame.
 */
export function useShaderCanvas(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  frag: string,
  opts: LoopOptions & {
    onFail?: () => void;
    onReady?: () => void;
    extraUniforms?: (gl: WebGLRenderingContext, program: WebGLProgram, s: FrameState) => void;
  } = {},
) {
  const glRef = useRef<{ gl: WebGLRenderingContext; prog: WebGLProgram; loc: Record<string, WebGLUniformLocation | null> } | null>(null);

  useFrameLoop(
    canvasRef,
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
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, SHADER_HEADER + frag);
      if (!vs || !fs) return false;
      const prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      const names = ["u_res", "u_time", "u_mouse", "u_mouseVel", "u_mouseOn", "u_scroll", "u_scrollPx", "u_click", "u_bg", "u_fg", "u_accent", "u_accent2", "u_light"];
      const loc = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)]));
      glRef.current = { gl, prog, loc };
      return () => {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        glRef.current = null;
      };
    },
    (s) => {
      const g = glRef.current;
      if (!g) return;
      const { gl, prog, loc } = g;
      gl.viewport(0, 0, s.width, s.height);
      gl.uniform2f(loc.u_res!, s.width, s.height);
      gl.uniform1f(loc.u_time!, s.time);
      gl.uniform2f(loc.u_mouse!, s.pointer[0], s.pointer[1]);
      gl.uniform2f(loc.u_mouseVel!, s.pointerVel[0], s.pointerVel[1]);
      gl.uniform1f(loc.u_mouseOn!, s.pointerActive ? 1 : 0);
      gl.uniform1f(loc.u_scroll!, s.scroll);
      gl.uniform1f(loc.u_scrollPx!, s.scrollPx);
      gl.uniform3f(loc.u_click!, s.click[0], s.click[1], s.click[2]);
      gl.uniform3f(loc.u_bg!, ...s.palette.bg);
      gl.uniform3f(loc.u_fg!, ...s.palette.fg);
      gl.uniform3f(loc.u_accent!, ...s.palette.accent);
      gl.uniform3f(loc.u_accent2!, ...s.palette.accent2);
      gl.uniform1f(loc.u_light!, s.palette.light);
      opts.extraUniforms?.(gl, prog, s);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    opts,
  );
}

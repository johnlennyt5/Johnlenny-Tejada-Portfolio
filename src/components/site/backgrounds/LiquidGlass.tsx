"use client";

import { useRef } from "react";
import type { BgProps } from "./BackgroundLayer";
import { useShaderCanvas } from "./useShaderCanvas";

/* Placeholder for the LiquidGlass background: a soft palette gradient that follows the pointer. */
const FRAG = `
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float d = distance(uv, u_mouse);
  vec3 col = mix(u_bg, u_accent, 0.25 * smoothstep(0.6, 0.0, d));
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function LiquidGlass({ onFail, onReady }: BgProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useShaderCanvas(ref, FRAG, { onFail, onReady, renderScale: 0.5 });
  return <canvas ref={ref} className="bg-canvas" />;
}

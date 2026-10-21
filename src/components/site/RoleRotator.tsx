"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Bi } from "@/content/showcase";

const TYPE_MS = 55;
const ERASE_MS = 28;
const HOLD_MS = 2600;
const PAUSE_MS = 260;

/**
 * Types each role, holds it, erases it, moves on. The typing is a stepped clip-path reveal
 * (plus a caret moved with transform) in CSS, so it never triggers layout; React only swaps
 * the text once per role. The first role is in the static HTML, so the line is never empty
 * and screen readers get a stable sentence.
 */
export function RoleRotator({ roles }: { roles: Bi[] }) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const text = roles[index]!.en;
  const len = text.length;
  const first = cycle === 0;
  const typeMs = first ? 0 : len * TYPE_MS;
  const typeDelay = first ? 0 : PAUSE_MS;
  const style = {
    "--len": len,
    "--type": `${typeMs}ms`,
    "--type-delay": `${typeDelay}ms`,
    "--erase": `${len * ERASE_MS}ms`,
    "--erase-delay": `${typeDelay + typeMs + HOLD_MS}ms`,
  } as CSSProperties;

  return (
    <p className="role">
      <span className="prompt" aria-hidden="true">
        &gt;
      </span>
      <span className="sr-only">{roles[0]!.en}</span>
      <span
        key={cycle}
        className={animate ? "role-line is-typing" : "role-line"}
        style={style}
        aria-hidden="true"
        onAnimationEnd={(e) => {
          if (e.animationName !== "role-erase" || !(e.target as Element).classList.contains("role-text")) return;
          setIndex((i) => (i + 1) % roles.length);
          setCycle((c) => c + 1);
        }}
      >
        <span className="role-text">{text}</span>
        <span className="caret" />
      </span>
    </p>
  );
}

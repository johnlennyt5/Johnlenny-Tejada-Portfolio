"use client";

import { useEffect, useState } from "react";
import type { Bi } from "@/content/showcase";

/**
 * Types each role, holds it, deletes it, moves on. The first role is in the static HTML,
 * so the line is never empty and screen readers get a stable sentence (aria-live off).
 */
export function RoleRotator({ roles }: { roles: Bi[] }) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const full = roles[index]!.en;
    let i = full.length;
    let timer: number;
    const hold = window.setTimeout(function tick() {
      i -= 1;
      setShown(full.slice(0, Math.max(i, 0)));
      if (i > 0) {
        timer = window.setTimeout(tick, 28);
      } else {
        const next = roles[(index + 1) % roles.length]!.en;
        let j = 0;
        const type = () => {
          j += 1;
          setShown(next.slice(0, j));
          if (j < next.length) timer = window.setTimeout(type, 55);
          else timer = window.setTimeout(() => setIndex((x) => (x + 1) % roles.length), 0);
        };
        timer = window.setTimeout(type, 260);
      }
    }, 2600);
    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(timer);
    };
  }, [index, roles]);

  const text = shown ?? roles[index]!.en;

  return (
    <p className="role">
      <span className="prompt" aria-hidden="true">
        &gt;
      </span>
      <span className="sr-only">{roles[0]!.en}</span>
      <span aria-hidden="true">{text}</span>
      <span className="caret" aria-hidden="true" />
    </p>
  );
}

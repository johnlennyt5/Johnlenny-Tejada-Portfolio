"use client";

import { useEffect } from "react";

/** Any key press, or a tap on the hero, finishes the typing at once (sets data-skip on the stage). */
export function HeroSkip({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const skip = () => {
      el.dataset.skip = "true";
    };
    window.addEventListener("keydown", skip, { once: true });
    el.addEventListener("pointerdown", skip, { once: true });
    return () => {
      window.removeEventListener("keydown", skip);
      el.removeEventListener("pointerdown", skip);
    };
  }, [targetId]);
  return null;
}

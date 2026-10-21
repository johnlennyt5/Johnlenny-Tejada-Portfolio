"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionPreference } from "./MotionToggle";

const loadFeatures = () => import("@/lib/motion-features").then((m) => m.default);

/**
 * LazyMotion (domAnimation, loaded lazily, strict: use `m.*` components only) and MotionConfig.
 * reducedMotion is "user" by default and "always" once the viewer turns motion off.
 *
 * Not in the root layout: a version (or a lazy island) that renders `m.*` components wraps its
 * own tree in this, so pages that animate only with CSS never download framer-motion.
 */
export function MotionFeatures({ children }: { children: ReactNode }) {
  const { pref } = useMotionPreference();
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={pref === "off" ? "always" : "user"}>{children}</MotionConfig>
    </LazyMotion>
  );
}

"use client";

import { m, useScroll, useSpring, useTransform } from "framer-motion";
import { useFlag, useReduced } from "./hooks";

/**
 * A terracotta thread across the top of a case study that fills as you read.
 * It is information, so it stays under reduced motion, just without the spring.
 */
export function ReadingThread() {
  const still = useFlag(useReduced());
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  const scaleX = useTransform([scrollYProgress, smooth, still], ([raw, sm, s]: number[]) => (s ? (raw ?? 0) : (sm ?? 0)));
  return <m.div className="v4-reading-thread" aria-hidden="true" style={{ scaleX }} />;
}

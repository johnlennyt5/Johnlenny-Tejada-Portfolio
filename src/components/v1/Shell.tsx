import type { ReactNode } from "react";
import { MotionFeatures } from "@/components/shared/MotionFeatures";
import { SkipLink } from "@/components/shared/SkipLink";
import { fontClassName } from "./fonts";
import "./theme.css";

/**
 * v1 wrapper: fonts, theme tokens, the skip link and framer-motion's LazyMotion (MotionFeatures).
 * Used by src/app/v1/layout.tsx only.
 */
export function V1Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`v1-root ${fontClassName}`} data-version="v1">
      <SkipLink />
      <MotionFeatures>{children}</MotionFeatures>
    </div>
  );
}

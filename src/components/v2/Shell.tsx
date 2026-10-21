import type { ReactNode } from "react";
import { MotionFeatures } from "@/components/shared/MotionFeatures";
import { SkipLink } from "@/components/shared/SkipLink";
import { fontClassName } from "./fonts";
import "./theme.css";

/**
 * v2 wrapper: fonts, theme tokens, the skip link and framer-motion's LazyMotion (MotionFeatures).
 * Used by src/app/v2/layout.tsx only.
 */
export function V2Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`v2-root ${fontClassName}`} data-version="v2">
      <SkipLink />
      <MotionFeatures>{children}</MotionFeatures>
    </div>
  );
}

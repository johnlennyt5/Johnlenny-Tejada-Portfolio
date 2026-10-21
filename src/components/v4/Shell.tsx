import type { ReactNode } from "react";
import { SkipLink } from "@/components/shared/SkipLink";
import { fontClassName } from "./fonts";
import "./theme.css";

/**
 * v4 wrapper: fonts, theme tokens and the skip link.
 * Used by src/app/v4/layout.tsx only.
 */
export function V4Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`v4-root ${fontClassName}`} data-version="v4">
      <SkipLink />
      {children}
    </div>
  );
}

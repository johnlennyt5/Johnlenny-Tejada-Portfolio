import type { ReactNode } from "react";
import { SkipLink } from "@/components/shared/SkipLink";
import { fontClassName } from "./fonts";
import "./theme.css";

/**
 * v1 wrapper: fonts, theme tokens and the skip link.
 * Used by src/app/v1/layout.tsx only.
 */
export function V1Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`v1-root ${fontClassName}`} data-version="v1">
      <SkipLink />
      {children}
    </div>
  );
}

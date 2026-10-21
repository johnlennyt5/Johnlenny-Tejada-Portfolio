import type { ReactNode } from "react";
import { SkipLink } from "@/components/shared/SkipLink";
import { fontClassName } from "./fonts";
import "./theme.css";

/**
 * v2 wrapper: fonts, theme tokens and the skip link.
 * Used by src/app/v2/layout.tsx only.
 */
export function V2Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`v2-root ${fontClassName}`} data-version="v2">
      <SkipLink />
      {children}
    </div>
  );
}

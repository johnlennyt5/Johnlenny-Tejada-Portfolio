import type { ReactNode } from "react";
import { SkipLink } from "@/components/shared/SkipLink";
import { fontClassName } from "./fonts";
import "./theme.css";

/**
 * v3 wrapper: fonts, theme tokens and the skip link.
 * Used by src/app/v3/layout.tsx and by src/app/page.tsx (the default version at /).
 */
export function V3Shell({ children }: { children: ReactNode }) {
  return (
    <div className={`v3-root ${fontClassName}`} data-version="v3">
      <SkipLink />
      {children}
    </div>
  );
}

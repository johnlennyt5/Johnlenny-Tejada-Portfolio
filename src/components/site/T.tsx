import type { ReactNode } from "react";

/**
 * Site text. The site is English only; the `es` copy is kept in content for a possible
 * Spanish version later but is not rendered.
 */
export function T({ en }: { en: ReactNode; es?: ReactNode }) {
  return <>{en}</>;
}

/** Block version of T, for paragraphs and lists. */
export function TBlock({ en }: { en: ReactNode; es?: ReactNode }) {
  return <>{en}</>;
}

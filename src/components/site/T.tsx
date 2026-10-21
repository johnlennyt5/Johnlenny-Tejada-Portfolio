import type { ReactNode } from "react";

/**
 * Bilingual text. Both languages are in the static HTML; CSS shows the one that matches
 * html[data-lang], so switching needs no re-render and works before hydration.
 */
export function T({ en, es }: { en: ReactNode; es: ReactNode }) {
  return (
    <>
      <span className="l-en">{en}</span>
      <span className="l-es" lang="es">
        {es}
      </span>
    </>
  );
}

/** Block version of T, for paragraphs and lists. */
export function TBlock({ en, es }: { en: ReactNode; es: ReactNode }) {
  return (
    <>
      <div className="l-en">{en}</div>
      <div className="l-es" lang="es">
        {es}
      </div>
    </>
  );
}

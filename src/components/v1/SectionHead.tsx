import type { ReactNode } from "react";
import { DrawRule, Parallax, Reveal, SetTitle } from "./motion";

interface SectionHeadProps {
  num: string;
  label: string;
  title: string;
  titleId: string;
  deck?: ReactNode;
  /** Tighter spacing for heads inside pinned frames. */
  compact?: boolean;
  as?: "h1" | "h2";
}

/**
 * A report section opener: a hairline that draws in, the section number set large in
 * the margin (drifting against the scroll), and the title dropping into place word by word.
 */
export function SectionHead({ num, label, title, titleId, deck, compact = false, as = "h2" }: SectionHeadProps) {
  return (
    <div className={`v1-wrap ${compact ? "pt-6" : "pt-20 md:pt-32"}`}>
      <DrawRule />
      <div className="v1-grid pt-3">
        <div className="col-span-12 flex items-baseline justify-between gap-4 md:col-span-3 md:block lg:col-span-2">
          <p className="v1-label v1-label-ink">
            <span className="text-accent">§</span> {num} <span className="text-muted">{label}</span>
          </p>
          {compact ? null : (
            <Parallax distance={36} minWidth={768} className="mt-6 hidden md:block">
              <span aria-hidden="true" className="v1-num v1-outline block text-[clamp(4rem,8vw,8.5rem)]">
                {num}
              </span>
            </Parallax>
          )}
        </div>
        <div className="col-span-12 pt-4 md:col-span-9 md:pt-0 lg:col-span-10">
          <SetTitle
            as={as}
            id={titleId}
            text={title}
            className={compact ? "v1-h2 text-[clamp(2.4rem,6vw,5.5rem)]" : "v1-h2"}
          />
          {deck ? (
            <Reveal delay={0.1} className="mt-6">
              <div className="v1-deck">{deck}</div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </div>
  );
}

import type { CSSProperties, ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds. */
  delay?: number;
  /** Pixels to rise from. */
  rise?: number;
  as?: "div" | "li";
}

type CSSVars = CSSProperties & Record<`--${string}`, string>;

/**
 * Fades and lifts content in the first time it scrolls into view.
 * A server component: it only marks the element. The page's one CanvasDriver (RevealObserver.tsx, mounted by Frame)
 * arms the marked elements that start below the fold and releases them as they enter, so the
 * page hydrates one small island instead of one per card.
 * The HTML, reduced motion and anything already on screen stay in the final state.
 */
export function Reveal({ children, className, delay = 0, rise = 24, as = "div" }: RevealProps) {
  const Tag = as;
  const style: CSSVars | undefined =
    delay !== 0 || rise !== 24 ? { "--rd": `${delay}s`, "--rise": `${rise}px` } : undefined;
  return (
    <Tag className={className} data-v3-reveal="" style={style}>
      {children}
    </Tag>
  );
}

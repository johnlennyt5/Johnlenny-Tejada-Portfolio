export interface SkipLinkProps {
  /** id of the main landmark. Every version page must render <main id="main">. */
  targetId?: string;
  label?: string;
  className?: string;
}

/** First focusable element on every page. Hidden until focused (styles in globals.css). */
export function SkipLink({ targetId = "main", label = "Skip to content", className }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className={`jt-skip-link${className ? ` ${className}` : ""}`}>
      {label}
    </a>
  );
}

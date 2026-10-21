export interface RiseWordsProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
}

/**
 * A title that rises out of its own baseline as it scrolls into view, like type pressed up
 * through a slot in the page.
 *
 * A server component: the rise is a CSS scroll-driven animation (.v4-rise in theme.css) on the
 * heading's own view timeline, so it ships no JavaScript and adds one span, not two per word.
 * Server HTML, reduced motion, the motion toggle and browsers without scroll timelines all get
 * the plain, finished title.
 */
export function RiseWords({ text, as = "h2", id, className }: RiseWordsProps) {
  const Tag = as;
  return (
    <Tag id={id} className={className ? `v4-rise ${className}` : "v4-rise"}>
      <span className="v4-rise-line">{text}</span>
    </Tag>
  );
}

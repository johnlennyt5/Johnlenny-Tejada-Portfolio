/**
 * A band of activity names that slides sideways as the page scrolls.
 * Server rendered, one copy of the list: the slide is a CSS scroll-driven animation that moves
 * the track by part of its own width (one pass of the list is already wider than two screens),
 * so it needs no duplicate set and no JavaScript. Without view timelines or with reduced motion it stays still.
 */
export function Ticker({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <div aria-hidden="true" className={`v3-ticker${className ? ` ${className}` : ""}`}>
      <p className="v3-ticker-track">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>
    </div>
  );
}

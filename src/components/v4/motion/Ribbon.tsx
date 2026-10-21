/**
 * A strip of paper tape printed with skills, pulled sideways as the page scrolls.
 * The list is long enough (far wider than any screen) that one copy never runs out over the
 * pull, so there is no decorative duplicate.
 *
 * A server component: the pull is a CSS scroll-driven animation on the ribbon's own view
 * timeline (.v4-ribbon in theme.css). Reduced motion, the motion toggle and browsers without
 * scroll timelines get a still tape that wraps and shows every item.
 */
export function Ribbon({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="v4-ribbon">
      <ul aria-label={label}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

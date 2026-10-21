/**
 * A barber pole whose stripes turn as the chapter scrolls by. The stripes are a tall inner
 * element moved with translateY (composited), never background-position.
 *
 * A server component: the pole names a view timeline and the stripes follow it in CSS
 * (.v4-pole-stripes in theme.css). Reduced motion, the motion toggle and browsers without
 * scroll timelines get still stripes.
 */
export function BarberPole({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="v4-pole-cap" />
      <div className="v4-pole mx-auto">
        <div className="v4-pole-stripes" />
      </div>
      <div className="v4-pole-cap" data-end="bottom" />
    </div>
  );
}

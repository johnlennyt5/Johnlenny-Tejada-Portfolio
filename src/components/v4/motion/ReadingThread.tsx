/**
 * A terracotta thread across the top of a case study that fills as you read.
 * A server component: the fill is a CSS scroll-driven animation on the page's scroll timeline
 * (.v4-reading-thread in theme.css), so the case study ships no animation JavaScript.
 * It is information, so it stays under reduced motion; browsers without scroll timelines do
 * not show it.
 */
export function ReadingThread() {
  return <div className="v4-reading-thread" aria-hidden="true" />;
}

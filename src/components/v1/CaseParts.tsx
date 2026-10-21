"use client";

import { m, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionPreference } from "@/components/shared/MotionToggle";
import { SCROLL_SPRING } from "./motion";

interface PlateHeaderProps {
  /** Breadcrumb and kicker row. */
  top: ReactNode;
  title: string;
  titleId?: string;
  /** Large outlined numeral behind the title, e.g. the index number. */
  numeral?: string;
  children?: ReactNode;
}

/**
 * Page opener for case studies and the about page. The title is a printing plate:
 * it slides left as the page scrolls, a red plate slips out of register behind it,
 * and an outlined numeral rises at a different rate. The deck under the title stays still
 * (it is often the page's largest text, so it is never faded). Static under reduced motion.
 */
export function PlateHeader(props: PlateHeaderProps) {
  const { reduced } = useMotionPreference();
  return reduced ? <PlateHeaderBody key="static" {...props} live={false} /> : <PlateHeaderBody key="live" {...props} live />;
}

function PlateHeaderBody({ top, title, titleId, numeral, children, live }: PlateHeaderProps & { live: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, SCROLL_SPRING);
  const x = useTransform(p, [0, 1], ["0%", "-18%"]);
  const ghostX = useTransform(p, [0, 0.7], ["0.03em", "0.14em"]);
  const numY = useTransform(p, [0, 1], [0, -180]);

  return (
    <header ref={ref} className="relative pt-6 md:pt-10">
      <div className="v1-wrap relative">
        {numeral ? (
          <m.span
            aria-hidden="true"
            className="v1-num v1-outline pointer-events-none absolute right-[var(--v1-gutter)] top-12 hidden text-[clamp(8rem,22vw,22rem)] opacity-60 md:block"
            style={live ? { y: numY } : undefined}
          >
            {numeral}
          </m.span>
        ) : null}
        {top}
        <h1 id={titleId} className="v1-h1 relative mt-8 md:mt-14">
          <m.span className="relative inline-block" style={live ? { x } : undefined}>
            <m.span
              aria-hidden="true"
              className="absolute inset-0 text-accent"
              style={live ? { x: ghostX, y: "0.02em" } : { x: "0.03em", y: "0.02em" }}
            >
              {title}.
            </m.span>
            <span className="relative">
              {title}
              <span className="text-accent">.</span>
            </span>
          </m.span>
        </h1>
        <div className="relative">{children}</div>
      </div>
    </header>
  );
}

export interface ContentsItem {
  id: string;
  num: string;
  label: string;
}

/**
 * The sticky contents rail of a case study. Highlights the section being read and
 * lets readers jump between sections. Works as plain anchor links without JavaScript.
 */
export function CaseContents({ items, label = "On this page" }: { items: ContentsItem[]; label?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const { reduced } = useMotionPreference();
  const railRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 30%", "end end"] });
  const fill = useSpring(scrollYProgress, SCROLL_SPRING);

  useEffect(() => {
    const nodes = items
      .map((i) => document.getElementById(i.id))
      .filter((n): n is HTMLElement => Boolean(n));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [items]);

  return (
    <div ref={railRef} className="h-full">
      <nav aria-label={label} className="v1-toc lg:sticky lg:top-[calc(var(--v1-mast)+32px)]">
        <p className="v1-label v1-label-ink border-b border-fg pb-2">{label}</p>
        <div className="relative">
          <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 hidden w-px bg-line lg:block" />
          {reduced ? null : (
            <m.span
              aria-hidden="true"
              className="absolute bottom-0 left-0 top-0 hidden w-[3px] origin-top bg-accent lg:block"
              style={{ scaleY: fill }}
            />
          )}
          <ol className="grid grid-cols-2 gap-x-4 sm:grid-cols-3 lg:block lg:pl-4">
            {items.map((i) => (
              <li key={i.id}>
                <Link
                  href={`#${i.id}`}
                  aria-current={active === i.id ? "true" : undefined}
                  className="flex min-h-11 items-center gap-2 text-sm text-muted no-underline hover:text-fg"
                >
                  <span className="v1-toc-dot" aria-hidden="true" />
                  <span className="font-mono text-xs">{i.num}</span>
                  <span>{i.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </div>
  );
}

"use client";

import { m, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Monogram } from "@/components/shared/Monogram";
import { MotionToggle, useMotionPreference } from "@/components/shared/MotionToggle";
import { VersionSwitcher } from "@/components/shared/VersionSwitcher";
import { routes } from "@/lib/site";
import { usePageProgress } from "./motion";

interface MastheadProps {
  name: string;
  /** Fixed running head (case studies). Otherwise the head follows [data-running-head] sections. */
  context?: string;
}

const NAV = [
  { href: `${routes.home("v1")}#work`, label: "Work" },
  { href: `${routes.home("v1")}#figures`, label: "Proof" },
  { href: routes.about("v1"), label: "About" },
  { href: `${routes.home("v1")}#contact`, label: "Contact" },
];

/** Tracks which [data-running-head] section sits under the masthead. */
function useRunningHead(fixed?: string): string | null {
  const [head, setHead] = useState<string | null>(fixed ?? null);
  useEffect(() => {
    if (fixed) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-running-head]"));
    if (nodes.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setHead((hit.target as HTMLElement).dataset.runningHead ?? null);
      },
      { rootMargin: "-20% 0px -75% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [fixed]);
  return head;
}

/**
 * The report's masthead. The JT block docks here and inverts to paper on ink once the
 * page scrolls; a red bar along the bottom rule reads page progress; the running head
 * names the current section, the way a printed report does.
 */
export function Masthead({ name, context }: MastheadProps) {
  const { reduced } = useMotionPreference();
  const { scrollY } = useScroll();
  const progress = usePageProgress();
  const [docked, setDocked] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setDocked(v > 96));
  const head = useRunningHead(context);

  return (
    <header className="v1-mast">
      <div className="v1-wrap flex h-full items-center justify-between gap-3">
        <Link href={routes.home("v1")} className="flex min-h-11 min-w-0 items-center gap-3 no-underline">
          <span className="v1-mono-box" aria-hidden="true">
            <Monogram variant="editorial" size={30} decorative delay={0.15} />
            <m.span
              className="v1-mono-inverse"
              initial={false}
              animate={{ opacity: docked ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.28 }}
            >
              <Monogram variant="editorial" size={30} decorative animate={false} />
            </m.span>
          </span>
          <span className="truncate font-display text-[1.05rem] font-extrabold tracking-[-0.03em]">{name}</span>
        </Link>

        <p className="v1-label hidden min-w-0 flex-1 truncate border-l border-line pl-4 lg:block" aria-hidden="true">
          {head ? (
            <span className="relative inline-block overflow-hidden align-bottom">
              <m.span
                key={head}
                className="inline-block text-fg"
                initial={reduced ? false : { y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {head}
              </m.span>
            </span>
          ) : null}
        </p>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.08em]">
              {NAV.map((n) => (
                <li key={n.label}>
                  <Link href={n.href} className="inline-flex min-h-11 items-center no-underline hover:text-accent">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <VersionSwitcher className="hidden sm:block" />
          <MotionToggle className="v1-toggle" />
        </div>
      </div>
      {reduced ? null : <m.span aria-hidden="true" className="v1-mast-progress" style={{ scaleX: progress }} />}
    </header>
  );
}

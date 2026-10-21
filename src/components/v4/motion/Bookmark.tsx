"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";
import { MotionFeatures } from "@/components/shared/MotionFeatures";
import { SealStamp } from "./SealStamp";
import { useReduced } from "./hooks";

type Mode = "work" | "contact" | "none";

const COPY: Record<Exclude<Mode, "none">, { href: string; label: string }> = {
  work: { href: "#work", label: "Skip to the work" },
  contact: { href: "#contact", label: "Get in touch" },
};

/**
 * A sticky bookmark for readers in a hurry. Before the work section it says "Skip to the work";
 * once the work is on screen it offers "Get in touch"; at the letter it steps aside.
 * The little seal turns with page progress.
 */
export function Bookmark() {
  const [mode, setMode] = useState<Mode>("work");
  const reduced = useReduced();

  useEffect(() => {
    const work = document.getElementById("work");
    const contact = document.getElementById("contact");
    const update = () => {
      const vh = window.innerHeight;
      const workTop = work ? work.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      const contactTop = contact ? contact.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      setMode(contactTop < vh * 0.85 ? "none" : workTop < vh * 0.6 ? "contact" : "work");
    };
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    // First read on the next frame, not during hydration, so it never forces a layout of its own.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <MotionFeatures>
      <AnimatePresence mode="wait" initial={false}>
        {mode !== "none" ? (
          <m.nav
            key={mode}
            aria-label="Shortcut"
            className="v4-bookmark"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <a href={COPY[mode].href}>
              <SealStamp size={38} spin={270} trigger="none" />
              <span>{COPY[mode].label}</span>
            </a>
          </m.nav>
        ) : null}
      </AnimatePresence>
    </MotionFeatures>
  );
}

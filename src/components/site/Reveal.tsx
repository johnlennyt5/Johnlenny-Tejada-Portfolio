"use client";

import { useEffect } from "react";

/**
 * Scroll reveals and the lit section words. Elements with .reveal fade up once when they enter;
 * sections with [data-spy] get data-inview and light the matching nav link. Without JavaScript
 * nothing is hidden, because the hiding class (js-reveal) is only added here.
 */
export function Reveal() {
  useEffect(() => {
    const d = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    d.classList.add("js-reveal");

    const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    // Anything already on screen shows at once, the rest waits for scroll.
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) el.classList.add("is-in");
      else io.observe(el);
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-spy]"));
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          el.dataset.inview = String(e.isIntersecting);
          if (e.isIntersecting) {
            document.querySelectorAll(".nav-links a").forEach((a) => {
              a.setAttribute("aria-current", String(a.getAttribute("href") === `/#${el.id}`));
            });
          }
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    sections.forEach((s) => spy.observe(s));

    return () => {
      io.disconnect();
      spy.disconnect();
    };
  }, []);

  return null;
}

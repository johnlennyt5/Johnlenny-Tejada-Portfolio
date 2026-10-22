"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals and the lit section words. Elements with .reveal fade up once when they enter;
 * sections with [data-spy] get data-inview and light the matching nav link. Without JavaScript
 * nothing is hidden, because the hiding class (js-reveal) is only added here.
 *
 * This lives in the shared layout, which stays mounted across client-side navigation, so it
 * re-scans on every route change and also watches <main> for content that mounts later.
 * Otherwise a page reached by a link or the back button would keep its sections hidden.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const d = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      d.classList.remove("js-reveal");
      return;
    }
    d.classList.add("js-reveal");

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

    const seen = new WeakSet<Element>();
    const scan = () => {
      // Anything already on screen shows at once, the rest waits for scroll.
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-in)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) el.classList.add("is-in");
        else io.observe(el);
      });
      document.querySelectorAll<HTMLElement>("[data-spy]").forEach((s) => {
        if (seen.has(s)) return;
        seen.add(s);
        spy.observe(s);
      });
    };

    // Run after the new route has painted (a hash jump may also move the page first).
    const raf = requestAnimationFrame(() => requestAnimationFrame(scan));
    const main = document.getElementById("main");
    const mo = new MutationObserver(scan);
    if (main) mo.observe(main, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      io.disconnect();
      spy.disconnect();
    };
  }, [pathname]);

  return null;
}

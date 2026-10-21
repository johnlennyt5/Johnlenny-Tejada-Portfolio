"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMotionEnabled } from "./hooks";

const REVEAL = "[data-v3-reveal]";
const NODE = "[data-v3-node]";
const ORCH = "[data-v3-orch]";

type RunState = "queued" | "running" | "done";

/**
 * The page's one client driver for the v3 canvas. It renders nothing; it only writes data
 * attributes and text on server-rendered markup, so the page hydrates one tiny island instead of
 * one per card, node and panel.
 *
 * 1. Orchestrator panel (always, motion or not): the queue disclosure on phones (open, close,
 *    Escape, close on link), and each queue item's queued > running > done state by scroll position.
 * 2. Node status (motion on only): writes data-run on every <Node>; CSS draws the chip and marker.
 * 3. Reveal (motion on only): arms the <Reveal> elements that start below the fold and releases
 *    them as they enter. Arming reads positions from the IntersectionObserver's first callback,
 *    so it never forces a layout during hydration.
 */
export function CanvasDriver() {
  const enabled = useMotionEnabled();
  const pathname = usePathname();

  // 1. Orchestrator: disclosure.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(ORCH);
    const toggle = header?.querySelector<HTMLButtonElement>("[data-v3-orch-toggle]");
    const body = header?.querySelector<HTMLElement>(".v3-orch-body");
    if (!header || !toggle || !body) return;
    const setOpen = (open: boolean) => {
      header.dataset.open = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    const onToggle = () => setOpen(header.dataset.open !== "true");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && header.dataset.open === "true") {
        setOpen(false);
        toggle.focus();
      }
    };
    const onBodyClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest("a")) setOpen(false);
    };
    toggle.addEventListener("click", onToggle);
    body.addEventListener("click", onBodyClick);
    window.addEventListener("keydown", onKey);
    return () => {
      toggle.removeEventListener("click", onToggle);
      body.removeEventListener("click", onBodyClick);
      window.removeEventListener("keydown", onKey);
      setOpen(false);
    };
  }, [pathname]);

  // 1 and 2. Queue states and node states, from one read-then-write pass per scroll frame.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(ORCH);
    const links = header ? Array.from(header.querySelectorAll<HTMLAnchorElement>("[data-v3-q]")) : [];
    const sections = links.map((a) => document.getElementById(a.hash.slice(1)));
    const current = header?.querySelector<HTMLElement>("[data-v3-current]");
    const toggleDot = header?.querySelector<HTMLElement>(".v3-orch-dot");
    const nodes = enabled ? Array.from(document.querySelectorAll<HTMLElement>(NODE)) : [];
    if (links.length === 0 && nodes.length === 0) return;

    let frame = 0;
    let lastActive = Number.NaN;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      // Reads.
      const line = vh * 0.4;
      let active = -1;
      sections.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) active = i;
      });
      const doc = document.documentElement;
      if (active >= 0 && window.scrollY + vh >= doc.scrollHeight - 4) active = links.length;
      const runs: RunState[] = nodes.map((n) => {
        const r = n.getBoundingClientRect();
        return r.top > vh * 0.85 ? "queued" : r.bottom < vh * 0.45 ? "done" : "running";
      });
      // Writes.
      nodes.forEach((n, i) => {
        const s = runs[i];
        if (s && n.dataset.run !== s) n.dataset.run = s;
      });
      if (active === lastActive || !header) return;
      lastActive = active;
      const complete = active >= links.length;
      links.forEach((a, i) => {
        const state: RunState = i < active ? "done" : i === active ? "running" : "queued";
        a.dataset.state = state;
        a.firstElementChild?.setAttribute("data-state", state);
        if (state === "running") a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
      header.dataset.queue = complete ? "done" : "running";
      toggleDot?.setAttribute("data-state", complete ? "done" : "running");
      if (current) {
        const label = complete ? "Queue complete" : (links[Math.max(0, active)]?.dataset.label ?? "");
        if (current.textContent !== label) current.textContent = label;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      nodes.forEach((n) => {
        delete n.dataset.run;
      });
    };
  }, [enabled, pathname]);

  // 3. Reveal.
  useEffect(() => {
    if (!enabled) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL)).filter((el) => el.dataset.v3Reveal === "");
    if (els.length === 0) return;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        const limit = window.innerHeight * 0.92;
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (!seen.has(el)) {
            seen.add(el);
            if (entry.boundingClientRect.top > limit) el.dataset.v3Reveal = "armed";
            else io.unobserve(el);
            continue;
          }
          if (entry.isIntersecting) {
            el.dataset.v3Reveal = "in";
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      els.forEach((el) => {
        if (el.dataset.v3Reveal === "armed") el.dataset.v3Reveal = "in";
      });
    };
  }, [enabled, pathname]);

  return null;
}

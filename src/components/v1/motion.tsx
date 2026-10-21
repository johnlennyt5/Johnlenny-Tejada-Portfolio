"use client";

/**
 * v1 motion primitives. The rule of this version: type sets itself.
 * Every primitive renders its finished state in the static HTML, and only "arms" an
 * entrance after hydration when motion is allowed and the element starts below the fold.
 * Scroll-linked decoration (DrawRule, Parallax) stays static through hydration and arms
 * later, off screen; under reduced motion it never arms, so no stale transform is left behind.
 */
import {
  m,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { useMotionPreference } from "@/components/shared/MotionToggle";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const SCROLL_SPRING = { stiffness: 120, damping: 30, mass: 0.4 };

/** True once mounted, motion allowed, and the element started below the fold. */
export function useArmed(ref: RefObject<Element | null>): boolean {
  const { reduced } = useMotionPreference();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (reduced) {
      setArmed(false);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top > window.innerHeight * 0.9) setArmed(true);
  }, [reduced, ref]);
  return armed;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Rise distance in px. */
  y?: number;
}

/** Fades and rises into place the first time it enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 28 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const armed = useArmed(ref);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const hidden = armed && !inView;
  return (
    <m.div
      ref={ref}
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y } : { opacity: 1, y: 0 }}
      transition={hidden ? { duration: 0 } : { duration: 0.8, delay, ease: EASE_OUT }}
    >
      {children}
    </m.div>
  );
}

interface SetTitleProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
  /** Seconds between words. */
  stagger?: number;
  delay?: number;
}

/**
 * A headline whose words rise out of a slot, like type dropped into a forme.
 * The words stay in the DOM as plain text, separated by real spaces.
 */
export function SetTitle({ text, as = "h2", id, className, stagger = 0.06, delay = 0 }: SetTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const armed = useArmed(ref);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const hidden = armed && !inView;
  const words = text.split(" ");
  const Tag = as;
  return (
    <Tag ref={ref} id={id} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <m.span
              className="inline-block"
              initial={false}
              animate={hidden ? { y: "105%" } : { y: "0%" }}
              transition={hidden ? { duration: 0 } : { duration: 0.9, delay: delay + i * stagger, ease: EASE_OUT }}
            >
              {word}
            </m.span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

type ScrollOffset = NonNullable<NonNullable<Parameters<typeof useScroll>[0]>["offset"]>;

/**
 * Scroll-linked decoration arms late: after hydration, in an idle slot, and only while the
 * element is off screen, so switching from the static HTML to the live transform never shows
 * a jump and none of this work lands in the hydration task. Returns false under reduced
 * motion, and when `minWidth` (px) is given and the viewport is narrower.
 */
function useLateArm(ref: RefObject<Element | null>, minWidth?: number): boolean {
  const { reduced } = useMotionPreference();
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    setArmed(false);
    const el = ref.current;
    if (reduced || !el) return;
    if (minWidth && !window.matchMedia(`(min-width: ${minWidth}px)`).matches) return;
    let io: IntersectionObserver | undefined;
    const start = () => {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => !e.isIntersecting)) {
          setArmed(true);
          io?.disconnect();
        }
      });
      io.observe(el);
    };
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300);
    return () => {
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      io?.disconnect();
    };
  }, [reduced, ref, minWidth]);
  return armed;
}

interface DrawRuleProps {
  className?: string;
  /** Scroll window over which the rule draws. */
  offset?: ScrollOffset;
}

function LiveRule({ target, offset }: { target: RefObject<HTMLSpanElement | null>; offset: ScrollOffset }) {
  const { scrollYProgress } = useScroll({ target, offset });
  const scaleX = useSpring(scrollYProgress, SCROLL_SPRING);
  return <m.span className="v1-rule" style={{ scaleX }} />;
}

/** A hairline that draws from the left as its section enters (scaleX tied to scroll). */
export function DrawRule({ className, offset = ["start end", "start 55%"] }: DrawRuleProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useLateArm(ref);
  return (
    <span ref={ref} aria-hidden="true" className={`block ${className ?? ""}`}>
      {armed ? <LiveRule key="live" target={ref} offset={offset} /> : <span key="static" className="v1-rule" />}
    </span>
  );
}

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Distance in px travelled across the element's pass through the viewport (from +d to -d). */
  distance?: number;
  axis?: "x" | "y";
  /** Only move at this viewport width (px) and up; static below it. */
  minWidth?: number;
}

function LiveParallax({
  target,
  children,
  distance,
  axis,
}: {
  target: RefObject<HTMLDivElement | null>;
  children: ReactNode;
  distance: number;
  axis: "x" | "y";
}) {
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, SCROLL_SPRING);
  const v = useTransform(smooth, [0, 1], [distance, -distance]);
  return <m.div style={axis === "y" ? { y: v } : { x: v }}>{children}</m.div>;
}

/** Moves its content against the scroll, for margin numerals and decorative type. */
export function Parallax({ children, className, distance = 60, axis = "y", minWidth }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const armed = useLateArm(ref, minWidth);
  return (
    <div ref={ref} className={className}>
      {armed ? (
        <LiveParallax key="live" target={ref} distance={distance} axis={axis}>
          {children}
        </LiveParallax>
      ) : (
        <div key="static">{children}</div>
      )}
    </div>
  );
}

interface ParsedNumber {
  prefix: string;
  value: number;
  decimals: number;
  grouped: boolean;
  suffix: string;
}

function parseFigure(raw: string): ParsedNumber | null {
  const match = raw.match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix = "", digits = "", suffix = ""] = match;
  const decimals = digits.includes(".") ? (digits.split(".")[1]?.length ?? 0) : 0;
  return {
    prefix,
    value: Number(digits.replace(/,/g, "")),
    decimals,
    grouped: digits.includes(","),
    suffix,
  };
}

function formatFigure(p: ParsedNumber, v: number): string {
  const n = Math.max(0, v);
  const body = p.grouped
    ? n.toLocaleString("en-US", { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
    : n.toFixed(p.decimals);
  return `${p.prefix}${body}${p.suffix}`;
}

/**
 * A figure that counts up once when it first scrolls into view.
 * The static HTML and assistive tech always get the final value.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const armed = useArmed(ref);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const parsed = useMemo(() => parseFigure(value), [value]);
  const target = parsed?.value ?? 0;
  const source = useMotionValue(target);
  const spring = useSpring(source, { stiffness: 42, damping: 18, mass: 1, restDelta: 0.001 });
  const text = useTransform(spring, (v: number) => (parsed ? formatFigure(parsed, v) : value));

  useEffect(() => {
    if (!armed || !parsed) return;
    source.jump(0);
    spring.jump(0);
  }, [armed, parsed, source, spring]);

  useEffect(() => {
    if (armed && inView) source.set(target);
  }, [armed, inView, source, target]);

  return (
    <span ref={ref} className={className}>
      <span className="jt-sr-only">{value}</span>
      {parsed && armed ? <m.span aria-hidden="true">{text}</m.span> : <span aria-hidden="true">{value}</span>}
    </span>
  );
}

/** Page-level scroll progress, smoothed. Exposed for the masthead bar. */
export function usePageProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll();
  return useSpring(scrollYProgress, { stiffness: 200, damping: 40, mass: 0.3 });
}

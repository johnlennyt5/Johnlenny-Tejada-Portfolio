"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import type { DiagramProps } from "@/components/shared/diagrams";
import type { DiagramId } from "@/content";

type DiagramView = (props: DiagramProps) => ReactElement;

export interface LazyDiagramProps {
  id: DiagramId;
  caption: string;
  /** Accessible name while the drawing loads (the diagram's title and description). */
  label: string;
  /** CSS aspect ratios of the wide and tall layouts, e.g. "960 / 540". */
  wide: string;
  tall: string;
}

/**
 * A home-page diagram that mounts about one screen before it scrolls into view.
 * Until then it reserves the exact box of each layout (same .jt-diagram classes, so the
 * same container queries and max-height rules apply), which keeps layout shift at zero
 * and keeps several hundred SVG nodes out of the initial HTML, RSC payload and hydration.
 * The case study pages still render the full diagram on the server.
 */
export function LazyDiagram({ id, caption, label, wide, tall }: LazyDiagramProps) {
  const ref = useRef<HTMLElement>(null);
  const [View, setView] = useState<DiagramView | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let live = true;
    const load = () => {
      void import("@/components/shared/diagrams").then((mod) => {
        if (live) setView(() => mod.diagramsById[id]);
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => {
      live = false;
      io.disconnect();
    };
  }, [id]);

  if (View) return <View caption={caption} />;

  return (
    <figure ref={ref} className="jt-diagram v2-dg-pending" data-layout="auto">
      <div className="jt-dg jt-diagram-wide" role="img" aria-label={label} style={{ aspectRatio: wide }} />
      <div className="jt-dg jt-diagram-tall" role="img" aria-label={label} style={{ aspectRatio: tall }} />
      <figcaption className="jt-diagram-caption">{caption}</figcaption>
    </figure>
  );
}

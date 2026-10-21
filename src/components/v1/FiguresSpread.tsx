import type { ReactNode } from "react";
import type { FigureItem } from "./data";
import { CountUp } from "./motion";
import { SpreadStage } from "./SpreadStage";

interface FiguresSpreadProps {
  head: ReactNode;
  figures: FigureItem[];
  /** Small print under the spread. */
  note?: ReactNode;
}

function Plate({ f, i }: { f: FigureItem; i: number }) {
  return (
    <figure className="flex h-full flex-col justify-between border-l border-fg pl-4 md:pl-6">
      <p className="v1-label">
        Fig. {String(i + 1).padStart(2, "0")} <span className="text-fg">{f.source}</span>
      </p>
      <p className="v1-num mt-4 text-[clamp(3.75rem,min(7.6vw,21vh),9rem)]">
        <CountUp value={f.value} />
      </p>
      <figcaption className="mt-4 max-w-[22ch] text-lg leading-snug">{f.label}</figcaption>
    </figure>
  );
}

/**
 * The figures, set as a long horizontal spread. A server component: the plates are
 * server HTML (only CountUp hydrates); SpreadStage decides the layout. On wide screens
 * the section pins and vertical scroll slides the plates sideways. On phones and under
 * reduced motion it is an ordinary grid of plates, and the pinning code never loads.
 */
export function FiguresSpread({ head, figures, note }: FiguresSpreadProps) {
  return (
    <SpreadStage
      head={head}
      note={note}
      plates={figures.map((f, i) => (
        <Plate key={`${f.source}-${f.label}`} f={f} i={i} />
      ))}
    />
  );
}

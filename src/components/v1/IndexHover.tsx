"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useMotionPreference } from "@/components/shared/MotionToggle";
import type { PlateHandle } from "./IndexPlate";
import type { IndexRow } from "./IndexTable";

/**
 * The plate and its springs ship in their own chunk, fetched only for fine pointers and only
 * when the pointer first crosses the index, so nothing of it runs during page load.
 */
const IndexPlate = dynamic(() => import("./IndexPlate").then((mod) => mod.IndexPlate), { ssr: false });

/**
 * Pointer tracking for the index, by delegation: one listener on the table finds the
 * hovered row through its data-slug, so the rows themselves stay server HTML.
 */
export function IndexHover({ rows, children }: { rows: IndexRow[]; children: ReactNode }) {
  const { reduced } = useMotionPreference();
  const [active, setActive] = useState<string | null>(null);
  const [fine, setFine] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const plate = useRef<PlateHandle | null>(null);
  /** False until the loaded plate has been placed once; the first placement jumps, not springs. */
  const placed = useRef(false);
  /** Last pointer position over the index, for placing the plate the moment its chunk arrives. */
  const pointer = useRef({ x: 0, y: 0 });

  const onReady = useCallback(() => {
    plate.current?.move(pointer.current.x, pointer.current.y, true);
    placed.current = true;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const plates = fine && !reduced;

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!plates) return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (!engaged) setEngaged(true);
    const target = e.target instanceof Element ? e.target : null;
    const slug = target?.closest<HTMLElement>("[data-slug]")?.dataset.slug ?? null;
    if (plate.current) {
      plate.current.move(e.clientX, e.clientY, active === null || !placed.current);
      placed.current = true;
    }
    if (slug !== active) setActive(slug);
  }

  function onLeave() {
    placed.current = false;
    setActive(null);
  }

  return (
    <div className="relative" onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
      {plates && engaged ? <IndexPlate handle={plate} rows={rows} active={active} onReady={onReady} /> : null}
    </div>
  );
}

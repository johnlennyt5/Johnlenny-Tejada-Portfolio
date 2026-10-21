"use client";

import { m, useMotionValue, useSpring } from "framer-motion";
import { useLayoutEffect, type RefObject } from "react";
import type { IndexRow } from "./IndexTable";

const PLATE_W = 340;
const PLATE_H = 420;

export interface PlateHandle {
  /** Follow the pointer. `jump` places the plate without the spring (first entry). */
  move: (clientX: number, clientY: number, jump: boolean) => void;
}

interface IndexPlateProps {
  /** Filled by the plate once loaded, so the table can steer it without re-rendering. */
  handle: RefObject<PlateHandle | null>;
  rows: IndexRow[];
  active: string | null;
  /** Called once the handle is live, so the owner can place the plate at the current pointer. */
  onReady?: () => void;
}

/**
 * The printed plate that follows the cursor over the index. It repeats what the row
 * already says, so it is hidden from assistive tech. Loaded on demand by IndexHover.
 */
export function IndexPlate({ handle, rows, active, onReady }: IndexPlateProps) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 260, damping: 28, mass: 0.5 });
  const sy = useSpring(py, { stiffness: 260, damping: 28, mass: 0.5 });

  useLayoutEffect(() => {
    handle.current = {
      move(clientX, clientY, jump) {
        const flip = clientX > window.innerWidth * 0.58;
        const x = flip ? clientX - PLATE_W - 36 : clientX + 36;
        const y = Math.min(Math.max(clientY - PLATE_H / 2, 76), window.innerHeight - PLATE_H - 16);
        if (jump) {
          sx.jump(x);
          sy.jump(y);
        }
        px.set(x);
        py.set(y);
      },
    };
    onReady?.();
    return () => {
      handle.current = null;
    };
  }, [handle, px, py, sx, sy, onReady]);

  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-30"
      style={{ x: sx, y: sy, width: PLATE_W, height: PLATE_H }}
      initial={false}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.92, rotate: active ? -1.5 : 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {rows.map((r) => (
        <div key={r.slug} className="v1-plate" data-tone={r.tone} style={{ opacity: active === r.slug ? 1 : 0 }}>
          <div className="v1-halftone absolute -right-10 -top-10 h-48 w-48 rounded-full" />
          <div className="relative flex items-start justify-between font-mono text-[0.7rem] uppercase tracking-[0.1em]">
            <span>No. {r.no}</span>
            <span>{r.year}</span>
          </div>
          <div className="relative">
            <p className="font-display text-[3rem] font-black leading-[0.86] tracking-[-0.05em]">{r.name}</p>
            <p className="mt-3 text-sm leading-snug opacity-90">{r.tagline}</p>
          </div>
          <div className="relative border-t border-current pt-3">
            {r.proof ? (
              <>
                <p className="v1-num text-[4.25rem]">{r.proof.value}</p>
                <p className="mt-1 text-xs">{r.proof.label}</p>
              </>
            ) : (
              <p className="font-display text-2xl font-extrabold tracking-[-0.03em]">{r.dates}</p>
            )}
          </div>
        </div>
      ))}
    </m.div>
  );
}

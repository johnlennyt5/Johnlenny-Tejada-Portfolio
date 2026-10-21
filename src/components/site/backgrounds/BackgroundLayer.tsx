"use client";

import { useEffect, useState, type ComponentType } from "react";
import type { BackgroundId } from "../prefs";

export interface BgProps {
  /** Call when the effect cannot run (no WebGL). The page keeps the plain background. */
  onFail: () => void;
  /** Call once the first frame is drawn, so the page switches to the see-through surfaces. */
  onReady: () => void;
}

/* Each background is its own chunk, loaded only when chosen. "void" (the default) loads nothing. */
const loaders: Record<Exclude<BackgroundId, "void">, () => Promise<{ default: ComponentType<BgProps> }>> = {
  aurora: () => import("./Aurora"),
  wavegrid: () => import("./WaveGrid"),
  swarm: () => import("./NeuralSwarm"),
  field: () => import("./ForceField"),
  glass: () => import("./LiquidGlass"),
};

/**
 * Mounts the chosen animated background behind the page. It follows html[data-bg] (set by the
 * boot script and the picker) and sets html[data-bg-live] only while a background is drawing,
 * so the page stays on its solid background until the effect is actually visible.
 */
export function BackgroundLayer() {
  const [id, setId] = useState<BackgroundId>("void");
  const [Comp, setComp] = useState<ComponentType<BgProps> | null>(null);

  useEffect(() => {
    const d = document.documentElement;
    const read = () => setId((d.dataset.bg as BackgroundId) || "void");
    read();
    const mo = new MutationObserver(read);
    mo.observe(d, { attributes: true, attributeFilter: ["data-bg"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const d = document.documentElement;
    delete d.dataset.bgLive;
    setComp(null);
    if (id === "void" || !(id in loaders)) return;
    let live = true;
    loaders[id]()
      .then((m) => live && setComp(() => m.default))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [id]);

  if (!Comp) return null;
  return (
    <div className="bg-layer" aria-hidden="true">
      <Comp
        key={id}
        onReady={() => {
          document.documentElement.dataset.bgLive = id;
        }}
        onFail={() => {
          delete document.documentElement.dataset.bgLive;
          setComp(null);
        }}
      />
      <div className="bg-scrim" />
    </div>
  );
}

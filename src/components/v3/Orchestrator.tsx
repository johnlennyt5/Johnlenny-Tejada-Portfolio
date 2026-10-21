import Link from "next/link";
import type { ReactNode } from "react";
import { MonogramStatic } from "@/components/shared/MonogramStatic";
import { MotionToggle } from "@/components/shared/MotionToggle";
import { VersionSwitcher } from "@/components/shared/VersionSwitcher";
import { profile } from "@/content";
import { ScrollProgress } from "./motion/Parallax";

export interface QueueItem {
  id: string;
  label: string;
}

export interface OrchestratorProps {
  /** Queue name shown under the panel title, for example "portfolio" or "run-log/prismshift". */
  queue: string;
  items: QueueItem[];
  homeHref: string;
  /** Extra links and buttons rendered under the queue (server-rendered children are fine). */
  children?: ReactNode;
}

const pad = (n: number) => String(n).padStart(2, "0");
const BODY_ID = "v3-orch-body";

/**
 * The Orchestrator panel: a fixed left column on desktop, a sticky bar with a queue
 * disclosure on phones. Each section of the page is a queue item whose status dot moves
 * queued > running > done as the reader passes it. The status is position, not decoration,
 * so it updates with or without motion.
 *
 * Server rendered. The disclosure and the live statuses are wired by the page's one
 * CanvasDriver (motion/RevealObserver.tsx) through the data-v3-* hooks below, so the panel
 * itself ships no component code; only the shared MotionToggle and VersionSwitcher hydrate.
 */
export function Orchestrator({ queue, items, homeHref, children }: OrchestratorProps) {
  return (
    <header className="v3-orch" data-open="false" data-queue="running" data-v3-orch="">
      <div className="v3-orch-top">
        <Link href={homeHref} className="flex min-w-0 items-center gap-3 no-underline">
          {/* Static: its stroke draw ran on the main thread at load, alongside the hero typing. */}
          <MonogramStatic variant="terminal" size={40} decorative />
          <span className="min-w-0">
            <span className="block truncate font-display text-lg leading-tight font-bold">{profile.name}</span>
            <span className="hidden truncate font-mono text-[0.6875rem] text-muted sm:block lg:block">
              {profile.headline}
            </span>
          </span>
        </Link>
        <button
          type="button"
          className="v3-orch-toggle"
          aria-expanded="false"
          aria-controls={BODY_ID}
          data-v3-orch-toggle=""
        >
          <span className="v3-dot v3-orch-dot" data-state="running" aria-hidden="true" />
          <span>
            <span className="jt-sr-only">Page queue, now: </span>
            <span data-v3-current="">{items[0]?.label}</span>
          </span>
        </button>
      </div>

      <div id={BODY_ID} className="v3-orch-body">
        <div className="hidden lg:block">
          <p className="v3-eyebrow">Orchestrator</p>
          <p className="mt-1 font-mono text-xs text-muted">
            queue: <span className="text-fg">{queue}</span>
          </p>
        </div>

        <nav aria-label="Sections on this page">
          <ol className="v3-queue">
            {items.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} data-state="queued" data-label={item.label} data-v3-q="">
                  <span className="v3-dot" data-state="queued" aria-hidden="true" />
                  <span className="v3-q-num" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="hidden lg:block">
          <ScrollProgress />
          <p className="mt-2 font-mono text-[0.6875rem] text-muted" aria-hidden="true">
            robot JT <span className="v3-tone-run v3-robot-run">running</span>
            <span className="v3-tone-ok v3-robot-done">idle, all done</span>
          </p>
        </div>

        <div className="flex flex-col gap-2">{children}</div>

        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <MotionToggle className="v3-toggle" label="Motion" />
          <VersionSwitcher label="Design versions" />
        </div>
      </div>
    </header>
  );
}

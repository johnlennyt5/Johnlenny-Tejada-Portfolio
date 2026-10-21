import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MotionProvider, MOTION_STORAGE_KEY } from "@/components/shared/MotionToggle";
import "../globals.css";

/* The four earlier design studies. Kept for reference, hidden from search and the main nav. */

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Applies a saved "motion off" choice before first paint. Storage access can throw, so it is guarded. */
const motionBootScript = `try{var m=localStorage.getItem(${JSON.stringify(MOTION_STORAGE_KEY)});if(m==="off"||m==="on"){document.documentElement.dataset.motion=m}}catch(e){}`;

/**
 * Sections below the fold use content-visibility: auto, so the browser only estimates their
 * height until they near the screen. Before any jump to a #fragment (a link click, or a page
 * opened with a hash) this sets html[data-cv="off"], which renders every section for real
 * (globals.css), so the jump lands exactly on its target.
 */
const fragmentJumpScript = `(function(){var d=document.documentElement;if(location.hash.length>1)d.dataset.cv="off";document.addEventListener("click",function(e){var t=e.target;var a=t&&t.closest?t.closest("a[href*='#']"):null;if(a)d.dataset.cv="off"},true)})();`;

export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: motionBootScript + fragmentJumpScript }} />
      <MotionProvider>{children}</MotionProvider>
    </>
  );
}

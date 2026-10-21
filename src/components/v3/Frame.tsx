import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { CopyEmail, Monogram, MotionToggle, ResumeButton, VersionSwitcher } from "@/components/shared";
import { profile } from "@/content";
import { getVersion, routes } from "@/lib/site";
import { CanvasDriver } from "./motion/RevealObserver";
import { Orchestrator, type QueueItem } from "./Orchestrator";

const PANEL_LINK =
  "flex min-h-11 items-center justify-between gap-2 rounded-lg border border-line px-3 font-mono text-xs font-bold no-underline hover:border-accent";

/**
 * Page frame for every v3 route: the Orchestrator panel, the content column and the footer.
 * Pages render their own <main id="main"> inside `children`.
 */
export function Frame({
  queue,
  items,
  children,
  back,
}: {
  queue: string;
  items: QueueItem[];
  children: ReactNode;
  /** Optional "back to" link shown first in the panel. */
  back?: { href: string; label: string };
}) {
  return (
    <>
      <Orchestrator queue={queue} items={items} homeHref={routes.home("v3")}>
        {back ? (
          <Link href={back.href} className={PANEL_LINK}>
            <span>{back.label}</span>
            <span aria-hidden="true">&larr;</span>
          </Link>
        ) : null}
        <Link href={routes.about("v3")} className={PANEL_LINK}>
          <span>About Johnlenny</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
        <ResumeButton className={PANEL_LINK}>
          <span>Resume (PDF)</span>
          <span aria-hidden="true">&darr;</span>
        </ResumeButton>
        <CopyEmail className={`${PANEL_LINK} w-full bg-transparent text-left text-fg`} label="Copy email address" />
      </Orchestrator>
      <div className="v3-page">
        {children}
        {/* Its own hydration unit, so it never adds to the first long task. */}
        <Suspense>
          <Footer />
        </Suspense>
      </div>
      <CanvasDriver />
    </>
  );
}

export function Footer() {
  const v = getVersion("v3");
  return (
    <footer className="border-t border-line bg-surface px-4 pt-12 pb-10 sm:px-8 lg:px-14">
      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <Monogram variant="terminal" size={56} decorative animate={false} />
            <div>
              <p className="font-display text-2xl font-bold leading-tight">{profile.name}</p>
              <p className="font-mono text-xs text-muted">
                {profile.headline}, {profile.location.short}
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
            You are viewing {v.id}, {v.name}: {v.description} The same facts are told four ways; pick another
            design below.
          </p>
          <VersionSwitcher display="full" label="Design versions, footer" className="v3-footer-switcher mt-4" />
        </div>
        <div className="grid content-start gap-6 sm:grid-cols-2">
          <nav aria-label="Footer">
            <p className="v3-eyebrow">Links</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link href={routes.home("v3")} className="v3-link inline-flex min-h-9 items-center">
                  Home
                </Link>
              </li>
              <li>
                <Link href={routes.about("v3")} className="v3-link inline-flex min-h-9 items-center">
                  About
                </Link>
              </li>
              <li>
                <Link href={routes.compare} className="v3-link inline-flex min-h-9 items-center">
                  All versions
                </Link>
              </li>
              <li>
                <a href={profile.links.github.href} className="v3-link inline-flex min-h-9 items-center">
                  GitHub
                </a>
              </li>
              <li>
                <a href={profile.links.linkedin.href} className="v3-link inline-flex min-h-9 items-center">
                  LinkedIn
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <p className="v3-eyebrow">Controls</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              <MotionToggle className="v3-toggle" label="Motion" />
              <ResumeButton className="v3-btn">Download resume (PDF)</ResumeButton>
              <CopyEmail className="v3-btn" label="Copy email address" copiedLabel="Copied to clipboard" />
            </div>
          </div>
        </div>
      </div>
      <p className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-6 font-mono text-xs text-muted">
        <span className="v3-dot" data-state="done" aria-hidden="true" />
        <span>End event. The robot is idle until the next job.</span>
      </p>
    </footer>
  );
}

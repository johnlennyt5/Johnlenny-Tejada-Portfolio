"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { defaultVersion, routes, versions, type VersionId } from "@/lib/site";

export interface VersionSwitcherProps {
  /** Override the detected version (detected from the URL; "/" counts as the default version). */
  current?: VersionId;
  className?: string;
  /** "compact" shows v1 to v4; "full" adds the direction names. */
  display?: "compact" | "full";
  /** Accessible name of the nav landmark. */
  label?: string;
}

function detect(pathname: string | null): VersionId {
  const match = pathname?.match(/^\/(v[1-4])(\/|$)/);
  return (match?.[1] as VersionId | undefined) ?? defaultVersion;
}

/**
 * Links between the four design versions. Each link goes to that version's home.
 * Styling hooks: .jt-version-switcher, [aria-current="page"], and CSS variables
 * --vs-fg, --vs-muted, --vs-accent, --vs-line (all fall back to currentColor).
 */
export function VersionSwitcher({ current, className, display = "compact", label = "Design versions" }: VersionSwitcherProps) {
  const pathname = usePathname();
  const active = current ?? detect(pathname);
  return (
    <nav aria-label={label} className={`jt-version-switcher${className ? ` ${className}` : ""}`}>
      <ul>
        {versions.map((v) => {
          const isActive = v.id === active;
          return (
            <li key={v.id}>
              <Link
                href={routes.home(v.id)}
                aria-current={isActive ? "page" : undefined}
                title={`${v.name}: ${v.description}`}
              >
                <span className="jt-vs-id">{v.id}</span>
                {display === "full" ? <span className="jt-vs-name">{v.name}</span> : null}
                {display === "compact" ? <span className="jt-sr-only">{`, ${v.name}`}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

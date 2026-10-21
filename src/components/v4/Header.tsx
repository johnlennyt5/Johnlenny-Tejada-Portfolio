import Link from "next/link";
import { CopyEmail } from "@/components/shared/CopyEmail";
import { MonogramStatic } from "@/components/shared/MonogramStatic";
import { MotionToggle } from "@/components/shared/MotionToggle";
import { ResumeButton } from "@/components/shared/ResumeButton";
import { VersionSwitcher } from "@/components/shared/VersionSwitcher";
import { profile } from "@/content";
import { getVersion, routes } from "@/lib/site";

/* `short` is the label on phones, so the row never wraps whichever font (fallback or Fraunces) is showing. */
const NAV = [
  { label: "Chapters", short: "Story", href: `${routes.home("v4")}#chapters` },
  { label: "The work", short: "Work", href: `${routes.home("v4")}#work` },
  { label: "About", short: "About", href: routes.about("v4") },
  { label: "Write me", short: "Write", href: `${routes.home("v4")}#contact` },
];

/** The masthead: seal, name, a short contents line, the motion switch and the version switcher. */
export function Header() {
  return (
    <header className="v4-masthead">
      {/* Phones: a fixed two-row grid (name and motion switch, then a one-line nav), so the masthead
          has the same height with fallback fonts and with Fraunces. sm and up: one flex row. */}
      <div className="v4-wrap v4-masthead-row py-3">
        <Link href={routes.home("v4")} className="flex min-h-11 min-w-0 items-center gap-3 no-underline">
          <span className="block h-9 w-9 shrink-0 sm:h-11 sm:w-11">
            <MonogramStatic variant="seal" size="100%" decorative className="v4-seal-draw" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="v4-display block truncate text-base font-semibold whitespace-nowrap min-[400px]:text-lg">{profile.name}</span>
            <span className="v4-italic hidden text-sm text-muted sm:block">{getVersion("v4").name}</span>
          </span>
        </Link>
        <nav aria-label="Site" className="v4-masthead-nav">
          <ul className="m-0 flex h-11 list-none flex-nowrap items-center justify-between gap-x-1 p-0 sm:justify-start sm:gap-x-4">
            {NAV.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link href={item.href} className="v4-navlink whitespace-nowrap">
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <MotionToggle className="v4-toggle" />
          <VersionSwitcher className="hidden lg:block" label="Design versions" />
        </div>
      </div>
    </header>
  );
}

/** A colophon, as at the back of a book: contacts, every version, and how it was set. */
export function Footer() {
  const v = getVersion("v4");
  return (
    <footer className="mt-16 border-t-[3px] border-double border-[var(--c-strong-line)]">
      <div className="v4-wrap grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-4">
            <MonogramStatic variant="seal" size={64} decorative />
            <p className="v4-italic text-3xl leading-tight">The end, for now.</p>
          </div>
          <p className="mt-4 max-w-md text-muted">
            {profile.name}. {profile.headline}, {profile.location.label}. {profile.availability}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CopyEmail className="v4-btn" label="Copy my email" copiedLabel="Copied, thank you" />
            <ResumeButton className="v4-btn-ghost" />
          </div>
          <ul className="mt-5 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
            <li>
              <a className="v4-link inline-flex min-h-11 items-center" href={profile.links.linkedin.href} rel="me noopener">
                LinkedIn
              </a>
            </li>
            <li>
              <a className="v4-link inline-flex min-h-11 items-center" href={profile.links.github.href} rel="me noopener">
                GitHub
              </a>
            </li>
            <li>
              <Link className="v4-link inline-flex min-h-11 items-center" href={routes.about("v4")}>
                About me
              </Link>
            </li>
            <li>
              <Link className="v4-link inline-flex min-h-11 items-center" href={routes.compare}>
                All versions
              </Link>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7">
          <h2 className="v4-eyebrow">Four editions of one portfolio</h2>
          <p className="mt-2 text-muted">You are reading {v.id}: {v.description}</p>
          <VersionSwitcher display="full" className="v4-vs-full mt-4" label="Design versions, footer" />
          <p className="mt-8 text-sm text-muted">
            Colophon: set in Fraunces and Source Serif 4, with captions in Caveat, on cream paper with a terracotta
            thread.
          </p>
        </div>
      </div>
    </footer>
  );
}

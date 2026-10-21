import Link from "next/link";
import { Monogram, MotionToggle, ResumeButton, VersionSwitcher } from "@/components/shared";
import { profile, projects } from "@/content";
import { getVersion, routes } from "@/lib/site";
import { ExternalArrow } from "./ui";

const home = routes.home("v2");

export function Header() {
  return (
    <header className="v2-header">
      <div className="v2-container v2-header-inner">
        <Link href={home} className="flex min-h-11 items-center gap-3 no-underline" aria-label={`${profile.name}, ${getVersion("v2").name} home`}>
          <Monogram variant="cinematic" size={34} decorative />
          <span className="hidden font-display text-[1.05rem] font-semibold tracking-tight sm:inline">{profile.name}</span>
        </Link>
        <nav aria-label="Primary" className="v2-nav">
          <ul className="flex items-center">
            <li>
              <Link href={`${home}#work`}>Work</Link>
            </li>
            <li className="hidden md:block">
              <Link href={`${home}#how`}>How I work</Link>
            </li>
            <li className="hidden md:block">
              <Link href={routes.about("v2")}>About</Link>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <VersionSwitcher className="hidden xl:block" label="Design versions, header" />
          <MotionToggle className="v2-toggle" />
        </div>
      </div>
      {/* Page progress: a CSS scroll timeline in theme.css, hidden where unsupported. */}
      <div className="v2-progress" aria-hidden="true" />
    </header>
  );
}

export function Footer() {
  const work = [...projects].sort((a, b) => a.order - b.order);
  return (
    <footer className="v2-footer">
      <div className="v2-container py-16 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <Monogram variant="cinematic" size={56} animate={false} decorative />
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">{profile.name}</p>
              <p className="text-muted">
                {profile.headline}, {profile.location.short}
              </p>
            </div>
          </div>
          <MotionToggle className="v2-toggle self-start sm:self-auto" label="Motion" />
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Footer">
            <p className="v2-eyebrow">Explore</p>
            <ul className="mt-4 grid gap-1">
              <li>
                <Link className="v2-link inline-flex min-h-11 items-center" href={`${home}#work`}>
                  Featured work
                </Link>
              </li>
              <li>
                <Link className="v2-link inline-flex min-h-11 items-center" href={`${home}#how`}>
                  How I work
                </Link>
              </li>
              <li>
                <Link className="v2-link inline-flex min-h-11 items-center" href={routes.about("v2")}>
                  About
                </Link>
              </li>
              <li>
                <a className="v2-link inline-flex min-h-11 items-center" href="#contact">
                  Contact
                </a>
              </li>
              <li>
                <Link className="v2-link inline-flex min-h-11 items-center" href={routes.compare}>
                  All versions
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Case studies">
            <p className="v2-eyebrow">Case studies</p>
            <ul className="mt-4 grid gap-1">
              {work.map((p) => (
                <li key={p.slug}>
                  <Link className="v2-link inline-flex min-h-11 items-center" href={routes.work("v2", p.slug)}>
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="v2-eyebrow">Elsewhere</p>
            <ul className="mt-4 grid gap-1">
              <li>
                <a className="v2-link inline-flex min-h-11 items-center gap-1" href={profile.links.linkedin.href} rel="me noopener">
                  LinkedIn <ExternalArrow />
                </a>
              </li>
              <li>
                <a className="v2-link inline-flex min-h-11 items-center gap-1" href={profile.links.github.href} rel="me noopener">
                  GitHub <ExternalArrow />
                </a>
              </li>
              <li>
                <ResumeButton className="v2-link inline-flex min-h-11 items-center">{profile.resume.label}</ResumeButton>
              </li>
            </ul>
          </div>
          <div>
            <p className="v2-eyebrow">This site, four ways</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              You are watching {getVersion("v2").name}: {getVersion("v2").description}
            </p>
            <VersionSwitcher className="v2-switcher-full mt-4" display="full" label="Design versions" />
          </div>
        </div>

        <p className="mt-16 border-t border-line pt-6 font-mono text-xs tracking-wide text-muted">
          {profile.name}. {profile.location.label}. {profile.languages.join(" and ")}.
        </p>
      </div>
    </footer>
  );
}

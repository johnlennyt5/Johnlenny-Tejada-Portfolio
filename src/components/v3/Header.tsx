import Link from "next/link";
import { Monogram, MotionToggle, VersionSwitcher } from "@/components/shared";
import { profile } from "@/content";
import { routes } from "@/lib/site";

/* Stub header and footer for v3. Replace freely. */
export function Header() {
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
      <Link href={routes.home("v3")} className="flex items-center gap-3 font-display text-lg font-bold no-underline">
        <Monogram variant="terminal" size={40} decorative />
        <span>{profile.name}</span>
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <VersionSwitcher />
        <MotionToggle className="inline-flex min-h-11 items-center rounded-full border border-line px-4 font-medium no-underline hover:border-accent text-sm" />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-5xl border-t border-line px-4 py-10 text-sm text-muted sm:px-6">
      <p>
        {profile.name}, {profile.location.short}.{" "}
        <Link href={routes.about("v3")} className="underline underline-offset-4">
          About Johnlenny
        </Link>
      </p>
    </footer>
  );
}

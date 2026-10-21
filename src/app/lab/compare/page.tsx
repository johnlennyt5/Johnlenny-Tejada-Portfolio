import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SkipLink } from "@/components/shared/SkipLink";
import { getProject, profile } from "@/content";
import { perfTarget, qaByVersion, qaRunDate, qaSummary, type LighthouseScores } from "@/lib/qa";
import { pageMetadata } from "@/lib/seo";
import { getVersion, routes } from "@/lib/site";

/*
 * /compare: the four design versions side by side, with the latest QA scores.
 * Linked from each version's footer as "All versions", not from the main nav.
 * Uses only the shared tokens in globals.css and system fonts, so it belongs to no version.
 */

export const metadata: Metadata = {
  ...pageMetadata({
    title: "All versions",
    description: "One portfolio, four designs: the same facts told four ways, with accessibility and Lighthouse results.",
    path: routes.compare,
    og: "default",
  }),
  robots: { index: false, follow: true },
};

const scoreKeys: { key: keyof LighthouseScores; short: string; long: string }[] = [
  { key: "performance", short: "Perf", long: "Performance" },
  { key: "accessibility", short: "A11y", long: "Accessibility" },
  { key: "bestPractices", short: "BP", long: "Best Practices" },
  { key: "seo", short: "SEO", long: "SEO" },
];

function ScoreCell({ value, isPerf }: { value: number; isPerf: boolean }) {
  const below = isPerf && value < perfTarget;
  return (
    <td className={`px-1.5 py-1 text-right tabular-nums ${below ? "font-bold text-accent-2 underline decoration-2 underline-offset-4" : ""}`}>
      {value}
      {below ? <span className="jt-sr-only"> (below the target)</span> : null}
    </td>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <SkipLink />
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-8">
          <Link href={routes.root} className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">
            {profile.name}
          </Link>
          <p className="text-sm text-muted">{profile.headline}</p>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-[1440px] px-4 pt-12 pb-16 outline-none sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">All versions</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          One portfolio, four designs
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Every version tells the same facts from one shared content file, in a different design direction. The default
          address shows {getVersion("v3").name}. Pick the one you like and open it.
        </p>

        <ul className="mt-12 grid list-none gap-x-6 gap-y-14 p-0 md:grid-cols-2 xl:grid-cols-4">
          {qaByVersion.map((qa) => {
            const v = getVersion(qa.id);
            const caseProject = getProject(qa.caseSlug);
            return (
              <li key={v.id} className="flex flex-col">
                <figure className="relative m-0 mb-8 pr-[12%]">
                  <Image
                    src={`/compare/${v.id}-1440.webp`}
                    sizes="(min-width: 1280px) 330px, (min-width: 768px) 45vw, 90vw"
                    width={960}
                    height={600}
                    alt={`${v.name} home page at desktop width`}
                    className="block h-auto w-full rounded-md border border-line bg-surface"
                  />
                  <Image
                    src={`/compare/${v.id}-390.webp`}
                    sizes="120px"
                    width={390}
                    height={844}
                    alt={`${v.name} home page at phone width`}
                    className="absolute right-0 -bottom-6 block h-auto w-[24%] rounded-md border-2 border-fg bg-surface shadow-lg"
                  />
                </figure>

                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-muted">{v.id}</span>
                  {v.isDefault ? (
                    <span className="rounded-full border border-line px-2 py-0.5 font-mono text-xs text-muted">default at /</span>
                  ) : null}
                </div>
                <h2 className="mt-1 text-2xl font-bold leading-snug">{v.name}</h2>
                <p className="mt-1 text-sm font-semibold text-muted">{v.short}</p>
                <p className="mt-3 leading-relaxed">{v.description}</p>

                <ul className="mt-4 flex list-none flex-wrap gap-x-4 p-0 text-sm">
                  <li>
                    <Link href={routes.home(v.id)} className="inline-flex min-h-11 items-center font-semibold text-accent underline underline-offset-4">
                      Open {v.id}
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.about(v.id)} className="inline-flex min-h-11 items-center underline underline-offset-4">
                      About
                    </Link>
                  </li>
                  {caseProject ? (
                    <li>
                      <Link
                        href={routes.work(v.id, caseProject.slug)}
                        className="inline-flex min-h-11 items-center underline underline-offset-4"
                      >
                        {caseProject.name} case study
                      </Link>
                    </li>
                  ) : null}
                </ul>

                <div className="mt-5 border-t border-line pt-4">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    Lighthouse, axe: {qa.axeViolations} violations
                  </p>
                  {qa.pages.map((page) => (
                    <table key={page.path} className="mt-3 w-full border-collapse font-mono text-xs">
                      <caption className="pb-1 text-left font-sans text-sm font-semibold">
                        {page.label}
                        {page.note ? <span className="block font-normal text-muted">{page.note}</span> : null}
                      </caption>
                      <thead>
                        <tr className="border-b border-line text-muted">
                          <th scope="col" className="py-1 text-left font-normal">
                            <span className="jt-sr-only">Device</span>
                          </th>
                          {scoreKeys.map((s) => (
                            <th key={s.key} scope="col" className="px-1.5 py-1 text-right font-normal">
                              <abbr title={s.long} className="no-underline">
                                {s.short}
                              </abbr>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(["mobile", "desktop"] as const).map((device) => (
                          <tr key={device} className="border-b border-line">
                            <th scope="row" className="py-1 text-left font-normal capitalize">
                              {device}
                            </th>
                            {scoreKeys.map((s) => (
                              <ScoreCell key={s.key} value={page[device][s.key]} isPerf={s.key === "performance"} />
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ))}
                  <p className="mt-3 text-sm leading-relaxed text-muted">{qa.perfNote}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <section aria-labelledby="how-measured" className="mt-20 max-w-3xl border-t border-line pt-8">
          <h2 id="how-measured" className="text-2xl font-bold">
            How these were measured
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            Run on {qaRunDate} against the static build. Lighthouse mobile runs use a slowed CPU, so they are the hard
            test. The target is {perfTarget} or more in every category. Scores that are{" "}
            <span className="font-bold text-accent-2 underline decoration-2 underline-offset-4">underlined</span> are
            below that target.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed">
            {qaSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm sm:px-8">
          <p className="text-muted">{profile.name}</p>
          <ul className="flex list-none flex-wrap gap-x-5 p-0">
            <li>
              <Link href={routes.root} className="inline-flex min-h-11 items-center underline underline-offset-4">
                Home
              </Link>
            </li>
            <li>
              <a href={profile.links.linkedin.href} className="inline-flex min-h-11 items-center underline underline-offset-4" rel="me noopener">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.links.github.href} className="inline-flex min-h-11 items-center underline underline-offset-4" rel="me noopener">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

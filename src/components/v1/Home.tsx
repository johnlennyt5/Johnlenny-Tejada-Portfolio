import { Suspense } from "react";
import { profile } from "@/content";
import { getVersion, routes } from "@/lib/site";
import { figureItems, homeSections, indexNumber, indexOrder, plateTone } from "./data";
import { FiguresSpread } from "./FiguresSpread";
import { Hero } from "./Hero";
import { IndexTable, type IndexRow } from "./IndexTable";
import { Masthead } from "./Masthead";
import { SectionHead } from "./SectionHead";
import { Colophon, ContactSection, NowSection, PeopleSection, RecordSection, SystemsSection } from "./sections";

/**
 * v1 home: "The Index", a Swiss annual report of a career.
 * Cover, index of work, two practices, the figures, the record, off the books, now, correspondence.
 *
 * Hydration is staged. The masthead and the cover hydrate in the first pass; every section
 * below the fold sits in its own Suspense boundary. Nothing here suspends, so the server HTML
 * is identical, but React hydrates each boundary as a separate, interruptible task after the
 * first pass instead of one long task, which keeps the main thread free for the first paint.
 */
export function Home() {
  const version = getVersion("v1");
  const s = homeSections;
  const rows: IndexRow[] = indexOrder.map((p, i) => ({
    slug: p.slug,
    href: routes.work("v1", p.slug),
    no: indexNumber(p.slug),
    year: p.dates.start.slice(0, 4),
    name: p.name,
    tagline: p.tagline,
    role: p.role,
    dates: p.dates.label,
    stack: p.stack.slice(0, 4),
    proof: p.metrics[0] ? { value: p.metrics[0].value, label: p.metrics[0].label } : undefined,
    tone: plateTone(i),
  }));

  return (
    <>
      <Masthead name={profile.name} />
      <main id="main">
        <Hero
          given={profile.givenName}
          family={profile.familyName}
          kicker={version.name}
          kickerNote="An annual report of a career"
          location={profile.location.short}
          edition="Edition of 2026"
          headline={profile.headline}
          subhead={profile.subhead}
          secondary={profile.secondaryHeadline}
          availability={profile.availability}
          intro={profile.intro}
        />

        <Suspense>
          <section
            id={s.work.id}
            aria-labelledby={`${s.work.id}-title`}
            data-running-head={`${s.work.num} ${s.work.label}`}
          >
            <SectionHead
              num={s.work.num}
              label={s.work.label}
              title={s.work.title}
              titleId={`${s.work.id}-title`}
              deck="Every project in the report, set in order of weight. Each row opens a full case study: the problem, the decisions, what broke, and the caveats."
            />
            <div className="v1-wrap mt-12 md:mt-20">
              <IndexTable rows={rows} />
            </div>
          </section>
        </Suspense>

        <Suspense>
          <SystemsSection s={s.systems} />
        </Suspense>

        <Suspense>
          <section
            id={s.figures.id}
            aria-labelledby={`${s.figures.id}-title`}
            data-running-head={`${s.figures.num} ${s.figures.label}`}
            className="mt-8"
          >
            <FiguresSpread
              head={
                <SectionHead
                  compact
                  num={s.figures.num}
                  label={s.figures.label}
                  title={s.figures.title}
                  titleId={`${s.figures.id}-title`}
                />
              }
              figures={figureItems()}
              note={
                <p className="v1-label max-w-[70ch] normal-case tracking-normal">
                  Counted from my own repositories and the HumanixOS record. Commit counts are mine alone.
                </p>
              }
            />
          </section>
        </Suspense>

        <Suspense>
          <RecordSection s={s.record} />
        </Suspense>
        <Suspense>
          <PeopleSection s={s.people} />
        </Suspense>
        <Suspense>
          <NowSection s={s.now} />
        </Suspense>
        <Suspense>
          <ContactSection s={s.contact} />
        </Suspense>
      </main>
      <Suspense>
        <Colophon />
      </Suspense>
    </>
  );
}

export default Home;

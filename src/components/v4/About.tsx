import Link from "next/link";
import { CopyEmail, ResumeButton } from "@/components/shared";
import { experience, getProject, profile, timeline } from "@/content";
import type { TimelineEntry } from "@/content";
import { routes } from "@/lib/site";
import { Polaroid } from "./artifacts/Artifacts";
import { Footer, Header } from "./Header";
import { ChapterBook } from "./motion/ChapterBook";
import { RiseWords } from "./motion/RiseWords";
import { SealStamp } from "./motion/SealStamp";
import { BeyondWork, ExperienceEntry, Letter, TypeCase } from "./Parts";

const KIND_LABEL: Record<TimelineEntry["kind"], string> = {
  work: "Work",
  build: "Built",
  community: "Community",
  education: "School",
  award: "Recognition",
};

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  const project = entry.project ? getProject(entry.project) : undefined;
  return (
    <li id={`tl-${entry.id}`} className="v4-chapter v4-tl-item list-none">
      <span className="v4-bead" aria-hidden="true">
        <span />
      </span>
      <div className="v4-chapter-body grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-6">
        <p className="leading-tight">
          <span className="v4-numeral block text-3xl">{entry.year}</span>
          <span className="v4-smallcaps text-sm text-muted">{entry.when}</span>
        </p>
        <div>
          <p className="v4-smallcaps text-sm text-accent">{KIND_LABEL[entry.kind]}</p>
          <h3 className="v4-display text-[1.45rem] leading-snug font-semibold">{entry.title}</h3>
          <p className="mt-1 max-w-[40rem] leading-relaxed">{entry.body}</p>
          {project ? (
            <Link className="v4-link mt-1 inline-flex min-h-11 items-center" href={routes.work("v4", project.slug)}>
              Read the {project.name} case study
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/** About the author: portrait, first-person bio, the whole timeline on the thread, then the record. */
export function About() {
  const marks = timeline.map((t) => ({ id: `tl-${t.id}`, numeral: String(t.year), years: t.when }));
  return (
    <>
      <Header />
      <main id="main">
        <section aria-labelledby="about-title" className="v4-wrap grid gap-12 pt-10 pb-16 sm:pt-14 lg:grid-cols-12">
          <div className="relative flex justify-center lg:col-span-4 lg:justify-start">
            <div className="relative pt-4" style={{ transform: "rotate(-3deg)" }}>
              <Polaroid caption="Hola, I'm Johnlenny" priority />
              <SealStamp size="100%" spin={90} delay={0.2} className="absolute -top-8 -right-12 h-24 w-24 sm:h-28 sm:w-28" />
            </div>
          </div>
          <div className="lg:col-span-8">
            <p className="v4-eyebrow">About the author</p>
            <h1 id="about-title" className="v4-hero-name mt-5 !text-[clamp(3rem,10vw,7rem)]">
              About <span className="v4-hero-last">{profile.givenName}</span>
            </h1>
            <p className="v4-display mt-6 text-[clamp(1.35rem,2.8vw,1.9rem)] leading-snug">
              {profile.headline}. <span className="text-muted">{profile.secondaryHeadline}</span>
            </p>
            <div className="v4-prose mt-8 !max-w-[40rem]">
              {profile.bio.map((para, i) => (
                <p key={para.slice(0, 40)} className={i === 0 ? "v4-dropcap" : undefined}>
                  {para}
                </p>
              ))}
            </div>
            <p className="mt-6 text-muted">
              {profile.location.label}. {profile.availability}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CopyEmail className="v4-btn" label="Copy my email" copiedLabel="Copied, thank you" />
              <ResumeButton className="v4-btn-ghost" />
              <a className="v4-btn-ghost" href={profile.links.linkedin.href} rel="me noopener">
                LinkedIn
              </a>
              <a className="v4-btn-ghost" href={profile.links.github.href} rel="me noopener">
                GitHub
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="timeline-title" className="py-16 sm:py-20">
          <div className="v4-wrap">
            <div className="lg:pl-[11.5rem]">
              <p className="v4-eyebrow">The long version</p>
              <RiseWords as="h2" id="timeline-title" text="Every year on the thread" className="v4-section-title mt-3 max-w-[14ch]" />
            </div>
            <ChapterBook marks={marks}>
              <ol className="m-0 p-0">
                {timeline.map((t) => (
                  <TimelineItem key={t.id} entry={t} />
                ))}
              </ol>
            </ChapterBook>
          </div>
        </section>

        <section aria-labelledby="record-title" className="py-16 sm:py-20">
          <div className="v4-wrap">
            <p className="v4-eyebrow">The record</p>
            <RiseWords as="h2" id="record-title" text="At work, and beyond it" className="v4-section-title mt-3 max-w-[16ch]" />
            <div className="v4-spread mt-12">
              <section aria-label="At work">
                <p className="v4-italic text-4xl" aria-hidden="true">
                  At work
                </p>
                {experience.map((e) => (
                  <ExperienceEntry key={e.id} e={e} full level={3} />
                ))}
              </section>
              <section aria-label="Beyond work">
                <p className="v4-italic text-4xl" aria-hidden="true">
                  Beyond work
                </p>
                <BeyondWork level={3} />
              </section>
            </div>
          </div>
        </section>

        <section aria-labelledby="skills-title" className="py-16 sm:py-20">
          <div className="v4-wrap grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="v4-eyebrow">Tools</p>
              <RiseWords as="h2" id="skills-title" text="The type case" className="v4-section-title mt-3" />
              <p className="mt-4 text-muted">
                Sorted into drawers the way a printer sorts type. Notes say where a tool is project work or past tense.
              </p>
            </div>
            <div className="lg:col-span-8">
              <TypeCase headingLevel={3} />
            </div>
          </div>
        </section>

        <Letter />
      </main>
      <Footer />
    </>
  );
}

export default About;

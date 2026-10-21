import Link from "next/link";
import { projects, type Project } from "@/content";
import { routes } from "@/lib/site";
import { ProjectArtifact } from "./artifacts/Artifacts";
import { PaperStack, StackSheet } from "./motion/PaperStack";
import { roman, teamLabel } from "./story";

const TILTS = [-0.8, 0.7, -0.5, 0.9, -0.7, 0.5, -0.9];

export const orderedProjects: Project[] = [...projects].sort((a, b) => a.order - b.order);

function ProjectSheet({ project, index }: { project: Project; index: number }) {
  const titleId = `plate-${project.slug}`;
  const href = routes.work("v4", project.slug);
  return (
    <article className="v4-paper grid gap-8 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10 lg:p-9" aria-labelledby={titleId}>
      <div className="lg:col-span-7">
        <p className="v4-eyebrow v4-dots flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-accent">Plate {roman(index + 1)}</span>
          <span>{project.dates.label}</span>
          <span>{teamLabel[project.team]}</span>
        </p>
        <h3 id={titleId} className="v4-italic mt-3 text-[clamp(2.4rem,5.4vw,4.1rem)] leading-[0.95]">
          <Link href={href} className="no-underline hover:text-accent">
            {project.name}
          </Link>
        </h3>
        <p className="mt-2 text-lg text-accent">{project.tagline}</p>
        <p className="mt-4 max-w-xl leading-relaxed">{project.oneLiner}</p>
        {project.metrics.length > 0 ? (
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
            {project.metrics.slice(0, 3).map((mt) => (
              <div key={mt.evidence} className="flex flex-col-reverse">
                <dt className="max-w-[11rem] text-sm leading-snug text-muted">{mt.label}</dt>
                <dd className="v4-display m-0 text-3xl font-semibold leading-none">{mt.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className="mt-5 text-sm text-muted">
          <span className="v4-smallcaps text-fg">Set in</span> {project.stack.slice(0, 6).join(", ")}
        </p>
        <Link href={href} className="v4-btn mt-6">
          Read the case study<span className="jt-sr-only">: {project.name}</span>
        </Link>
      </div>
      <div className="flex items-center justify-center lg:col-span-5">
        <ProjectArtifact project={project} />
      </div>
    </article>
  );
}

/** Part two: every project as a sheet of paper on a growing pile. */
export function WorkSection() {
  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-4 py-20 sm:py-28">
      <div className="v4-wrap">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="v4-eyebrow">Part two</p>
            <h2 id="work-title" className="v4-section-title mt-3">
              The work, plate by plate
            </h2>
          </div>
          <p className="self-end text-lg text-muted lg:col-span-5">
            Each plate opens a full case study: the problem, the decisions, what broke, the tests and the fine print.
          </p>
        </div>
        <div className="mt-14">
          <PaperStack total={orderedProjects.length} label="Projects">
            {orderedProjects.map((p, i) => (
              <StackSheet key={p.slug} index={i} total={orderedProjects.length} tilt={TILTS[i % TILTS.length]}>
                <ProjectSheet project={p} index={i} />
              </StackSheet>
            ))}
          </PaperStack>
        </div>
      </div>
    </section>
  );
}

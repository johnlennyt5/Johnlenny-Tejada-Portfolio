import Link from "next/link";
import { CopyEmail } from "@/components/shared/CopyEmail";
import { ResumeButton } from "@/components/shared/ResumeButton";
import { getProject, nowBuilding, profile } from "@/content";
import { routes } from "@/lib/site";
import { Node } from "../motion/Node";
import { Reveal } from "../motion/Reveal";
import { Prompt, SectionHeading, StatusPill, Window } from "../ui";

export function Now({ id, index }: { id: string; index: string }) {
  return (
    <Node
      id={id}
      index={index}
      label="Running now"
      kind="Parallel"
      heading={
        <SectionHeading id={id} index={index}>
          Still <em>running.</em>
        </SectionHeading>
      }
    >
      <ul className="mt-12 grid gap-5 lg:grid-cols-3">
        {nowBuilding.map((item, i) => {
          const project = item.project ? getProject(item.project) : undefined;
          return (
            <Reveal as="li" key={item.id} delay={i * 0.07}>
              <article className="v3-card h-full p-5 sm:p-6" aria-labelledby={`now-${item.id}`}>
                <StatusPill state="running" />
                <h3 id={`now-${item.id}`} className="mt-4 font-display text-2xl leading-none font-bold tracking-tight sm:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{item.detail}</p>
                {project ? (
                  <p className="mt-4">
                    <Link href={routes.work("v3", project.slug)} className="v3-link font-mono text-sm">
                      {project.name} run log
                    </Link>
                  </p>
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </ul>
    </Node>
  );
}

export function Handoff({ id, index }: { id: string; index: string }) {
  return (
    <Node
      id={id}
      index={index}
      label="Handoff"
      kind="End event"
      shape="event"
      heading={
        <SectionHeading id={id} index={index} lead={<p>{profile.availability}</p>}>
          Hand me <em>the next process.</em>
        </SectionHeading>
      }
    >
      <Reveal className="mt-12">
        <Window title="jt@providence: ~/contact" bodyClassName="p-5 sm:p-8">
          <Prompt cmd="contact johnlenny --prefer email" />
          <p className="mt-3 max-w-2xl leading-relaxed">
            The fastest way to reach me is email. My resume, LinkedIn and GitHub are one click away too. I work in
            {` ${profile.languages.join(" and ")}`}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CopyEmail
              className="v3-btn v3-btn-primary"
              label="Copy email address"
              copiedLabel="Copied to clipboard"
            />
            <ResumeButton className="v3-btn">Download resume (PDF)</ResumeButton>
            <a className="v3-btn" href={profile.links.linkedin.href}>
              LinkedIn
            </a>
            <a className="v3-btn" href={profile.links.github.href}>
              GitHub
            </a>
          </div>
          <p className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
            <StatusPill state="done">ready</StatusPill>
            <span>{profile.location.label}</span>
          </p>
        </Window>
      </Reveal>
    </Node>
  );
}

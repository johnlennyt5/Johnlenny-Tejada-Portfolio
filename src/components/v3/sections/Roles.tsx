import Link from "next/link";
import { getProject, identities } from "@/content";
import { routes } from "@/lib/site";
import { Node } from "../motion/Node";
import { Reveal } from "../motion/Reveal";
import { SectionHeading, countWord } from "../ui";

export function Roles({ id, index }: { id: string; index: string }) {
  return (
    <Node
      id={id}
      index={index}
      label="Process definitions"
      kind="Pool"
      heading={
        <SectionHeading id={id} index={index}>
          {countWord(identities.length, true)} roles, <em>one engineer.</em>
        </SectionHeading>
      }
    >
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {identities.map((identity, i) => {
          const primary = identity.rank === "primary";
          return (
            <Reveal key={identity.id} delay={i * 0.08}>
              <article
                className={`v3-card h-full p-6 sm:p-8 ${primary ? "border-[color:var(--c-ok)]" : ""}`}
                aria-labelledby={`role-${identity.id}`}
              >
                <p className={`v3-eyebrow ${primary ? "v3-tone-ok" : "v3-tone-queue"}`}>
                  {primary ? "Primary process" : "Secondary process"}
                </p>
                <h3
                  id={`role-${identity.id}`}
                  className="mt-3 font-display text-3xl leading-[0.95] font-bold tracking-tight sm:text-4xl"
                >
                  {identity.title}
                </h3>
                <p className="mt-4 leading-relaxed">{identity.pitch}</p>
                <ul className="mt-6 space-y-3 text-[0.9375rem] leading-relaxed">
                  {identity.proof.map((line) => (
                    <li key={line} className="grid grid-cols-[1.25rem_1fr] gap-2">
                      <span className="font-mono v3-tone-ok" aria-hidden="true">
                        &#10003;
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-dashed border-line pt-4">
                  <p className="font-mono text-xs text-muted">runs on</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {identity.projects.map((slug) => {
                      const p = getProject(slug);
                      if (!p) return null;
                      return (
                        <li key={slug}>
                          <Link
                            href={routes.work("v3", slug)}
                            className="v3-chip inline-flex min-h-9 items-center no-underline hover:border-[color:var(--c-ok)]"
                          >
                            <strong>{p.name}</strong>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Node>
  );
}

import { getExperience, getProject, skills, type Project } from "@/content";
import { Node } from "../motion/Node";
import { Reveal } from "../motion/Reveal";
import { RunbookStage, type RunbookStep } from "../motion/RunbookStage";
import { SectionHeading, Window, countWord } from "../ui";

function decision(project: Project | undefined, title: string): string | undefined {
  return project?.caseStudy.decisions.find((d) => d.title === title)?.detail;
}

/**
 * How he builds an automation, as six steps. Every step's text is quoted from a real
 * build in src/content; a step whose source text is missing is dropped, never invented.
 */
function buildSteps(): RunbookStep[] {
  const hx = getExperience("humanixos");
  const ilop = getProject("ilop");
  const prism = getProject("prismshift");
  const hl = (needle: string) => hx.highlights.find((h) => h.includes(needle));
  const raw: { title: string; detail: string | undefined; source: string }[] = [
    { title: "Map the process", detail: hl("PDD and SDD"), source: hx.company },
    { title: "Queue the work", detail: decision(ilop, "Email in, queued work"), source: "ILOP" },
    {
      title: "Orchestrate, then reason",
      detail: decision(ilop, "Deterministic orchestration, non-deterministic reasoning"),
      source: "ILOP",
    },
    { title: "People where it matters", detail: hl("human-in-the-loop"), source: hx.company },
    { title: "Prove it in CI", detail: decision(prism, "Tenant isolation proven, not promised"), source: "PrismShift" },
    { title: "Run it unattended", detail: hl("unattended UiPath import bot"), source: hx.company },
  ];
  return raw.filter((s): s is RunbookStep => typeof s.detail === "string");
}

function Manifest() {
  return (
    <Window title="robot.config.json" className="mt-16">
      <h3 id="packages-title" className="v3-eyebrow">
        Installed activity packages
      </h3>
      <div className="v3-manifest mt-4">
        <span className="p">{"{"}</span>
        <dl className="pl-4 sm:pl-6">
          {skills.map((g, gi) => (
            <div key={g.id} className="py-1">
              <dt className="inline">
                <span className="k">&quot;{g.title}&quot;</span>
                <span className="p">: [</span>
              </dt>{" "}
              <dd className="inline">
                {g.items.map((item) => (
                  <span key={item} className="s">
                    &quot;{item}&quot;
                  </span>
                ))}
                <span className="p">]{gi < skills.length - 1 ? "," : ""}</span>
                {g.note ? <span className="block text-muted">{`// ${g.note}`}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <span className="p">{"}"}</span>
      </div>
    </Window>
  );
}

export function Runbook({ id, index }: { id: string; index: string }) {
  const steps = buildSteps();
  return (
    <Node
      id={id}
      index={index}
      label="Runbook"
      kind="State machine"
      heading={
        <SectionHeading
          id={id}
          index={index}
          lead={
            <p>
              {countWord(steps.length, true)} steps I follow on every automation, each one taken from a build you can
              read about here.
            </p>
          }
        >
          How I build <em>an automation.</em>
        </SectionHeading>
      }
    >
      <div className="mt-12">
        <RunbookStage steps={steps} />
      </div>
      <Reveal>
        <Manifest />
      </Reveal>
    </Node>
  );
}

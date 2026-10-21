import { Suspense } from "react";
import { skills } from "@/content";
import { Frame } from "./Frame";
import { Flow } from "./motion/Flow";
import { Ticker } from "./motion/Ticker";
import { Hero } from "./sections/Hero";
import { Human } from "./sections/Human";
import { Handoff, Now } from "./sections/NowHandoff";
import { Production } from "./sections/Production";
import { Roles } from "./sections/Roles";
import { Runbook } from "./sections/Runbook";
import { Work } from "./sections/Work";
import { pad2 } from "./ui";

/** The home page queue. Order here is the order on the page and in the Orchestrator panel. */
const QUEUE = [
  { id: "whoami", label: "whoami" },
  { id: "roles", label: "Roles" },
  { id: "work", label: "Job queue" },
  { id: "production", label: "Production" },
  { id: "runbook", label: "Runbook" },
  { id: "human", label: "Human in the loop" },
  { id: "now", label: "Running now" },
  { id: "handoff", label: "Handoff" },
] as const;

const idx = (id: (typeof QUEUE)[number]["id"]) => pad2(QUEUE.findIndex((q) => q.id === id) + 1);

/**
 * v3 home: The Robot Room. Also rendered at "/" (keep this export name).
 * The page is one BPMN canvas: a whoami terminal, then a connector that draws itself down
 * through each section while the JT bot rides it and each node goes queued > running > done.
 */
export function Home() {
  const ticker = [
    ...(skills.find((s) => s.id === "automation")?.items ?? []),
    ...(skills.find((s) => s.id === "ai")?.items ?? []),
  ];
  return (
    <Frame queue="portfolio" items={[...QUEUE]}>
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero id="whoami" nextId="roles" />
        <Ticker items={ticker} />
        <div className="px-4 pt-20 pb-24 sm:px-8 sm:pt-28 lg:px-14">
          <Flow>
            {/*
              Each section is its own Suspense boundary. Nothing here suspends; the boundaries let
              React hydrate the page in small slices after the hero instead of one long task.
            */}
            <div className="grid gap-32 sm:gap-40">
              <Suspense>
                <Roles id="roles" index={idx("roles")} />
              </Suspense>
              <Suspense>
                <Work id="work" index={idx("work")} />
              </Suspense>
              <Suspense>
                <Production id="production" index={idx("production")} />
              </Suspense>
              <Suspense>
                <Runbook id="runbook" index={idx("runbook")} />
              </Suspense>
              <Suspense>
                <Human id="human" index={idx("human")} />
              </Suspense>
              <Suspense>
                <Now id="now" index={idx("now")} />
              </Suspense>
              <Suspense>
                <Handoff id="handoff" index={idx("handoff")} />
              </Suspense>
            </div>
          </Flow>
        </div>
      </main>
    </Frame>
  );
}

export default Home;

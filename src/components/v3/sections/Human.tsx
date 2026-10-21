import Link from "next/link";
import { awards, beyondCode, community, education, getExperience, profile } from "@/content";
import { routes } from "@/lib/site";
import { Node } from "../motion/Node";
import { Reveal } from "../motion/Reveal";
import { SectionHeading } from "../ui";

interface Task {
  id: string;
  kind: string;
  title: string;
  meta?: string;
  detail: string;
  link?: { href: string; label: string };
  wide?: boolean;
  tone?: "ok" | "run" | "queue";
}

/** Action Center style task cards: the human work that sits around the code. */
function tasks(): Task[] {
  const award = awards[0];
  const sc = getExperience("supreme-cuts");
  const pick = (id: string) => community.find((c) => c.id === id);
  const list: Task[] = [];
  if (award) {
    list.push({
      id: award.id,
      kind: "Award",
      title: award.wording,
      detail: award.detail,
      link: award.link ? { href: award.link.href, label: award.link.label } : undefined,
      wide: true,
      tone: "run",
    });
  }
  for (const id of ["tedxprovidence", "bryant-hackathon", "teaching"]) {
    const c = pick(id);
    if (c) list.push({ id: c.id, kind: "Leadership", title: c.title, meta: c.dates, detail: c.detail, tone: "queue" });
  }
  list.push({
    id: sc.id,
    kind: "Before software",
    title: `${sc.role}, ${sc.company}`,
    meta: `${sc.location}, ${sc.dates.label}`,
    detail: sc.highlights.join(" "),
    tone: "ok",
  });
  const uri = education.find((e) => e.id === "uri");
  const dev = education.find((e) => e.id === "devaccelerator");
  if (uri && dev) {
    list.push({
      id: "education",
      kind: "Education",
      title: `${uri.credential}, ${uri.school}`,
      meta: uri.dates,
      detail: `Then a ${dev.credential} from ${dev.school} (${dev.dates}). ${dev.detail ?? ""}`.trim(),
      tone: "ok",
    });
  }
  return list;
}

export function Human({ id, index }: { id: string; index: string }) {
  const list = tasks();
  return (
    <Node
      id={id}
      index={index}
      label="Human in the loop"
      kind="User task"
      heading={
        <SectionHeading id={id} index={index} lead={<p>{profile.bio[3]}</p>}>
          The human <em>in the loop.</em>
        </SectionHeading>
      }
    >
      <ul className="mt-12 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {list.map((t, i) => (
          <Reveal as="li" key={t.id} delay={(i % 3) * 0.06} className={t.wide ? "md:col-span-2 2xl:col-span-3" : ""}>
            <article
              className={`v3-card h-full p-5 sm:p-6 ${t.wide ? "sm:p-8" : ""}`}
              aria-labelledby={`task-${t.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.6875rem] text-muted">
                <span className={`font-bold tracking-[0.1em] uppercase v3-tone-${t.tone ?? "ok"}`}>{t.kind}</span>
                <span className="inline-flex items-center gap-2">
                  <span className="v3-dot" data-state="done" aria-hidden="true" />
                  task completed
                </span>
              </div>
              <h3
                id={`task-${t.id}`}
                className={`mt-4 font-display leading-[0.95] font-bold tracking-tight ${
                  t.wide ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl"
                }`}
              >
                {t.title}
              </h3>
              {t.meta ? <p className="mt-2 font-mono text-xs text-muted">{t.meta}</p> : null}
              <p className="mt-4 leading-relaxed">{t.detail}</p>
              {t.link ? (
                <p className="mt-4">
                  <a href={t.link.href} className="v3-link font-mono text-sm">
                    {t.link.label}
                  </a>
                </p>
              ) : null}
            </article>
          </Reveal>
        ))}
      </ul>

      <Reveal className="mt-8">
        <div className="v3-card p-5 sm:p-6">
          <p className="v3-eyebrow">Beyond code</p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 font-mono text-sm sm:grid-cols-2">
            {beyondCode.map((line) => (
              <li key={line} className="grid grid-cols-[1.25rem_1fr] gap-1">
                <span className="v3-tone-ok" aria-hidden="true">
                  &rsaquo;
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <Link href={routes.about("v3")} className="v3-btn">
              Read the full profile <span aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </Reveal>
    </Node>
  );
}

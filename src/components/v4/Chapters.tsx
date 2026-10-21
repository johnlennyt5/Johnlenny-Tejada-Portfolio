import Link from "next/link";
import type { ReactNode } from "react";
import {
  AttendanceCard,
  Blueprint,
  BudgetLedger,
  Certificate,
  EventBadge,
  Notepad,
  ProgramCard,
  Rosette,
  ShippingLabel,
  ShopBooks,
  StoreTicket,
  WorkOrder,
} from "./artifacts/Artifacts";
import { BarberPole } from "./motion/BarberPole";
import { ChapterBook } from "./motion/ChapterBook";
import { RiseWords } from "./motion/RiseWords";
import { Settle } from "./motion/Settle";
import { chapters, type Chapter } from "./story";

function ChapterArtifact({ chapter }: { chapter: Chapter }): ReactNode {
  switch (chapter.artifact) {
    case "attendance":
      return (
        <Settle from={-5} rest={-2} to={1}>
          <AttendanceCard />
        </Settle>
      );
    case "budget":
      return (
        <Settle from={4} rest={1.5} to={-1}>
          <BudgetLedger />
        </Settle>
      );
    case "books":
      return (
        <div className="flex items-center justify-center gap-5 sm:gap-8">
          <BarberPole className="shrink-0" />
          <Settle className="min-w-0 flex-1" from={-4} rest={-1} to={2}>
            <ShopBooks />
          </Settle>
        </div>
      );
    case "certificate":
      return (
        <Settle from={3} rest={0.8} to={-1.5}>
          <Certificate />
        </Settle>
      );
    case "workorder":
      return (
        <Settle from={-4} rest={-1.5} to={1.5}>
          <WorkOrder />
        </Settle>
      );
    case "builders":
      return (
        <div className="relative flex flex-col items-center sm:block sm:min-h-[35rem]">
          <Settle className="z-10 sm:absolute sm:top-0 sm:left-0" from={-9} rest={-4} to={-1} drift={30}>
            <EventBadge />
          </Settle>
          <Settle className="z-20 -mt-6 sm:absolute sm:top-12 sm:right-0 sm:mt-0" from={8} rest={3} to={-1} drift={70}>
            <Rosette />
          </Settle>
          <Settle className="z-30 -mt-4 sm:absolute sm:bottom-0 sm:left-[16%] sm:mt-0" from={-2} rest={1.5} to={5} drift={20}>
            <ProgramCard />
          </Settle>
        </div>
      );
    case "store":
      return (
        <Settle from={-3} rest={-1} to={2}>
          <StoreTicket />
        </Settle>
      );
    case "shipping":
      return (
        <Settle from={5} rest={2} to={-1}>
          <ShippingLabel />
        </Settle>
      );
    case "blueprint":
      return (
        <Settle from={-4} rest={-1.2} to={2}>
          <Blueprint variant="ilop" />
        </Settle>
      );
    case "notepad":
      return (
        <Settle from={3} rest={1} to={-2}>
          <Notepad />
        </Settle>
      );
  }
}

function ChapterArticle({ chapter, index }: { chapter: Chapter; index: number }) {
  const flip = index % 2 === 1;
  const titleId = `${chapter.id}-title`;
  return (
    <article id={chapter.id} className="v4-chapter" aria-labelledby={titleId}>
      <span className="v4-bead" aria-hidden="true">
        <span />
      </span>
      <div className="v4-chapter-body">
        <p className="v4-eyebrow">
          Chapter {chapter.numeral} <span aria-hidden="true">·</span> {chapter.years} <span aria-hidden="true">·</span>{" "}
          {chapter.place}
        </p>
        <RiseWords as="h3" id={titleId} text={chapter.title} className="v4-chapter-title mt-4 max-w-[15ch]" />
        <div className="mt-10 grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          <div className={`lg:col-span-6 ${flip ? "lg:order-2" : ""}`}>
            <div className="v4-prose">
              {chapter.paragraphs.map((p, i) => (
                <p key={p.slice(0, 40)} className={i === 0 ? "v4-dropcap" : undefined}>
                  {p}
                </p>
              ))}
            </div>
            {chapter.list && chapter.list.length > 0 ? (
              <ul className="v4-list-dash mt-6 max-w-[38rem] space-y-3 p-0 leading-relaxed">
                {chapter.list.map((item) => (
                  <li key={item} className="list-none">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {chapter.quote ? (
              <blockquote className="v4-quote mt-10 max-w-[30rem] border-l-[3px] border-[var(--c-accent)] pl-5">
                {chapter.quote}
              </blockquote>
            ) : null}
            {chapter.credit ? <p className="v4-smallcaps mt-6 text-base text-muted">{chapter.credit}</p> : null}
            {chapter.links.length > 0 ? (
              <ul className="mt-8 flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
                {chapter.links.map((l) =>
                  l.href.startsWith("/") ? (
                    <li key={l.href}>
                      <Link className="v4-link inline-flex min-h-11 items-center text-lg" href={l.href}>
                        {l.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={l.href}>
                      <a className="v4-link inline-flex min-h-11 items-center text-lg" href={l.href} rel="noopener">
                        {l.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            ) : null}
          </div>
          <figure className={`m-0 lg:col-span-6 ${flip ? "lg:order-1" : ""}`}>
            <ChapterArtifact chapter={chapter} />
            <figcaption className="v4-hand mt-6 text-center">{chapter.caption}</figcaption>
          </figure>
        </div>
      </div>
    </article>
  );
}

/** Part one: the life, chapter by chapter, along a terracotta thread. */
export function ChaptersSection() {
  const marks = chapters.map((c) => ({ id: c.id, numeral: c.numeral, years: c.years }));
  return (
    <section id="chapters" aria-labelledby="chapters-title" className="scroll-mt-4 pt-16 sm:pt-24">
      <div className="v4-wrap">
        <div className="lg:pl-[11.5rem]">
          <p className="v4-eyebrow">Part one</p>
          <h2 id="chapters-title" className="v4-section-title mt-3 max-w-[14ch]">
            From the barbershop books to AI agents
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted">Oldest first. Follow the terracotta thread down the margin.</p>
        </div>
        <ChapterBook marks={marks}>
          {chapters.map((c, i) => (
            <ChapterArticle key={c.id} chapter={c} index={i} />
          ))}
        </ChapterBook>
      </div>
    </section>
  );
}

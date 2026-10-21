import type { CSSProperties, ReactNode } from "react";

export type RunState = "queued" | "running" | "done" | "exception";

/** Zero-padded index: 1 > "01". */
export const pad2 = (n: number) => String(n).padStart(2, "0");

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** Small counts as words for headlines ("Seven jobs"). */
export function countWord(n: number, capital = false): string {
  const w = WORDS[n] ?? String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

export function StatusPill({ state, children }: { state: RunState; children?: ReactNode }) {
  return (
    <span className="v3-pill" data-state={state}>
      <span className="v3-dot" data-state={state === "exception" ? "running" : state} aria-hidden="true" />
      {children ?? state}
    </span>
  );
}

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * A shell prompt line. With `typed`, the command types itself once (CSS steps on a cover,
 * transform only); its base style is the finished line.
 */
export function Prompt({
  cmd,
  typed = false,
  delay = 0,
  path = "~",
  className,
  caret = false,
}: {
  cmd: string;
  typed?: boolean;
  delay?: number;
  path?: string;
  className?: string;
  caret?: boolean;
}) {
  const style: CSSVars = {
    "--n": cmd.length,
    "--dur": `${Math.max(0.25, cmd.length * 0.045)}s`,
    "--delay": `${delay}s`,
  };
  return (
    <p className={`v3-prompt${className ? ` ${className}` : ""}`}>
      <span className="v3-ps1" aria-hidden="true">
        jt@providence<b>:{path}</b>$
      </span>{" "}
      {typed ? (
        <span className="v3-type v3-anim" style={style}>
          {cmd}
        </span>
      ) : (
        <span>{cmd}</span>
      )}
      {caret ? <span className="v3-caret-block jt-caret" aria-hidden="true" /> : null}
    </p>
  );
}

/** Output that appears after a prompt (opacity and a small lift, once). */
export function Out({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "p";
}) {
  const style: CSSVars = { "--delay": `${delay}s` };
  const Tag = as;
  return (
    <Tag className={`v3-out v3-anim${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </Tag>
  );
}

/**
 * Section heading with an oversized outlined index drifting behind it. The drift is a CSS
 * scroll-driven animation (no JavaScript); browsers without view timelines show it still.
 */
export function SectionHeading({
  id,
  index,
  children,
  lead,
}: {
  id: string;
  index: string;
  children: ReactNode;
  lead?: ReactNode;
}) {
  return (
    <div className="relative mt-6 sm:mt-8">
      <div aria-hidden="true" className="v3-ghost v3-drift absolute -top-6 right-0 text-[7rem] sm:-top-10 sm:text-[11rem]">
        {index}
      </div>
      <h2 id={`${id}-title`} className="v3-h2 relative max-w-[16ch]">
        {children}
      </h2>
      {lead ? <div className="relative mt-5 max-w-2xl text-lg leading-relaxed text-muted">{lead}</div> : null}
    </div>
  );
}

/** Terminal window chrome. */
export function Window({
  title,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`v3-term${className ? ` ${className}` : ""}`}>
      <div className="v3-term-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="ml-2 truncate">{title}</span>
      </div>
      <div className={bodyClassName ?? "p-5 sm:p-7"}>{children}</div>
    </div>
  );
}

/** A log list: a mono tag column and a message column. */
export function Log({
  entries,
  className,
}: {
  entries: { tag: string; tone: "ok" | "run" | "queue" | "exc" | "muted"; body: ReactNode; key: string }[];
  className?: string;
}) {
  if (entries.length === 0) return null;
  return (
    <ul className={`v3-log${className ? ` ${className}` : ""}`}>
      {entries.map((e) => (
        <li key={e.key}>
          <span className={`v3-tag ${e.tone === "muted" ? "text-muted" : `v3-tone-${e.tone}`}`}>[{e.tag}]</span>
          <span>{e.body}</span>
        </li>
      ))}
    </ul>
  );
}

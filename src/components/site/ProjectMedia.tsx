"use client";

import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { ArchDiagram } from "./ArchDiagram";

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface CodeRef {
  file: string;
  title: string;
}

export interface CodeSample extends CodeRef {
  /** Pre-highlighted HTML from Shiki (rendered at build time). */
  html: string;
}

export interface ArchNode {
  id: string;
  label: string;
  detail: string;
  path: string;
}

export interface Arch {
  nodes: ArchNode[];
  edges: [string, string, string?][];
}

type Tab = "preview" | "code" | "arch";

/**
 * The project "window": Preview (real screenshots), Code (real excerpts) and Architecture
 * (nodes from the real repo). Tabs follow the WAI-ARIA tabs pattern. The frame tilts toward
 * the pointer on desktop.
 */
export function ProjectMedia({
  name,
  shots,
  code,
  codeUrl,
  arch,
  fallback,
}: {
  name: string;
  shots: Shot[];
  code: CodeRef[];
  /** Static JSON with the highlighted HTML for `code`, fetched when the Code tab first opens. */
  codeUrl: string;
  arch?: Arch;
  fallback: { big: string; small: string };
}) {
  const available: Tab[] = [
    ...(shots.length || !arch ? (["preview"] as Tab[]) : []),
    ...(code.length ? (["code"] as Tab[]) : []),
    ...(arch ? (["arch"] as Tab[]) : []),
  ];
  const [tab, setTab] = useState<Tab>(available[0] ?? "preview");
  const [shot, setShot] = useState(0);
  const [sample, setSample] = useState(0);
  const [node, setNode] = useState<string | null>(arch?.nodes[0]?.id ?? null);
  const [html, setHtml] = useState<string[] | null>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab !== "code" || html) return;
    let live = true;
    fetch(codeUrl)
      .then((r) => r.json() as Promise<CodeSample[]>)
      .then((list) => live && setHtml(list.map((c) => c.html)))
      .catch(() => live && setHtml([]));
    return () => {
      live = false;
    };
  }, [tab, html, codeUrl]);
  const id = useId();

  const labels: Record<Tab, string> = { preview: "Preview", code: "Code", arch: "Architecture" };

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !frame.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = frame.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    frame.current.style.setProperty("--ry", `${x * 6}deg`);
    frame.current.style.setProperty("--rx", `${-y * 5}deg`);
  }
  function onLeave() {
    frame.current?.style.setProperty("--ry", "0deg");
    frame.current?.style.setProperty("--rx", "0deg");
  }

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const i = available.indexOf(tab);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % available.length;
    if (e.key === "ArrowLeft") next = (i - 1 + available.length) % available.length;
    if (next < 0) return;
    e.preventDefault();
    const t = available[next]!;
    setTab(t);
    document.getElementById(`${id}-tab-${t}`)?.focus();
  }

  const current = arch?.nodes.find((n) => n.id === node);
  const activeShot = shots[shot] ?? shots[0];
  const activeCode = code[sample] ?? code[0];

  return (
    <div className="project-media">
      <div className="media-glow" aria-hidden="true" />
      <div className="media-frame" ref={frame} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="media-bar">
          <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          {available.length > 1 ? (
            <div className="tabs" role="tablist" aria-label={`${name} views`}>
              {available.map((t) => (
                <button
                  key={t}
                  id={`${id}-tab-${t}`}
                  type="button"
                  role="tab"
                  className="tab"
                  aria-selected={tab === t}
                  aria-controls={`${id}-panel-${t}`}
                  tabIndex={tab === t ? 0 : -1}
                  onClick={() => setTab(t)}
                  onKeyDown={onKey}
                >
                  {labels[t]}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {available.includes("preview") ? (
          <div
            className="panel"
            role={available.length > 1 ? "tabpanel" : undefined}
            id={`${id}-panel-preview`}
            aria-labelledby={available.length > 1 ? `${id}-tab-preview` : undefined}
            hidden={tab !== "preview"}
          >
            {activeShot ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="panel-shot"
                  src={activeShot.src}
                  alt={activeShot.alt}
                  width={activeShot.width}
                  height={activeShot.height}
                  loading="lazy"
                  decoding="async"
                />
                {shots.length > 1 ? (
                  <div className="shot-strip">
                    {shots.map((s, i) => (
                      <button
                        key={s.src}
                        type="button"
                        className="shot-thumb"
                        aria-pressed={i === shot}
                        aria-label={`Screenshot ${i + 1}: ${s.alt}`}
                        onClick={() => setShot(i)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.src} alt="" loading="lazy" decoding="async" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="panel-empty">
                <div>
                  <b>{fallback.big}</b>
                  <span>{fallback.small}</span>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {activeCode ? (
          <div
            className="panel"
            role="tabpanel"
            id={`${id}-panel-code`}
            aria-labelledby={`${id}-tab-code`}
            hidden={tab !== "code"}
          >
            <div className="panel-code" tabIndex={0} aria-label={`${name} code: ${activeCode.title}`}>
              <div className="code-file">
                <span>
                  <b>{activeCode.title}</b>
                  {"  "}
                  <code>{activeCode.file}</code>
                </span>
                {code.length > 1 ? (
                  <button
                    type="button"
                    className="tab"
                    onClick={() => setSample((s) => (s + 1) % code.length)}
                    aria-label="Show the next code sample"
                  >
                    {sample + 1}/{code.length} next
                  </button>
                ) : null}
              </div>
              {html?.[sample] ? (
                <div dangerouslySetInnerHTML={{ __html: html[sample] }} />
              ) : (
                <p className="code-loading">{html ? "Code could not load. Refresh to try again." : "Loading code..."}</p>
              )}
            </div>
          </div>
        ) : null}

        {arch ? (
          <div
            className="panel"
            role="tabpanel"
            id={`${id}-panel-arch`}
            aria-labelledby={`${id}-tab-arch`}
            hidden={tab !== "arch"}
          >
            <div className="panel-arch">
              <ArchDiagram arch={arch} node={node} onSelect={setNode} />
              <div className="arch-detail" aria-live="polite">
                {current ? (
                  <>
                    <b>{current.label}</b>
                    <code>{current.path}</code>
                    <span>{current.detail}</span>
                  </>
                ) : null}
              </div>
              {current ? (
                <div className="arch-edges">
                  {arch.edges
                    .filter(([a, b]) => a === current.id || b === current.id)
                    .map(([a, b, label]) => {
                      const from = arch.nodes.find((n) => n.id === a)?.label ?? a;
                      const to = arch.nodes.find((n) => n.id === b)?.label ?? b;
                      return (
                        <span key={`${a}-${b}`}>
                          {from} → {to}
                          {label ? ` (${label})` : ""}
                        </span>
                      );
                    })}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

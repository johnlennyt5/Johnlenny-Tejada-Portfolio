"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import {
  BG_KEY,
  MODE_KEY,
  PALETTE_KEY,
  backgrounds,
  palettes,
  trendPalettes,
  type BackgroundId,
  type Mode,
  type Palette,
  type PaletteId,
} from "./prefs";
import { Close, Download, Menu } from "./icons";

const links = [
  { href: "/#build", en: "Build", es: "Construir" },
  { href: "/#solve", en: "Solve", es: "Resolver" },
  { href: "/#scale", en: "Scale", es: "Escalar" },
  { href: "/#about", en: "About", es: "Sobre mí" },
  { href: "/#contact", en: "Contact", es: "Contacto" },
];

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the choice still applies for this page view */
  }
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [palette, setPalette] = useState<PaletteId>("ember");
  const [mode, setMode] = useState<Mode>("dark");
  const [bg, setBg] = useState<BackgroundId>("wavegrid");
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = document.documentElement;
    setPalette((d.dataset.palette as PaletteId) || "ember");
    setMode(d.dataset.mode === "light" ? "light" : "dark");
    setBg((d.dataset.bg as BackgroundId) || "wavegrid");
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!paletteOpen) return;
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setPaletteOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPaletteOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [paletteOpen]);

  function choosePalette(id: PaletteId) {
    document.documentElement.dataset.palette = id;
    setPalette(id);
    save(PALETTE_KEY, id);
  }

  function chooseMode(next: Mode) {
    document.documentElement.dataset.mode = next;
    setMode(next);
    save(MODE_KEY, next);
  }

  function chooseBg(id: BackgroundId) {
    document.documentElement.dataset.bg = id;
    setBg(id);
    save(BG_KEY, id);
  }

  const isTrend = trendPalettes.some((p) => p.id === palette);

  function option(p: Palette) {
    return (
      <button
        key={p.id}
        type="button"
        role="radio"
        aria-checked={palette === p.id}
        className="palette-opt"
        onClick={() => choosePalette(p.id)}
      >
        <span className="swatch" aria-hidden="true">
          {p.swatch.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
        <span className="palette-name">
          <b>{p.name}</b>
          {p.mood ? <small>{p.mood}</small> : null}
        </span>
      </button>
    );
  }

  return (
    <header className="nav" data-scrolled={scrolled || menu}>
      <div className="wrap nav-inner">
        <Link href="/" className="logo" title={`${profile.name}, home`}>
          <span className="logo-mark" aria-hidden="true">
            JT
          </span>
          <span>
            Johnlenny<span className="logo-dot">.</span>
          </span>
        </Link>

        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.en}</a>
            </li>
          ))}
        </ul>

        <div className="nav-tools">
          <div className="palette" ref={popRef}>
            <button
              type="button"
              className="tool-btn"
              aria-expanded={paletteOpen}
              aria-haspopup="true"
              onClick={() => setPaletteOpen((o) => !o)}
              title="Color palette"
            >
              <span className="palette-dot" aria-hidden="true" />
              <span className="sr-only">Choose a color palette</span>
            </button>
            {paletteOpen ? (
              <div className="palette-pop">
                <div role="radiogroup" aria-labelledby="pal-bg">
                  <p id="pal-bg">Background</p>
                  <div className="bg-options">
                    {backgrounds.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        role="radio"
                        aria-checked={bg === b.id}
                        className="bg-opt"
                        data-preview={b.id}
                        onClick={() => chooseBg(b.id)}
                      >
                        <span className="bg-thumb" aria-hidden="true" />
                        <b>{b.name}</b>
                        <small>{b.mood}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <div role="radiogroup" aria-labelledby="pal-sig">
                  <p id="pal-sig">Signature</p>
                  {palettes.map(option)}
                </div>
                <div role="radiogroup" aria-labelledby="pal-trend">
                  <div className="palette-head">
                    <p id="pal-trend">Trend palettes</p>
                    <div className="mode-switch" role="group" aria-label="Trend palette mode">
                      {(["dark", "light"] as Mode[]).map((m) => (
                        <button key={m} type="button" aria-pressed={mode === m} onClick={() => chooseMode(m)}>
                          {m === "dark" ? "Dark" : "Light"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {trendPalettes.map(option)}
                </div>
                <small className="palette-note">
                  {isTrend ? "Every trend palette works in dark and light." : "Dark and Light apply to the trend palettes."}
                </small>
              </div>
            ) : null}
          </div>

          <a href={profile.resume.href} download={profile.resume.fileName} className="btn btn-primary nav-resume">
            <Download />
            Resume
          </a>

          <button
            type="button"
            className="tool-btn menu-btn"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu((m) => !m)}
          >
            {menu ? <Close /> : <Menu />}
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </div>

      {menu ? (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Main">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setMenu(false)}>
                  {l.en}
                </a>
              </li>
            ))}
            <li>
              <a href={profile.resume.href} download={profile.resume.fileName}>
                Download resume
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

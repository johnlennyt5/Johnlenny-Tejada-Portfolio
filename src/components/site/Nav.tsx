"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { LANG_KEY, PALETTE_KEY, palettes, type Lang, type PaletteId } from "./prefs";
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
  const [lang, setLang] = useState<Lang>("en");
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = document.documentElement;
    setPalette((d.dataset.palette as PaletteId) || "ember");
    setLang(d.dataset.lang === "es" ? "es" : "en");
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

  function toggleLang() {
    const next: Lang = lang === "en" ? "es" : "en";
    const d = document.documentElement;
    d.dataset.lang = next;
    d.lang = next;
    setLang(next);
    save(LANG_KEY, next);
  }

  return (
    <header className="nav" data-scrolled={scrolled || menu}>
      <div className="wrap nav-inner">
        <Link href="/" className="logo" aria-label={`${profile.name}, home`}>
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
              <a href={l.href}>
                <span className="l-en">{l.en}</span>
                <span className="l-es" lang="es">
                  {l.es}
                </span>
              </a>
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
              <div className="palette-pop" role="radiogroup" aria-label="Color palette">
                <p>
                  <span className="l-en">Color palette</span>
                  <span className="l-es" lang="es">
                    Paleta de colores
                  </span>
                </p>
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={palette === p.id}
                    className="palette-opt"
                    onClick={() => choosePalette(p.id)}
                  >
                    <span className="swatch" aria-hidden="true">
                      <i style={{ background: p.swatch[0] }} />
                      <i style={{ background: p.swatch[1] }} />
                    </span>
                    {p.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button type="button" className="tool-btn" onClick={toggleLang} aria-label={lang === "en" ? "Ver en español" : "View in English"}>
            {lang === "en" ? "ES" : "EN"}
          </button>

          <a href={profile.resume.href} download={profile.resume.fileName} className="btn btn-primary nav-resume">
            <Download />
            <span className="l-en">Resume</span>
            <span className="l-es" lang="es">
              Currículum
            </span>
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
                  <span className="l-en">{l.en}</span>
                  <span className="l-es" lang="es">
                    {l.es}
                  </span>
                </a>
              </li>
            ))}
            <li>
              <a href={profile.resume.href} download={profile.resume.fileName}>
                <span className="l-en">Download resume</span>
                <span className="l-es" lang="es">
                  Descargar currículum
                </span>
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

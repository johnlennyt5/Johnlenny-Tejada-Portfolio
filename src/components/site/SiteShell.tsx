import type { ReactNode } from "react";
import { profile } from "@/content/profile";
import { routes } from "@/lib/site";
import { BackgroundLayer } from "./backgrounds/BackgroundLayer";
import { fontClassName } from "./fonts";
import { Nav } from "./Nav";
import { Reveal } from "./Reveal";
import { T } from "./T";
import "./site.css";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className={`site ${fontClassName}`}>
      <BackgroundLayer />
      <a href="#main" className="skip">
        <T en="Skip to content" es="Saltar al contenido" />
      </a>
      <div className="progress" aria-hidden="true" />
      <Nav />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <span>
            © 2026 {profile.name} · Providence, RI ·{" "}
            <T en="Built with Next.js, deployed free on Vercel." es="Hecho con Next.js, publicado gratis en Vercel." />
          </span>
          <span style={{ display: "flex", gap: 16 }}>
            <a href={profile.links.linkedin.href} target="_blank" rel="noopener noreferrer">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={profile.links.github.href} target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={routes.compare}>
              <T en="Design lab" es="Laboratorio de diseño" />
            </a>
          </span>
        </div>
      </footer>
      <Reveal />
    </div>
  );
}

import { getProject } from "@/content";
import { profile } from "@/content/profile";
import {
  award,
  community,
  featuredSlugs,
  heroIntro,
  heroStats,
  pillars,
  projectCopy,
  roles,
} from "@/content/showcase";
import { CopyEmail } from "@/components/shared/CopyEmail";
import { routes } from "@/lib/site";
import { CompareSlider } from "./CompareSlider";
import { ArrowRight, Check, Download, GitHub, LinkedIn, Trophy } from "./icons";
import { getArch, getCode, getShots } from "./media";
import { ProjectMedia } from "./ProjectMedia";
import { RoleRotator } from "./RoleRotator";
import { T, TBlock } from "./T";

const tech = [
  "UiPath",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Java · Spring Boot",
  "AWS",
  "Supabase",
  "PostgreSQL",
  "Stripe",
  "React Native",
  "AI agents",
  "Maestro",
  "Claude Code",
];

const botSteps = [
  { ic: "✉", en: "Document arrives", es: "Llega el documento" },
  { ic: "✦", en: "AI agent reads it", es: "Un agente de IA lo lee" },
  { ic: "⚖", en: "Rules check it", es: "Las reglas lo revisan" },
  { ic: "✓", en: "Human approves edge case", es: "Una persona aprueba la excepción" },
];

export async function Home() {
  const projects = await Promise.all(
    featuredSlugs.map(async (slug) => {
      const p = getProject(slug)!;
      return { p, copy: projectCopy[slug]!, shots: getShots(slug, p.name), code: await getCode(slug), arch: getArch(slug) };
    }),
  );

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-bg" aria-hidden="true" />
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <span className="hello">
                <span className="pulse" aria-hidden="true" />
                <T en="Open to automation, AI and full-stack roles" es="Disponible para roles de automatización, IA y full-stack" />
              </span>
              <h1 id="hero-title">
                <span className="im">
                  <T en="Hi, I'm" es="Hola, soy" />
                </span>
                Johnlenny <span className="last">Tejada</span>
              </h1>
              <RoleRotator roles={roles} />
              <TBlock en={<p className="hero-intro">{heroIntro.en}</p>} es={<p className="hero-intro">{heroIntro.es}</p>} />
              <div className="hero-ctas">
                <a href="#build" className="btn btn-primary">
                  <T en="See my work" es="Ver mi trabajo" />
                  <ArrowRight />
                </a>
                <a href={profile.resume.href} download={profile.resume.fileName} className="btn btn-ghost">
                  <Download />
                  <T en="Resume" es="Currículum" />
                </a>
              </div>
              <div className="socials">
                <a className="social" href={profile.links.linkedin.href} aria-label="LinkedIn">
                  <LinkedIn />
                </a>
                <a className="social" href={profile.links.github.href} aria-label="GitHub">
                  <GitHub />
                </a>
                <span>Providence, RI · English / Español</span>
              </div>
            </div>

            <div className="stage">
              <div className="stage-disc" aria-hidden="true" />
              <svg className="stage-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="49" />
                <circle className="draw" cx="50" cy="50" r="45" pathLength={1000} />
              </svg>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="stage-photo"
                src="/img/hero-cutout.webp"
                srcSet="/img/hero-cutout-sm.webp 400w, /img/hero-cutout.webp 800w"
                sizes="(min-width: 980px) 560px, 92vw"
                width={800}
                height={690}
                alt="Johnlenny Tejada smiling, in a dark blazer and white shirt"
                fetchPriority="high"
              />
              <span className="orbit orbit-1" aria-hidden="true">
                <b>UiPath</b> RPA
              </span>
              <span className="orbit orbit-2" aria-hidden="true">
                <b>AI</b> agents
              </span>
              <span className="orbit orbit-3" aria-hidden="true">
                <b>TS</b> full-stack
              </span>
              <div className="botrun" aria-hidden="true">
                <div className="botrun-head">
                  <span>bot_run.xaml</span>
                  <span className="botrun-live">live</span>
                </div>
                <ol>
                  {botSteps.map((s, i) => (
                    <li key={s.en} style={{ ["--i" as string]: i }}>
                      <span className="ic">{s.ic}</span>
                      <span className="l-en">{s.en}</span>
                      <span className="l-es" lang="es">
                        {s.es}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="botrun-foot">
                  <s>3 hrs manual</s>
                  <strong>→ zero-touch</strong>
                </div>
              </div>
            </div>
          </div>

          <dl className="stats">
            <div className="stat stat-award">
              <span className="trophy" aria-hidden="true">
                <Trophy />
              </span>
              <div>
                <dt className="sr-only">
                  <T en="Award" es="Premio" />
                </dt>
                <dd style={{ margin: 0 }}>
                  <b>
                    <T en={award.en} es={award.es} />
                  </b>
                  <span>AWS Enterprise Agents Challenge, SF 2025</span>
                </dd>
              </div>
            </div>
            {heroStats.map((s) => (
              <div className="stat" key={s.value}>
                <dt className="sr-only">
                  <T en={s.label.en} es={s.label.es} />
                </dt>
                <dd style={{ margin: 0 }}>
                  <b>{s.value}</b>
                  <span aria-hidden="true">
                    <T en={s.label.en} es={s.label.es} />
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------- Tech marquee ---------------- */}
      <div className="marquee" aria-label="Technologies I use">
        <div className="marquee-track">
          {[0, 1].map((k) =>
            tech.map((t) => (
              <span className="marquee-item" key={`${k}-${t}`} aria-hidden={k === 1 ? true : undefined}>
                <i aria-hidden="true" />
                {t}
              </span>
            )),
          )}
        </div>
      </div>

      {/* ---------------- Build / Solve / Scale ---------------- */}
      <section className="section" aria-labelledby="what-title">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">
              <T en="What I do" es="Lo que hago" />
            </span>
            <h2 className="h2" id="what-title">
              <T
                en={
                  <>
                    Build. Solve. <em>Scale.</em>
                  </>
                }
                es={
                  <>
                    Construir. Resolver. <em>Escalar.</em>
                  </>
                }
              />
            </h2>
            <TBlock
              en={<p className="lede">Three words I work by, and the way I approach every project.</p>}
              es={<p className="lede">Tres palabras que guían mi trabajo, y la forma en que enfrento cada proyecto.</p>}
            />
          </div>
          <div className="pillars">
            {pillars.map((p, i) => (
              <a key={p.id} href={`#${p.id}`} className="pillar reveal" style={{ ["--d" as string]: i }}>
                <span className="pillar-num">0{i + 1}</span>
                <span className="pillar-word">
                  <T en={p.word.en} es={p.word.es} />
                </span>
                <h3>
                  <T en={p.title.en} es={p.title.es} />
                </h3>
                <TBlock en={<p>{p.body.en}</p>} es={<p>{p.body.es}</p>} />
                <span className="pillar-go">
                  <T en="Jump there" es="Ir allí" />
                  <ArrowRight />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- BUILD: projects ---------------- */}
      <section className="section" id="build" data-spy aria-labelledby="build-title">
        <span className="bigword" aria-hidden="true">
          Build
        </span>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">01 · Build</span>
            <h2 className="h2" id="build-title">
              <T
                en={
                  <>
                    Things I <em>built</em>, start to finish
                  </>
                }
                es={
                  <>
                    Cosas que <em>construí</em>, de principio a fin
                  </>
                }
              />
            </h2>
            <TBlock
              en={
                <p className="lede">
                  Real screenshots, real code and the real architecture. Flip each window between Preview, Code and Architecture.
                </p>
              }
              es={
                <p className="lede">
                  Capturas reales, código real y la arquitectura real. Cambia cada ventana entre Vista, Código y Arquitectura.
                </p>
              }
            />
          </div>

          <div className="projects">
            {projects.map(({ p, copy, shots, code, arch }, i) => (
              <article className="project" key={p.slug} aria-labelledby={`p-${p.slug}`}>
                <div className="reveal">
                  <ProjectMedia
                    name={p.name}
                    shots={shots}
                    code={code}
                    arch={arch}
                    fallback={{ big: p.name, small: copy.title.en }}
                  />
                </div>
                <div className="reveal" style={{ ["--d" as string]: 1 }}>
                  <span className="project-num">
                    0{i + 1} · <T en={copy.kicker.en} es={copy.kicker.es} />
                  </span>
                  <h3 id={`p-${p.slug}`}>
                    {p.name}
                    <small>
                      <T en={copy.title.en} es={copy.title.es} />
                    </small>
                  </h3>
                  <TBlock en={<p className="project-pitch">{copy.pitch.en}</p>} es={<p className="project-pitch">{copy.pitch.es}</p>} />
                  <div className="project-result">
                    <Check />
                    <T en={copy.result.en} es={copy.result.es} />
                  </div>
                  <div className="chips">
                    {p.stack.slice(0, 7).map((s) => (
                      <span className="chip" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="project-links">
                    <a className="btn btn-primary" href={routes.project(p.slug)}>
                      <T en="Read the case study" es="Ver el caso completo" />
                      <ArrowRight />
                    </a>
                    {p.links
                      .filter((l) => l.kind === "store")
                      .slice(0, 2)
                      .map((l) => (
                        <a className="btn btn-ghost" href={l.href} key={l.href}>
                          {l.href.includes("apple") ? "App Store" : "Google Play"}
                        </a>
                      ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SOLVE: automation ---------------- */}
      <section className="section" id="solve" data-spy aria-labelledby="solve-title" style={{ background: "var(--s-bg-2)" }}>
        <span className="bigword" aria-hidden="true">
          Solve
        </span>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">02 · Solve</span>
            <h2 className="h2" id="solve-title">
              <T
                en={
                  <>
                    Hours of busywork, <em>gone</em>
                  </>
                }
                es={
                  <>
                    Horas de trabajo repetitivo, <em>eliminadas</em>
                  </>
                }
              />
            </h2>
            <TBlock
              en={
                <p className="lede">
                  At HumanixOS I build the UiPath robots and AI features behind a live platform for 30+ nonprofits. Drag the handle to see
                  the before and after.
                </p>
              }
              es={
                <p className="lede">
                  En HumanixOS construyo los robots de UiPath y las funciones de IA de una plataforma en vivo para más de 30 organizaciones
                  sin fines de lucro. Arrastra el control para ver el antes y el después.
                </p>
              }
            />
          </div>
          <div className="reveal">
            <CompareSlider />
          </div>
          <div className="solve-facts">
            <div className="fact reveal">
              <b>85%</b>
              <T en="straight-through processing on a form-triage bot with fuzzy-match dedup" es="procesamiento directo en un bot de clasificación de formularios con deduplicación" />
            </div>
            <div className="fact reveal" style={{ ["--d" as string]: 1 }}>
              <b>5,000+</b>
              <T en="records per import, mapped with AI-assisted column matching" es="registros por importación, mapeados con ayuda de IA" />
            </div>
            <div className="fact reveal" style={{ ["--d" as string]: 2 }}>
              <b>17</b>
              <T en="REST controllers in the original Java and Spring Boot backend I helped build" es="controladores REST en el backend original de Java y Spring Boot que ayudé a construir" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SCALE: experience + community ---------------- */}
      <section className="section" id="scale" data-spy aria-labelledby="scale-title">
        <span className="bigword" aria-hidden="true">
          Scale
        </span>
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">03 · Scale</span>
            <h2 className="h2" id="scale-title">
              <T
                en={
                  <>
                    Platforms, teams and <em>rooms full of builders</em>
                  </>
                }
                es={
                  <>
                    Plataformas, equipos y <em>salas llenas de creadores</em>
                  </>
                }
              />
            </h2>
          </div>
          <div className="scale-grid">
            <ol className="timeline reveal">
              <li className="tl-item">
                <span className="tl-when">
                  <T en="Jan 2023 to present" es="Ene 2023 al presente" />
                </span>
                <h3>
                  Software Engineer <span>· HumanixOS</span>
                </h3>
                <TBlock
                  en={<p>AI and automation for a live multi-tenant nonprofit platform: 30+ tenants, 200+ users, now TypeScript.</p>}
                  es={<p>IA y automatización para una plataforma multi-inquilino en vivo: más de 30 organizaciones, más de 200 usuarios, ahora en TypeScript.</p>}
                />
              </li>
              <li className="tl-item">
                <span className="tl-when">
                  <T en="Jan 2026 to present" es="Ene 2026 al presente" />
                </span>
                <h3>
                  <T en="Founder" es="Fundador" /> <span>· truckWhat</span>
                </h3>
                <TBlock en={<p>Building a logistics marketplace solo, web and mobile.</p>} es={<p>Construyendo solo un mercado de logística, web y móvil.</p>} />
              </li>
              <li className="tl-item">
                <span className="tl-when">
                  <T en="May 2025 to Jan 2026" es="May 2025 a ene 2026" />
                </span>
                <h3>
                  <T en="Co-founder & Engineer" es="Cofundador e ingeniero" /> <span>· SmartFit Metrics</span>
                </h3>
                <TBlock
                  en={<p>One of two engineers; shipped to the App Store and Google Play. Still hold equity.</p>}
                  es={<p>Uno de dos ingenieros; publicada en App Store y Google Play. Sigo siendo socio.</p>}
                />
              </li>
              <li className="tl-item">
                <span className="tl-when">2023</span>
                <h3>
                  <T en="Computer Science certificate" es="Certificado en Ciencias de la Computación" /> <span>· DevAccelerator</span>
                </h3>
                <TBlock en={<p>9-month program in Providence.</p>} es={<p>Programa de 9 meses en Providence.</p>} />
              </li>
              <li className="tl-item">
                <span className="tl-when">
                  <T en="7+ years" es="Más de 7 años" />
                </span>
                <h3>
                  Manager <span>· Supreme Cuts, Providence</span>
                </h3>
                <TBlock
                  en={<p>Hired and managed barbers, kept clients coming back, and kept the books in Excel.</p>}
                  es={<p>Contraté y dirigí barberos, mantuve a los clientes y llevé la contabilidad en Excel.</p>}
                />
              </li>
              <li className="tl-item">
                <span className="tl-when">URI</span>
                <h3>
                  <T en="BBA, Accounting" es="Licenciatura en Contabilidad" /> <span>· University of Rhode Island</span>
                </h3>
              </li>
            </ol>

            <div className="gallery">
              {community.map((c, i) => (
                <figure className="photo reveal" key={c.src} style={{ ["--d" as string]: i }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.src} width={c.width} height={c.height} alt={c.alt.en} loading="lazy" decoding="async" />
                  <figcaption>
                    <T en={c.caption.en} es={c.caption.es} />
                  </figcaption>
                </figure>
              ))}
              <div className="cards-2">
                <div className="mini reveal">
                  <b>TEDxProvidence 2025</b>
                  <T en="Assistant Coordinator on the core team." es="Coordinador asistente en el equipo principal." />
                </div>
                <div className="mini reveal" style={{ ["--d" as string]: 1 }}>
                  <b>Bryant IDEA 2026</b>
                  <T en="Built Eve, the AI avatar that opened the keynote." es="Construí a Eve, el avatar de IA que abrió el discurso principal." />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- About ---------------- */}
      <section className="section" id="about" data-spy aria-labelledby="about-title" style={{ background: "var(--s-bg-2)" }}>
        <div className="wrap about">
          <div className="about-photo reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/johnlenny-office.webp" width={800} height={800} alt="Johnlenny Tejada in an office, with a Build Solve Scale sign behind him" loading="lazy" decoding="async" />
            <span className="about-tag">Providence, RI</span>
          </div>
          <div className="about-body reveal" style={{ ["--d" as string]: 1 }}>
            <span className="eyebrow">
              <T en="About me" es="Sobre mí" />
            </span>
            <h2 className="h2" id="about-title">
              <T
                en={
                  <>
                    From the barbershop books to <em>AI agents</em>
                  </>
                }
                es={
                  <>
                    De la contabilidad de la barbería a los <em>agentes de IA</em>
                  </>
                }
              />
            </h2>
            <TBlock
              en={
                <>
                  <p>
                    I came to software from the business side. I hold a BBA in Accounting from URI, and for more than seven years I managed a
                    barbershop in Providence: hiring, keeping clients and keeping the books. That is why I care about what an automation
                    saves, who it serves and what happens when it fails.
                  </p>
                  <p>
                    Today I build AI and automation at HumanixOS, and on my own time I build startups: truckWhat, PrismShift and SmartFit
                    Metrics. I co-host hackathons, helped run TEDxProvidence 2025, and teach people to build with AI, in English and Spanish.
                  </p>
                </>
              }
              es={
                <>
                  <p>
                    Llegué al software desde el lado de los negocios. Tengo una licenciatura en Contabilidad de URI y por más de siete años
                    dirigí una barbería en Providence: contratando, cuidando clientes y llevando las cuentas. Por eso me importa lo que una
                    automatización ahorra, a quién sirve y qué pasa cuando falla.
                  </p>
                  <p>
                    Hoy construyo IA y automatización en HumanixOS, y en mi tiempo libre construyo startups: truckWhat, PrismShift y SmartFit
                    Metrics. Coorganizo hackathons, ayudé a dirigir TEDxProvidence 2025 y enseño a otros a construir con IA, en inglés y
                    español.
                  </p>
                </>
              }
            />
            <div className="about-facts">
              <div className="mini">
                <b>BBA</b>
                <T en="Accounting, URI" es="Contabilidad, URI" />
              </div>
              <div className="mini">
                <b>7+ yrs</b>
                <T en="managing a business" es="dirigiendo un negocio" />
              </div>
              <div className="mini">
                <b>3</b>
                <T en="startups built" es="startups construidas" />
              </div>
              <div className="mini">
                <b>EN / ES</b>
                <T en="bilingual" es="bilingüe" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Contact ---------------- */}
      <section className="section" id="contact" data-spy aria-labelledby="contact-title">
        <div className="wrap">
          <div className="contact reveal">
            <span className="eyebrow">
              <T en="Contact" es="Contacto" />
            </span>
            <h2 id="contact-title">
              <T en="Let's build something that runs itself." es="Construyamos algo que funcione solo." />
            </h2>
            <TBlock
              en={<p>{profile.availability} The fastest way to reach me is email or LinkedIn.</p>}
              es={
                <p>
                  Disponible para roles de automatización, IA y full-stack en Rhode Island, Massachusetts y Connecticut, o remoto. La forma más
                  rápida de contactarme es por correo o LinkedIn.
                </p>
              }
            />
            <div className="hero-ctas">
              <CopyEmail className="btn btn-primary" label={<T en="Copy my email" es="Copiar mi correo" />} copiedLabel={<T en="Copied!" es="¡Copiado!" />} showAddress />
              <a href={profile.links.linkedin.href} className="btn btn-ghost">
                <LinkedIn />
                LinkedIn
              </a>
              <a href={profile.resume.href} download={profile.resume.fileName} className="btn btn-ghost">
                <Download />
                <T en="Resume" es="Currículum" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

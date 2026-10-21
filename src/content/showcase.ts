import type { ProjectSlug } from "./types";

/**
 * Copy for the main site (English and Spanish). Facts and numbers come from the audited
 * content files and evidence.ts; this file only words them for the new design.
 */

export interface Bi {
  en: string;
  es: string;
}

export const featuredSlugs: ProjectSlug[] = ["truckwhat", "prismshift", "ilop", "smartfit-metrics"];

export const roles: Bi[] = [
  { en: "Automation & AI Engineer", es: "Ingeniero de Automatización e IA" },
  { en: "Full-Stack TypeScript Developer", es: "Desarrollador Full-Stack TypeScript" },
  { en: "RPA Developer (UiPath)", es: "Desarrollador RPA (UiPath)" },
  { en: "Startup Founder", es: "Fundador de startups" },
];

export const heroIntro: Bi = {
  en: "I turn slow, manual work into automations that run themselves, and I build the full-stack products around them. Software Engineer at HumanixOS. Founder of truckWhat.",
  es: "Convierto trabajo manual y lento en automatizaciones que funcionan solas, y construyo los productos full-stack que las rodean. Ingeniero de Software en HumanixOS. Fundador de truckWhat.",
};

export interface HeroStat {
  value: string;
  label: Bi;
}

export const heroStats: HeroStat[] = [
  { value: "3-hour", label: { en: "manual import, now fully automated", es: "importación manual hecha automática" } },
  { value: "730+", label: { en: "commits to truckWhat, built solo", es: "commits en truckWhat, solo" } },
  { value: "1,038", label: { en: "automated tests in PrismShift", es: "pruebas detrás de PrismShift" } },
  { value: "2", label: { en: "app stores: SmartFit is live on iOS and Android", es: "tiendas de apps, SmartFit en vivo" } },
];

export const award: Bi = {
  en: "Winner, Best Use of AWS AI (team)",
  es: "Ganador (equipo), Mejor uso de AWS AI",
};

export const pillars: { id: "build" | "solve" | "scale"; word: Bi; title: Bi; body: Bi }[] = [
  {
    id: "build",
    word: { en: "Build", es: "Construir" },
    title: { en: "Products, end to end", es: "Productos, de principio a fin" },
    body: {
      en: "Web and mobile apps in TypeScript, from database security to payments to the CI gate that keeps them honest.",
      es: "Apps web y móviles en TypeScript, desde la seguridad de la base de datos hasta los pagos y el CI que las mantiene confiables.",
    },
  },
  {
    id: "solve",
    word: { en: "Solve", es: "Resolver" },
    title: { en: "Automations that remove the busywork", es: "Automatizaciones que eliminan el trabajo repetitivo" },
    body: {
      en: "UiPath robots and AI agents that take hours of manual steps down to exceptions only, with people approving what matters.",
      es: "Robots de UiPath y agentes de IA que reducen horas de pasos manuales a solo las excepciones, con personas aprobando lo importante.",
    },
  },
  {
    id: "scale",
    word: { en: "Scale", es: "Escalar" },
    title: { en: "Platforms and people", es: "Plataformas y personas" },
    body: {
      en: "A live multi-tenant platform for 30+ nonprofits, plus hackathons, TEDxProvidence and teaching others to build with AI.",
      es: "Una plataforma multi-inquilino en vivo para más de 30 organizaciones sin fines de lucro, además de hackathons, TEDxProvidence y enseñar a otros a construir con IA.",
    },
  },
];

export interface ProjectCopy {
  kicker: Bi;
  title: Bi;
  pitch: Bi;
  result: Bi;
}

export const projectCopy: Record<string, ProjectCopy> = {
  truckwhat: {
    kicker: { en: "Founder · Web + Mobile", es: "Fundador · Web + Móvil" },
    title: { en: "Logistics marketplace", es: "Mercado de logística" },
    pitch: {
      en: "My own startup: shippers post loads, drivers haul them. Live GPS tracking that survives dead zones, face-match identity checks, Stripe Connect payouts and a 3D load viewer, built solo across a web app and a mobile app.",
      es: "Mi propia startup: los remitentes publican cargas y los conductores las transportan. Rastreo GPS en vivo que sobrevive sin señal, verificación de identidad facial, pagos con Stripe Connect y un visor 3D de carga, construido solo en una app web y una app móvil.",
    },
    result: {
      en: "800+ web tests and 350+ mobile tests on every push. 200+ row-level security policies. 28 security findings closed.",
      es: "800+ pruebas web y 350+ pruebas móviles en cada push. 200+ políticas de seguridad a nivel de fila. 28 hallazgos de seguridad cerrados.",
    },
  },
  prismshift: {
    kicker: { en: "Solo · Banking RPA", es: "Solo · RPA bancario" },
    title: { en: "Blue Prism to UiPath migration", es: "Migración de Blue Prism a UiPath" },
    pitch: {
      en: "Banks leaving Blue Prism face a full rewrite. PrismShift parses their exports in the browser, runs 14 analysis rules and generates UiPath REFramework projects. The analysis runs in the browser.",
      es: "Los bancos que dejan Blue Prism enfrentan reescribir todo. PrismShift analiza sus exportaciones en el navegador, aplica 14 reglas de análisis y genera proyectos UiPath REFramework, sin que las exportaciones salgan de la máquina del analista.",
    },
    result: {
      en: "274 of 345 stages converted automatically (79%) in a sample run on my live UiPath tenant. 1,038 tests and 75 pgTAP isolation checks in CI.",
      es: "274 de 345 etapas convertidas automáticamente (79%) en una prueba en mi tenant de UiPath. 1,038 pruebas y 75 verificaciones de aislamiento pgTAP en CI.",
    },
  },
  ilop: {
    kicker: { en: "Solo · UiPath Maestro · In progress", es: "Solo · UiPath Maestro · En progreso" },
    title: { en: "Agentic loan intake", es: "Recepción de préstamos con agentes" },
    pitch: {
      en: "Loan and mortgage documents arrive by email. A router agent sorts them at 0.75 confidence, extractor agents pull 24 loan fields and about 55 mortgage fields, then compliance and risk scoring feed 7 work queues for people to approve.",
      es: "Los documentos de préstamos e hipotecas llegan por correo. Un agente enrutador los clasifica con 0.75 de confianza, agentes extractores sacan 24 campos de préstamo y unos 55 de hipoteca, y luego cumplimiento y riesgo alimentan 7 colas de trabajo para aprobación humana.",
    },
    result: {
      en: "Deterministic orchestration around non-deterministic AI: agents read, rules decide, people approve.",
      es: "Orquestación determinista alrededor de IA no determinista: los agentes leen, las reglas deciden, las personas aprueban.",
    },
  },
  "smartfit-metrics": {
    kicker: { en: "Co-founder · Equity", es: "Cofundador · Socio" },
    title: { en: "Gym membership app", es: "App de membresías de gimnasio" },
    pitch: {
      en: "One of the two engineers who built the entire product: a React Native app and a Bun and Hono API with Stripe membership checkout.",
      es: "Uno de los dos ingenieros que construyeron todo el producto: una app en React Native y una API en Bun y Hono con pagos de membresía en Stripe.",
    },
    result: {
      en: "Live on the App Store as Ironclad Fitness RI since January 2026, and on Google Play.",
      es: "En vivo en el App Store como Ironclad Fitness RI desde enero de 2026, y en Google Play.",
    },
  },
};

export const solveCompare = [
  {
    id: "import",
    title: { en: "Nonprofit data import", es: "Importación de datos" },
    manual: {
      value: "3-hour",
      unit: { en: "manual process, every cycle", es: "proceso manual, cada ciclo" },
      steps: [
        { en: "Prepare each file by hand", es: "Preparar cada archivo a mano" },
        { en: "Match columns field by field", es: "Emparejar columnas campo por campo" },
        { en: "Upload and re-upload", es: "Subir y volver a subir" },
        { en: "Find what failed", es: "Encontrar qué falló" },
      ],
    },
    auto: {
      value: "Zero-touch",
      unit: { en: "unattended UiPath bot", es: "bot de UiPath desatendido" },
      steps: [
        { en: "Dispatcher queues every file", es: "El dispatcher pone cada archivo en cola" },
        { en: "AI-assisted column mapping, 80% less manual", es: "Mapeo de columnas con IA, 80% menos manual" },
        { en: "Chunked uploads with retries", es: "Cargas por bloques con reintentos" },
        { en: "Exception report for the rest", es: "Reporte de excepciones para el resto" },
      ],
    },
  },
  {
    id: "verify",
    title: { en: "Nonprofit verification", es: "Verificación de organizaciones" },
    manual: {
      value: "5 days",
      unit: { en: "approval turnaround", es: "tiempo de aprobación" },
      steps: [
        { en: "Check IRS Pub 78 and BMF records by hand", es: "Revisar registros IRS Pub 78 y BMF a mano" },
        { en: "Compare each organization's details", es: "Comparar los datos de cada organización" },
        { en: "Wait in line for a reviewer", es: "Esperar en fila a un revisor" },
        { en: "Approve or reject", es: "Aprobar o rechazar" },
      ],
    },
    auto: {
      value: "under 2 hours",
      unit: { en: "with a human in the loop", es: "con una persona en el ciclo" },
      steps: [
        { en: "Automation checks Pub 78 and BMF data", es: "La automatización revisa datos de Pub 78 y BMF" },
        { en: "Clear cases move on their own", es: "Los casos claros avanzan solos" },
        { en: "Edge cases go to Action Center", es: "Casos dudosos van a Action Center" },
        { en: "A person makes the call", es: "Una persona toma la decisión" },
      ],
    },
  },
] as const;

export const community = [
  {
    src: "/img/community/red-day-winners.webp",
    width: 640,
    height: 480,
    alt: {
      en: "Hackathon winners and judges standing in front of two presentation screens",
      es: "Ganadores y jueces de un hackathon frente a dos pantallas",
    },
    caption: {
      en: "Red Day hackathon at Bryant University, which I co-hosted two years running.",
      es: "Hackathon Red Day en Bryant University, que coorganicé dos años seguidos.",
    },
  },
  {
    src: "/img/community/providence-hackathon.webp",
    width: 1280,
    height: 960,
    alt: {
      en: "Organizers standing in front of a hackathon agenda slide while participants listen",
      es: "Organizadores frente a la agenda de un hackathon mientras los participantes escuchan",
    },
    caption: {
      en: "Hackathon kickoff: I was on the welcome agenda with the organizing team.",
      es: "Inicio del hackathon: estuve en la bienvenida con el equipo organizador.",
    },
  },
];

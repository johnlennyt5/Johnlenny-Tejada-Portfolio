# Working on a version (v1 to v4)

Four design versions are built in parallel. Each version agent edits only its own folders and reads everything else.

| Version | Direction | Monogram variant | Fonts (in `src/components/vN/fonts.ts`) |
|---|---|---|---|
| v1 | The Index (editorial) | `editorial` | Inter Tight, Inter, JetBrains Mono |
| v2 | Launch (cinematic dark) | `cinematic` | Space Grotesk, Inter, IBM Plex Mono |
| v3 | The Robot Room (automation, default at `/`) | `terminal` | JetBrains Mono, IBM Plex Sans, IBM Plex Sans Condensed |
| v4 | Providence, Built by Hand (human story) | `seal` | Fraunces, Source Serif 4, Caveat (captions only) |

## What you own

The vN agent may create, edit and delete anything under:

- `src/app/vN/**` (layout, home page, `about/`, `work/[slug]/`, and an optional `opengraph-image` or other route files inside `vN`)
- `src/components/vN/**` (Shell, fonts, theme.css, Home, About, CaseStudy, Header and anything new)

Contracts you must keep:

- `src/components/vN/Shell.tsx` exports `VNShell` (for example `V3Shell`), renders `<SkipLink />` first, loads the fonts and imports `theme.css`. `src/app/vN/layout.tsx` wraps children in it.
- `src/app/vN/work/[slug]/page.tsx` keeps `generateStaticParams` from `projectSlugs` and `dynamicParams = false`.
- Every page renders exactly one `<main id="main">` and one `<h1>`.
- Every page uses `pageMetadata({ path, og: "vN", ... })` from `@/lib/seo` so canonicals and cards stay correct.
- Every version shows the `VersionSwitcher`, the `MotionToggle`, `CopyEmail` and the `ResumeButton` somewhere reachable.
- v3 only: `src/components/v3/Home.tsx` must keep exporting `Home`, and `V3Shell` must keep its name, because `src/app/page.tsx` renders `<V3Shell><Home /></V3Shell>` at `/`.

## What you must not edit

Ask the orchestrator instead of editing these (they are shared by all four versions):

- `src/content/**` (all facts, copy and numbers)
- `src/components/shared/**`
- `src/lib/**`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/not-found.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/icon.svg`, `src/app/og/**`
- `scripts/**`, `.github/**`, `lighthouserc.json`, `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`
- `public/**`

If you need a new fact, number, or shared feature, write the request down; do not hard-code it in your version.

## Shared APIs

Import from `@/content`, `@/components/shared` and `@/lib/*`. On pages that should stay free of framer-motion, import shared components by file (for example `@/components/shared/CopyEmail`): a server component that imports the barrel pulls every shared client component into the page's bundle.

### Content (`@/content`)

| Export | What it is |
|---|---|
| `profile` | Name, `headline`, `subhead`, `secondaryHeadline`, `description`, `intro`, `bio[]` (first person), `location`, `availability`, `languages`, `links.linkedin` / `links.github`, `resume`, `headshot` (300 by 300 JPG). No email string: use `CopyEmail`. |
| `identities`, `primaryIdentity`, `secondaryIdentity` | Automation and AI engineer (primary), Full-stack TypeScript engineer (secondary), each with `pitch`, `proof[]`, `projects[]` |
| `projects`, `featuredProjects`, `projectSlugs`, `getProject(slug)` | Seven projects: `prismshift`, `ilop`, `truckwhat`, `smartfit-metrics`, `eve`, `yconic`, `parameter-golf`. Each has `name`, `tagline`, `role`, `team`, `dates.label`, `stack[]`, `oneLiner`, `summary`, `links[]`, `linkNote`, `metrics[]` (value, label, evidence id), `diagram?`, and `caseStudy` with `problem`, `constraints[]`, `decisions[]`, `tradeoffs[]`, `whatBroke[]`, `results[]`, `tests[]`, `caveats[]`. Some arrays are empty on purpose: render nothing rather than inventing filler. |
| `experience`, `getExperience(id)` | HumanixOS (formerly 501Database), SmartFit Metrics (formerly Iron Clad Fitness), Supreme Cuts. Read `displayNotes` on each. |
| `skills` | Skill groups with scope notes |
| `community`, `beyondCode` | TEDxProvidence 2025 (Assistant Coordinator), Providence Speaking Society board, Bryant hackathon, teaching, mentoring, URI treasurer, Fox Point mentor; and a short "beyond code" list |
| `awards` | The AWS hackathon win. Always render `award.wording` verbatim. |
| `education` | DevAccelerator certificate (2023), URI BBA Accounting |
| `timeline` | Oldest-first entries with `year`, `when`, `title`, `body`, `kind` (v4 spine) |
| `nowBuilding` | What he is working on now |
| `evidence`, `getEvidence(id)`, `namedTerms`, `structuralNumbers` | The number register used by `audit:facts` |
| Types | `Project`, `CaseStudy`, `Experience`, `Identity`, `Metric`, `Link`, `TimelineEntry`, `ProjectSlug`, `DiagramId`, and more in `src/content/types.ts` |

### Components (`@/components/shared`)

| Component | Props | Notes |
|---|---|---|
| `Monogram` | `variant` (`editorial`, `cinematic`, `terminal`, `seal`), `size`, `animate`, `delay`, `duration`, `title`, `decorative`, `className` | SVG "JT" drawn on with `pathLength`; static under reduced motion or when the toggle is off. Colors: `--mono-ink`, `--mono-paper`, `--mono-accent`. The terminal caret blinks via `.jt-caret`. |
| `MonogramStatic` | same as `Monogram` without `animate`, `delay`, `duration` | The finished mark as a server component: no JavaScript and no framer-motion. Use it wherever the mark never draws on. Each stroke has `pathLength` 1 for a CSS draw-on. |
| `VersionSwitcher` | `current?`, `display` (`compact` or `full`), `label`, `className` | Links to `/vN/`. Detects the version from the URL; `/` counts as v3. Style with `--vs-fg`, `--vs-line`, `--vs-accent`, `--vs-on-accent` or your own class. |
| `CopyEmail` | `label`, `copiedLabel`, `className`, `showAddress`, `addressClassName` | Assembles the address in the browser only, copies it, announces the result in a polite live region, and reveals the address if the clipboard is blocked. Never write the address or a `mailto:` link yourself. |
| `MotionToggle` | `label`, `onText`, `offText`, `className` | A `role="switch"` button. Persists to localStorage (guarded), sets `html[data-motion]`. |
| `MotionProvider`, `useMotionPreference()` | | The provider is already in the root layout. It holds the motion choice only and ships no framer-motion. `useMotionPreference().reduced` is true when the OS asks for reduced motion or the viewer turned motion off. |
| `MotionFeatures` | `children` | LazyMotion (`domAnimation`, `strict`) plus `MotionConfig`. Wrap any tree that renders `m.*` components in it (v1 and v2 do it in their Shell; v3 and v4 only around the islands that need it), so pages animated with CSS alone never download framer-motion. Use `m.*` components, never `motion.*`. |
| `SkipLink` | `targetId`, `label`, `className` | Already rendered by each Shell |
| `ResumeButton` | `mode` (`download` or `open`), `className`, `children` | Links to `/resume/Johnlenny_Tejada_Resume.pdf` |
| `TruckWhatDiagram`, `PrismShiftDiagram`, `IlopDiagram`, `diagramsById[project.diagram]` | `className`, `layout` (`auto`, `wide`, `tall`), `caption` | Server-rendered SVG figures. `auto` switches to a tall layout when the container is under 560px wide. Theme with `--dg-bg`, `--dg-fg`, `--dg-muted`, `--dg-line`, `--dg-node`, `--dg-node-stroke`, `--dg-accent` (AI agents), `--dg-accent-2` (human steps), `--dg-group`, `--dg-font`, `--dg-mono`. |
| `JsonLd` | `data` | Already used for the Person schema in the root layout |

### Library (`@/lib/*`)

- `@/lib/site`: `siteUrl`, `siteName`, `versions`, `getVersion(id)`, `defaultVersion`, `routes.home(v)`, `routes.about(v)`, `routes.work(v, slug)`, `routes.resume`, `routes.og(id)`, `absoluteUrl(path)`. All paths end with `/`.
- `@/lib/seo`: `pageMetadata({ title?, description?, path, og? })`, `personJsonLd()`.

### Styling

`src/app/globals.css` loads Tailwind v4 and maps shared utilities to variables your `theme.css` sets on `.vN-root`: `bg-bg`, `text-fg`, `text-muted`, `text-accent`, `text-accent-2`, `border-line`, `bg-surface`, `font-display`, `font-body`, `font-mono`. Set `--c-*` (colors) and `--ff-*` (font stacks) in your theme. Keep text contrast at WCAG AA or better in both color schemes.

## Rules that the audits enforce

Run these before handing work back. CI runs all of them.

```
pnpm lint && pnpm typecheck && pnpm build && pnpm audit:terms && pnpm audit:facts && pnpm check:links
```

- `audit:terms` fails on em dashes (anywhere, including comments), placeholder copy, unconfirmed tech names, "senior", wrong award or title wording, a plain email address or `mailto:`, and private personal data.
- `audit:facts` fails on any visible number that is not backed by a row in `src/content/evidence.ts`. Do not type numbers into your components; render them from content.
- `check:links` fails on broken internal links or missing `#fragment` targets.
- Lighthouse CI (`lighthouserc.json`) asserts performance 0.9, accessibility 0.95, best practices 0.95 and SEO 0.95 on `/`, `/v1/`, `/v2/`, `/v3/` and `/v4/`.

Content rules that no script can fully check:

- No invented testimonials, logos, client names, stats or screenshots. Where there is no real image, use a designed SVG or an honest styled card, never a fake screenshot and never "coming soon" text.
- No HumanixOS logo or screenshots. No photos from `_private/`.
- Animate only `transform` and `opacity` (plus SVG `pathLength`), and give every animation a static state under reduced motion.
- Keep the layout working at 360px wide with no horizontal scroll.

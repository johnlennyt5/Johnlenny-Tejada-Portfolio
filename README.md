# Johnlenny Tejada, portfolio

The personal site of Johnlenny Tejada, an automation and AI engineer in Providence, Rhode Island. He builds UiPath RPA and agentic workflows, and the full-stack TypeScript products around them.

The design is built around three words: **Build. Solve. Scale.** Every page is static HTML, so it is fast, cheap to host and easy to audit.

## What is on the site

| Route | What it shows |
|---|---|
| `/` | Hero with his photo and a live "bot run" card, the projects (each with Preview, Code and Architecture tabs), a drag-to-compare manual vs automated slider, timeline and community photos, about and contact. |
| `/work/<slug>/` | A case study for truckWhat, PrismShift, SmartFit Metrics and ILOP: screenshots, real code, architecture, decisions, what broke, results and honest caveats. |
| `/lab/v1/` to `/lab/v4/` | The four earlier design explorations, with `/lab/compare/`. Linked only from the footer ("Design lab") and not indexed. |

A palette picker in the header recolors the whole site live (Ember, Volt, Midnight, Royal, Daylight). The choice is saved in the browser, and `?palette=<name>` shares a look.

## Stack

- Next.js 15 (App Router) with `output: "export"`, so the build is plain files in `out/`
- TypeScript (strict); the main site uses plain CSS with palette tokens (`src/components/site/site.css`)
- Shiki at build time for code panels, themed by the same palette tokens
- CSS and IntersectionObserver motion, with full support for reduced motion
- `next/font/google` (Sora, Inter, JetBrains Mono)
- `@vercel/analytics`, only on Vercel builds
- pnpm

## Project layout

```
src/content/              All facts and copy (one source of truth)
src/content/evidence.ts   Every number on the site, with where it comes from
src/content/showcase.ts   Copy for the main site
src/content/code-excerpts.ts, architecture.ts   Real code and repo structure for each project
src/components/site/      The main site (Home, CaseStudy, Nav, ProjectMedia, CompareSlider, site.css)
src/app/(site)/           Routes for / and /work/<slug>/
src/app/lab/              Earlier design versions, noindex
src/app/og/               Open Graph cards, rendered at build time
scripts/                  Audits that run in CI
public/img/               Photos and project screenshots
```

## Run it locally

Requires Node 22.18 or newer and pnpm.

```
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # static export to out/
pnpm start        # serve out/ locally
```

## Quality gates

Every push to `main` and every pull request runs `.github/workflows/ci.yml`:

| Step | Command | What it checks |
|---|---|---|
| Lint | `pnpm lint` | ESLint with the Next.js rules |
| Types | `pnpm typecheck` | TypeScript in strict mode |
| Build | `pnpm build` | Every page exports to static HTML |
| Banned terms | `pnpm audit:terms` | No em dashes, no placeholder copy, no claims the facts do not support, no private contact details |
| Numbers | `pnpm audit:facts` | Every number a visitor can read traces back to `src/content/evidence.ts` |
| Links | `pnpm check:links` | Every internal link and anchor in `out/` resolves |
| Lighthouse | `lhci autorun` | Performance, Accessibility, Best Practices and SEO on the home page and the four case studies (config in `lighthouserc.json`) |

Accessibility is also checked with axe-core at phone and desktop widths, in every palette.

## Deploy to Vercel (free Hobby plan)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub and import the repo.
3. Framework preset: **Next.js** (detected automatically). Leave the build command and output settings as they are; Vercel handles the static `out/` export.
4. Under Environment Variables, add `NEXT_PUBLIC_SITE_URL` set to the final address, for example `https://johnlenny-tejada.vercel.app` (no trailing slash). It sets canonical URLs, the sitemap and Open Graph links.
5. Optional: add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` with the token from Google Search Console's "HTML tag" method.
6. Deploy. Every later push to `main` redeploys on its own, and pull requests get preview links.

After changing an environment variable, redeploy so the static pages pick it up.

## Privacy

The email address is never written in the HTML. The "Copy email" button assembles it in the browser. The site has no phone number, no street address and no client data.

## Reuse

The code is here to read and learn from. The words, the headshot and the resume belong to Johnlenny Tejada; please do not reuse them.

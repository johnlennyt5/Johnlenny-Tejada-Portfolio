# Johnlenny Tejada, portfolio

The personal site of Johnlenny Tejada, an automation and AI engineer in Providence, Rhode Island. He builds UiPath RPA and agentic workflows, and the full-stack TypeScript products around them.

The site tells one set of facts in four different designs. Every page is static HTML, so it is fast, cheap to host and easy to audit.

## The four versions

| Route | Name | Concept |
|---|---|---|
| `/v1/` | The Index | A Swiss annual report of a career: type, rules and an index of the work. |
| `/v2/` | Launch | A product-launch keynote: pinned scenes, proof chips and a dark stage. |
| `/v3/` | The Robot Room | An RPA control room: the workflow assembles itself as you scroll. This is also the default at `/`. |
| `/v4/` | Providence, Built by Hand | Warm chapters from the barbershop books to AI agents. |

Each version has a home page, an about page and a case study for every project at `/vN/work/<slug>/`. A version switcher sits in every version's header or footer. `/compare/` shows all four side by side with their accessibility and Lighthouse results; each footer links to it as "All versions".

## Stack

- Next.js 15 (App Router) with `output: "export"`, so the build is plain files in `out/`
- TypeScript (strict), Tailwind CSS v4
- Framer Motion (LazyMotion with `m.*` components), with a motion toggle and full support for reduced motion
- `next/font/google`, loaded per version so each design only ships its own fonts
- `@vercel/analytics`, only on Vercel builds
- pnpm

## Project layout

```
src/content/            All facts and copy, shared by every version (one source of truth)
src/content/evidence.ts Every number on the site, with where it comes from
src/components/shared/  Monogram, VersionSwitcher, CopyEmail, MotionToggle, SkipLink, ResumeButton, diagrams
src/components/vN/      One design version (v1 to v4)
src/app/vN/             Routes for that version
src/app/compare/        The side-by-side page
src/app/og/             Open Graph cards, rendered at build time
src/lib/                Site constants, SEO helpers, QA results for /compare
scripts/                Audits that run in CI
public/                 Headshot, resume PDF, /compare screenshots
```

See `CONTRIBUTING-VERSIONS.md` for the rules each version follows.

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
| Lighthouse | `lhci autorun` | Performance, Accessibility, Best Practices and SEO on the five home pages (config in `lighthouserc.json`) |

Accessibility was also checked with axe-core at phone and desktop widths, in light and dark mode, with motion on and off. The results are on `/compare/`.

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

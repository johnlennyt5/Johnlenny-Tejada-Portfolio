# Johnlenny Tejada, portfolio

Personal site for Johnlenny Tejada, automation and AI engineer in Providence, RI.

- Next.js 15 (App Router, static export), TypeScript, Tailwind CSS v4, Framer Motion
- Four design versions at `/v1/` to `/v4/`; `/` renders v3
- All facts and copy live in `src/content/`; every number traces to `src/content/evidence.ts`

```
pnpm install
pnpm dev          # local dev server
pnpm build        # static export to out/
pnpm lint && pnpm typecheck
pnpm audit:terms && pnpm audit:facts && pnpm check:links
```

Set `NEXT_PUBLIC_SITE_URL` to change the canonical origin (default `https://johnlenny-tejada.vercel.app`).

See `CONTRIBUTING-VERSIONS.md` for how the versions are split.

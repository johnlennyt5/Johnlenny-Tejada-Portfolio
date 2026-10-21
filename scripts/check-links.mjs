#!/usr/bin/env node
/**
 * Internal link check for the static export. For every HTML file in out/, resolves each
 * internal href/src (and same-page #fragments) and fails if the target file or id is missing.
 * External links are listed with --external but not fetched.
 *
 * Usage: node scripts/check-links.mjs [--external]
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "out");

if (!existsSync(OUT)) {
  console.error("check-links: out/ not found. Run `pnpm build` first.");
  process.exit(1);
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (extname(name) === ".html") files.push(full);
  }
  return files;
}

function pagePath(file) {
  const rel = "/" + relative(OUT, file).replace(/\\/g, "/");
  return rel.replace(/index\.html$/, "");
}

function resolveTarget(pathname) {
  const clean = decodeURIComponent(pathname.split("?")[0]);
  const candidates = [clean, join(clean, "index.html"), `${clean}.html`];
  for (const c of candidates) {
    const full = join(OUT, c);
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

function idsIn(html) {
  const ids = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  return ids;
}

const files = walk(OUT);
const htmlCache = new Map();
const read = (f) => {
  if (!htmlCache.has(f)) htmlCache.set(f, readFileSync(f, "utf8"));
  return htmlCache.get(f);
};

const broken = [];
const external = new Set();
let checked = 0;

for (const file of files) {
  const html = read(file).replace(/<script[\s\S]*?<\/script>/gi, "");
  const base = pagePath(file);
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, "&");
    if (/^(?:https?:)?\/\//.test(url)) {
      external.add(url);
      continue;
    }
    if (/^(?:mailto:|tel:|data:|javascript:)/.test(url)) continue;
    checked += 1;
    const [pathPart, fragment] = url.split("#");
    let targetFile = file;
    if (pathPart) {
      const absolute = pathPart.startsWith("/") ? pathPart : new URL(pathPart, `http://x${base}`).pathname;
      if (absolute.startsWith("/_vercel/")) continue;
      targetFile = resolveTarget(absolute);
      if (!targetFile) {
        broken.push({ page: base, url, reason: "missing file" });
        continue;
      }
    }
    if (fragment && extname(targetFile) === ".html" && !idsIn(read(targetFile)).has(fragment)) {
      broken.push({ page: base, url, reason: `missing #${fragment}` });
    }
  }
}

if (process.argv.includes("--external")) {
  console.log(`External links (${external.size}, not fetched):`);
  for (const u of [...external].sort()) console.log(`  ${u}`);
}

if (broken.length) {
  console.error(`check-links FAILED: ${broken.length} broken internal link(s):`);
  for (const b of broken) console.error(`  ${b.page} -> ${b.url} (${b.reason})`);
  process.exit(1);
}
console.log(`check-links passed (${files.length} pages, ${checked} internal links, ${external.size} external links not fetched).`);

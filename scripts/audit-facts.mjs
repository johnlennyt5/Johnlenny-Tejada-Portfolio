#!/usr/bin/env node
/**
 * Number audit. Every number a visitor can read must trace back to src/content/evidence.ts.
 *
 * 1. Builds an allowlist of numeric tokens from evidence values, `namedTerms` and
 *    `structuralNumbers` in evidence.ts, plus years 2009 to 2026.
 * 2. Extracts number-bearing phrases from string literals in src/content/*.ts and from the
 *    visible text of every HTML file in out/ (scripts and styles removed, tags stripped).
 * 3. Prints every phrase whose number is not on the allowlist, and exits 1 (or 0 with --warn).
 *
 * Usage: node scripts/audit-facts.mjs [--warn] [--src-only]
 * Requires Node 22.18+ (loads evidence.ts with built-in type stripping).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CONTENT = join(ROOT, "src", "content");
const OUT = join(ROOT, "out");
const warnOnly = process.argv.includes("--warn");
const srcOnly = process.argv.includes("--src-only");

const { evidence, namedTerms, structuralNumbers } = await import(pathToFileURL(join(CONTENT, "evidence.ts")).href);

/** Numbers as a reader sees them: 730+, 5,000+, 85%, 7.3, #1382, 3-hour. */
const NUMBER = /(?<![A-Za-z0-9_])#?\d[\d,]*(?:\.\d+)?(?:\+|%)?/g;

function tokens(text) {
  const found = [];
  NUMBER.lastIndex = 0;
  let m;
  while ((m = NUMBER.exec(text)) !== null) {
    found.push({ raw: m[0], norm: normalize(m[0]), index: m.index });
  }
  return found;
}

function normalize(raw) {
  return raw.replace(/^#/, "").replace(/[,.]$/, "");
}

const allowed = new Set();
for (const row of evidence) for (const t of tokens(row.value)) allowed.add(t.norm);
for (const term of namedTerms) for (const t of tokens(term)) allowed.add(t.norm);
for (const n of structuralNumbers) allowed.add(n);
for (let y = 2009; y <= 2026; y += 1) allowed.add(String(y));

function isAllowed(norm) {
  if (allowed.has(norm)) return true;
  // "730+" written as "730" (or the reverse) is still the same evidence value.
  if (allowed.has(`${norm}+`) || allowed.has(norm.replace(/\+$/, ""))) return true;
  return false;
}

function walk(dir, ext, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, ext, files);
    else if (ext.includes(extname(name))) files.push(full);
  }
  return files;
}

function stripUrls(text) {
  return text.replace(/https?:\/\/\S+/g, " ").replace(/(?:^|\s)\/[\w./-]+/g, " ");
}

/** String literals in a TS file: "..." and `...` (template text only). */
function stringLiterals(source) {
  const out = [];
  const re = /"((?:\\.|[^"\\\n])*)"|`((?:\\.|[^`\\])*)`/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const value = m[1] ?? m[2] ?? "";
    if (/^(?:https?:|\/|#|@\/|\.\/|next\/|react)/.test(value)) continue;
    out.push(value.replace(/\$\{[^}]*\}/g, " "));
  }
  return out;
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");
}

const problems = new Map();

function check(label, text) {
  const clean = stripUrls(text);
  for (const t of tokens(clean)) {
    if (isAllowed(t.norm)) continue;
    const phrase = clean.slice(Math.max(0, t.index - 45), t.index + t.raw.length + 45).trim();
    const key = `${t.norm}::${phrase}`;
    if (!problems.has(key)) problems.set(key, { token: t.raw, phrase, where: new Set() });
    problems.get(key).where.add(label);
  }
}

const contentFiles = walk(CONTENT, [".ts"]).filter((f) => !/evidence\.ts$|types\.ts$|index\.ts$/.test(f));
for (const file of contentFiles) {
  for (const lit of stringLiterals(readFileSync(file, "utf8"))) check(relative(ROOT, file), lit);
}

let htmlCount = 0;
if (!srcOnly) {
  if (!existsSync(OUT)) console.warn("audit:facts: out/ not found, checked src/content only. Run `pnpm build` first.");
  for (const file of walk(OUT, [".html"])) {
    // /compare shows QA scores of this website (Lighthouse, axe), not claims about Johnlenny.
    // Its data lives in src/lib/qa.ts. Everything else on the page comes from src/content.
    if (relative(OUT, file).replace(/\\/g, "/") === "compare/index.html") continue;
    htmlCount += 1;
    check(relative(ROOT, file).replace(/\\/g, "/"), visibleText(readFileSync(file, "utf8")));
  }
}

const list = [...problems.values()];
const summary = `${contentFiles.length} content files, ${htmlCount} HTML files, ${allowed.size} allowed numbers`;
if (list.length === 0) {
  console.log(`audit:facts passed (${summary}).`);
  process.exit(0);
}

console.error(`audit:facts found ${list.length} number(s) with no evidence row (${summary}):\n`);
for (const p of list) {
  const where = [...p.where];
  console.error(`  "${p.token}"  in: ...${p.phrase}...`);
  console.error(`      ${where.slice(0, 3).join(", ")}${where.length > 3 ? ` and ${where.length - 3} more` : ""}`);
}
console.error("\nAdd a row to src/content/evidence.ts (with its ledger source) or remove the number.");
process.exit(warnOnly ? 0 : 1);

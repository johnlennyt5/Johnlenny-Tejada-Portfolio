#!/usr/bin/env node
/**
 * Banned-terms audit. Scans src/ and the static export in out/ (HTML, JS, TXT, XML, JSON, CSS)
 * and fails with a list of every hit.
 *
 * Usage: node scripts/audit-terms.mjs [--src-only]
 *
 * Numeric rules use digit boundaries so "226" does not match inside "12260".
 *
 * Private values (his second email, phone number, home street) are never written here in plain
 * text, because this repo is public. They are checked by SHA-256 of normalized candidates instead.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "out");

const EM_DASH = String.fromCharCode(0x2014);

/** @type {{ id: string, pattern: RegExp, why: string, scope?: "all" | "out" | "src" }[]} */
const RULES = [
  { id: "em-dash", pattern: new RegExp(EM_DASH, "g"), why: "No em dashes anywhere (copy or comments)" },
  { id: "lorem", pattern: /\blorem\b/gi, why: "No placeholder copy" },
  { id: "hipaa", pattern: /\bHIPAA\b/gi, why: "Not a claim he can make" },
  { id: "kubernetes", pattern: /\bKubernetes\b/gi, why: "Not in the ledger" },
  { id: "kafka", pattern: /\bKafka\b/gi, why: "Not in the ledger" },
  { id: "terraform", pattern: /\bTerraform\b/gi, why: "Not in the ledger" },
  { id: "angular", pattern: /\bAngular\b/g, why: "Not in the ledger" },
  { id: "1st-place", pattern: /\b1st\s+place\b/gi, why: 'Use "Winner (team), Best use of AWS AI"' },
  { id: "first-place", pattern: /\bfirst\s+place\b/gi, why: 'Use "Winner (team), Best use of AWS AI"' },
  { id: "senior", pattern: /\bsenior\b/gi, why: "Mid level framing only" },
  { id: "226", pattern: /(?<![\d.])226(?![\d])/g, why: 'Unverified RLS count; use "200+"' },
  { id: "event-coordinator", pattern: /\bEvent\s+Coordinator\b/gi, why: 'Title is "Assistant Coordinator"' },
  { id: "email-literal", pattern: /johnlennyt@gmail\.com/gi, why: "Email must be assembled in JS by CopyEmail" },
  { id: "mailto", pattern: /mailto:/gi, why: "No plain mailto links; use CopyEmail" },
  { id: "tenant-url", pattern: /cloud\.uipath\.com\/[a-z0-9-]+\//gi, why: "No UiPath tenant URLs" },
  // Claims removed by the 2026-10-21 fact audit (not in the ledger or the fact-checked Phase 0 tables).
  { id: "grades-a-to-f", pattern: /\bA to F\b/g, why: "PrismShift letter grades are unconfirmed; say \"14 analysis rules\"" },
  { id: "automation-anywhere", pattern: /\bAutomation Anywhere\b/gi, why: "PrismShift Automation Anywhere adapter is unconfirmed" },
  { id: "proof-of-delivery", pattern: /\bproof of delivery\b/gi, why: "truckWhat proof of delivery is unconfirmed" },
  { id: "veto", pattern: /\bveto(?:es|ed)?\b/gi, why: "ILOP compliance veto is unconfirmed; say \"compliance agent\"" },
  { id: "agent-builder", pattern: /\bAgent Builder\b/g, why: "Not in the ledger; say \"UiPath agents\"" },
  { id: "never-leave", pattern: /never leave the (?:building|machine)/gi, why: "Overclaim; say \"parsed in the browser\"" },
  { id: "production-python", pattern: /\bproduction Python\b/gi, why: "Python is project work only" },
  { id: "expert", pattern: /\bexpert\b/gi, why: "No \"expert\" claims" },
];

const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".jsx", ".css", ".md", ".mdx", ".json", ".html", ".txt", ".xml", ".svg", ".webmanifest"]);

/** Third-party framework chunks can contain arbitrary numbers. Only numeric rules skip them. */
const NUMERIC_RULES = new Set(["226"]);

/**
 * Hashed private values. Each entry: how to extract candidates, how to normalize them, and the
 * SHA-256 of the normalized private value.
 */
const PRIVATE = [
  {
    id: "private-email-user",
    why: "Private second email address",
    extract: /[a-z0-9]{9}/gi,
    normalize: (s) => s.toLowerCase(),
    hash: "a979ef4fd8f840769e0b15e3c5fc14d354ede38cc81de1ba87f9cc3712ec5d5c",
  },
  {
    id: "private-phone",
    why: "Private phone number",
    extract: /(?<!\d)\d{3}[-.\s]?\d{4}(?!\d)/g,
    normalize: (s) => s.replace(/\D/g, ""),
    hash: "f593b7cc81955cbac4a80f51b3140d1368f20c1165eab41d92f2217cc6a7e953",
  },
  {
    id: "private-street",
    why: "Private home address",
    extract: /\d{3}\s+[a-z]{7}/gi,
    normalize: (s) => s.toLowerCase().replace(/\s+/g, " "),
    hash: "0f33b88c847d6565905ba3da680a488f998200e2ac5a921d98ed2590482e3bf5",
  },
];

const sha256 = (s) => createHash("sha256").update(s).digest("hex");

/** Mask private values inside printed snippets, so CI logs never show them. */
function redact(snippet) {
  let out = snippet;
  for (const p of PRIVATE) {
    out = out.replace(new RegExp(p.extract.source, p.extract.flags), (m) => (sha256(p.normalize(m)) === p.hash ? "[private]" : m));
  }
  return out;
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, files);
    else if (TEXT_EXT.has(extname(name).toLowerCase())) files.push(full);
  }
  return files;
}

function isFrameworkChunk(file) {
  const rel = relative(OUT, file).replace(/\\/g, "/");
  if (!rel.startsWith("_next/static/")) return false;
  // App code lives in chunks/app/**; everything else under _next/static is framework or shared vendor code.
  return !rel.startsWith("_next/static/chunks/app/");
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (text.charCodeAt(i) === 10) line += 1;
  return line;
}

const srcOnly = process.argv.includes("--src-only");
const targets = [...walk(SRC), ...(srcOnly ? [] : walk(OUT))];

if (!srcOnly && !existsSync(OUT)) {
  console.warn("audit:terms: out/ not found, scanning src/ only. Run `pnpm build` first for a full audit.");
}

const hits = [];
for (const file of targets) {
  const text = readFileSync(file, "utf8");
  const framework = file.startsWith(OUT) && isFrameworkChunk(file);
  for (const rule of RULES) {
    if (framework && NUMERIC_RULES.has(rule.id)) continue;
    rule.pattern.lastIndex = 0;
    let m;
    while ((m = rule.pattern.exec(text)) !== null) {
      const start = Math.max(0, m.index - 40);
      const snippet = redact(text.slice(start, m.index + m[0].length + 40).replace(/\s+/g, " "));
      hits.push({ rule: rule.id, why: rule.why, file: relative(ROOT, file), line: lineOf(text, m.index), snippet });
      if (hits.length > 500) break;
    }
  }
  for (const p of PRIVATE) {
    p.extract.lastIndex = 0;
    let m;
    while ((m = p.extract.exec(text)) !== null) {
      if (sha256(p.normalize(m[0])) === p.hash) {
        hits.push({ rule: p.id, why: p.why, file: relative(ROOT, file), line: lineOf(text, m.index), snippet: "(private value, not printed)" });
      }
    }
  }
}

if (hits.length === 0) {
  console.log(`audit:terms passed (${targets.length} files scanned, ${RULES.length + PRIVATE.length} rules).`);
  process.exit(0);
}

console.error(`audit:terms FAILED with ${hits.length} hit(s):\n`);
for (const h of hits) {
  console.error(`  [${h.rule}] ${h.file}:${h.line}  ${h.why}`);
  console.error(`      ...${h.snippet}...`);
}
process.exit(1);

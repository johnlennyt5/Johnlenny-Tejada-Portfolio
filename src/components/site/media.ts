import fs from "node:fs";
import path from "node:path";
import { codeToHtml, createCssVariablesTheme } from "shiki";
import { architecture } from "@/content/architecture";
import { codeExcerpts } from "@/content/code-excerpts";
import type { Arch, CodeRef, CodeSample, Shot } from "./ProjectMedia";

/* Build-time loaders for each project's screenshots, highlighted code and architecture. */

const theme = createCssVariablesTheme({ name: "site", variablePrefix: "--shiki-", fontStyle: true });

/** Folder names under public/img/projects that differ from the project slug. */
const shotFolders: Record<string, string[]> = {
  truckwhat: ["truckwhat"],
  prismshift: ["prismshift"],
  ilop: ["ilop"],
  "smartfit-metrics": ["smartfit-metrics", "smartfit"],
};

function altFromFile(project: string, file: string): string {
  const words = file
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d+[-_]?/, "")
    .replace(new RegExp(`^${project.split(" ")[0]}[-_]?`, "i"), "")
    .replace(/[-_]+/g, " ")
    .trim();
  return words ? `${project} screenshot: ${words}` : `${project} screenshot`;
}

function imageSize(file: string): { width: number; height: number } {
  // WebP (VP8X / VP8 / VP8L) and PNG headers are enough here.
  const b = fs.readFileSync(file);
  if (b.toString("ascii", 0, 4) === "RIFF") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (kind === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (kind === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  return { width: 1600, height: 1000 };
}

export function getShots(slug: string, label: string): Shot[] {
  const out: Shot[] = [];
  for (const folder of shotFolders[slug] ?? [slug]) {
    const dir = path.join(process.cwd(), "public", "img", "projects", folder);
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((f) => /\.(webp|png|jpe?g)$/i.test(f))
      .sort();
    for (const f of files) {
      out.push({
        src: `/img/projects/${folder}/${f}`,
        alt: altFromFile(label, f),
        ...imageSize(path.join(dir, f)),
      });
    }
  }
  return out.slice(0, 5);
}

const codeKeys: Record<string, string[]> = {};

export async function getCode(slug: string): Promise<CodeSample[]> {
  const list = (codeKeys[slug] ?? [slug]).flatMap((k) => codeExcerpts[k] ?? []);
  return Promise.all(
    list.map(async (c) => ({
      file: c.file,
      title: c.title,
      html: await codeToHtml(c.code.replace(/\s+$/, ""), { lang: c.lang, theme }),
    })),
  );
}

/** Titles and file names only; the highlighted code is served from /code/<slug>.json. */
export function getCodeIndex(slug: string): CodeRef[] {
  return (codeKeys[slug] ?? [slug]).flatMap((k) => codeExcerpts[k] ?? []).map((c) => ({ file: c.file, title: c.title }));
}

export function getArch(slug: string): Arch | undefined {
  const a = architecture[slug];
  if (!a) return undefined;
  return {
    nodes: a.nodes.map((n) => ({ id: n.id, label: n.label, detail: n.detail, path: n.path })),
    edges: a.edges.map((e) => [e[0], e[1], e[2]] as [string, string, string?]),
  };
}

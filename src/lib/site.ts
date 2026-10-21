/**
 * Site-wide constants: base URL, the four design versions and route builders.
 * Set NEXT_PUBLIC_SITE_URL in the environment to change the canonical origin.
 */

const DEFAULT_SITE_URL = "https://johnlenny-tejada.vercel.app";

export const siteUrl: string = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const siteName = "Johnlenny Tejada";

export type VersionId = "v1" | "v2" | "v3" | "v4";

export interface VersionInfo {
  id: VersionId;
  /** Display name of the design direction. */
  name: string;
  /** One or two words for compact switchers. */
  short: string;
  description: string;
  isDefault: boolean;
}

export const versions: readonly VersionInfo[] = [
  {
    id: "v1",
    name: "The Index",
    short: "Editorial",
    description: "A Swiss annual report of a career: type, rules and an index of the work.",
    isDefault: false,
  },
  {
    id: "v2",
    name: "Launch",
    short: "Cinematic",
    description: "A product-launch keynote: pinned scenes, proof chips and a dark stage.",
    isDefault: false,
  },
  {
    id: "v3",
    name: "The Robot Room",
    short: "Automation",
    description: "An RPA control room: the workflow assembles itself as you scroll.",
    isDefault: true,
  },
  {
    id: "v4",
    name: "Providence, Built by Hand",
    short: "Human story",
    description: "Warm chapters from the barbershop books to AI agents.",
    isDefault: false,
  },
] as const;

export const defaultVersion: VersionId = "v3";

export function getVersion(id: VersionId): VersionInfo {
  const v = versions.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown version: ${id}`);
  return v;
}

/** Route builders. All paths end with a slash to match `trailingSlash: true`. */
export const routes = {
  root: "/",
  home: (v: VersionId) => `/${v}/`,
  about: (v: VersionId) => `/${v}/about/`,
  work: (v: VersionId, slug: string) => `/${v}/work/${slug}/`,
  resume: "/resume/Johnlenny_Tejada_Resume.pdf",
  og: (id: VersionId | "default") => `/og/${id}.png`,
} as const;

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

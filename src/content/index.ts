/**
 * Single source of truth for every version of the site.
 * Import from "@/content" only; never hard-code facts or numbers in a version.
 */
export * from "./types";
export { profile } from "./profile";
export type { Profile } from "./profile";
export { identities, primaryIdentity, secondaryIdentity } from "./identities";
export { experience, getExperience } from "./experience";
export { projects, projectSlugs, getProject, featuredProjects } from "./projects";
export { skills } from "./skills";
export { community, beyondCode, awards, education } from "./community";
export { timeline, nowBuilding } from "./timeline";
export { evidence, getEvidence, namedTerms, structuralNumbers } from "./evidence";
export type { EvidenceId } from "./evidence";

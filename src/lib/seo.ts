import type { Metadata } from "next";
import { profile } from "@/content";
import { absoluteUrl, routes, siteName, siteUrl, type VersionId } from "./site";

interface PageMetaInput {
  /** Page title without the site suffix. Omit on home pages. */
  title?: string;
  description?: string;
  /** Path with trailing slash, e.g. "/v1/work/truckwhat/". */
  path: string;
  /** Which OG card to use. Defaults to "default". */
  og?: VersionId | "default";
}

/**
 * Per-route metadata with canonical URL, Open Graph and Twitter cards.
 * Always pass `path`; Open Graph images point at the pre-rendered cards under /og/.
 */
export function pageMetadata({ title, description, path, og = "default" }: PageMetaInput): Metadata {
  const desc = description ?? profile.description;
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName}: ${profile.headline}`;
  const image = { url: routes.og(og), width: 1200, height: 630, alt: `${siteName}, ${profile.headline}` };
  return {
    title: { absolute: fullTitle },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: path.includes("/work/") ? "article" : "profile",
      url: path,
      siteName,
      title: fullTitle,
      description: desc,
      locale: "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [image.url],
    },
  };
}

/** schema.org Person for the root layout. No email, phone or street address. */
export function personJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    givenName: profile.givenName,
    familyName: profile.familyName,
    jobTitle: profile.headline,
    description: profile.description,
    url: `${siteUrl}/`,
    image: absoluteUrl(profile.headshot.src),
    sameAs: [profile.links.linkedin.href, profile.links.github.href],
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.location.city,
      addressRegion: profile.location.region,
      addressCountry: profile.location.country,
    },
    knowsLanguage: ["en", "es"],
    worksFor: { "@type": "Organization", name: "HumanixOS", url: "https://humanixos.com" },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "University of Rhode Island" },
      { "@type": "EducationalOrganization", name: "DevAccelerator" },
    ],
  };
}

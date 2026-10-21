import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/shared/JsonLd";
import { profile } from "@/content";
import { personJsonLd } from "@/lib/seo";
import { siteName, siteUrl } from "@/lib/site";

/*
 * Root layout: no fonts or global CSS here. The main site loads its own (SiteShell); the lab
 * versions load Tailwind, Framer Motion and their boot scripts in src/app/lab/layout.tsx.
 */

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName}: ${profile.headline}`, template: `%s | ${siteName}` },
  description: profile.description,
  applicationName: siteName,
  authors: [{ name: profile.name, url: profile.links.linkedin.href }],
  creator: profile.name,
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
  // Google Search Console "HTML tag" check: set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel to the token.
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

/** Only load Vercel Analytics on Vercel builds; elsewhere its script would 404. */
const onVercel = process.env.VERCEL === "1";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <JsonLd data={personJsonLd()} />
        {onVercel ? <Analytics /> : null}
      </body>
    </html>
  );
}

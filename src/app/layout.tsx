import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/shared/JsonLd";
import { MotionProvider, MOTION_STORAGE_KEY } from "@/components/shared/MotionToggle";
import { profile } from "@/content";
import { personJsonLd } from "@/lib/seo";
import { siteName, siteUrl } from "@/lib/site";
import "./globals.css";

/* Root layout: no fonts here. Each version loads its own fonts in its Shell. */

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

/** Applies a saved "motion off" choice before first paint. Storage access can throw, so it is guarded. */
const motionBootScript = `try{var m=localStorage.getItem(${JSON.stringify(MOTION_STORAGE_KEY)});if(m==="off"||m==="on"){document.documentElement.dataset.motion=m}}catch(e){}`;

/** Only load Vercel Analytics on Vercel builds; elsewhere its script would 404. */
const onVercel = process.env.VERCEL === "1";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <JsonLd data={personJsonLd()} />
        {onVercel ? <Analytics /> : null}
      </body>
    </html>
  );
}

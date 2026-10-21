import type { ReactNode } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { prefsBootScript } from "@/components/site/prefs";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: prefsBootScript }} />
      <SiteShell>{children}</SiteShell>
    </>
  );
}

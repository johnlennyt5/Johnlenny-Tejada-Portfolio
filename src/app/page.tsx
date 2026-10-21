import type { Metadata } from "next";
import { Home } from "@/components/v3/Home";
import { V3Shell } from "@/components/v3/Shell";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

/* "/" renders the default version (v3). The v3 agent owns both imports. */

export const metadata: Metadata = pageMetadata({ path: routes.root, og: "default" });

export default function RootPage() {
  return (
    <V3Shell>
      <Home />
    </V3Shell>
  );
}

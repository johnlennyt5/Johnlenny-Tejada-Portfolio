import type { Metadata } from "next";
import { About } from "@/components/v2/About";
import { profile } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description: profile.bio[0],
  path: routes.about("v2"),
  og: "v2",
});

export default function Page() {
  return <About />;
}

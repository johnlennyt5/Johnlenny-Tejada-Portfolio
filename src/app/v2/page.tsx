import type { Metadata } from "next";
import { Home } from "@/components/v2/Home";
import { pageMetadata } from "@/lib/seo";
import { getVersion, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `Portfolio, ${getVersion("v2").name}`,
  path: routes.home("v2"),
  og: "v2",
});

export default function Page() {
  return <Home />;
}

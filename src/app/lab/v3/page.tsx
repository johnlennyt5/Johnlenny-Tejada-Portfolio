import type { Metadata } from "next";
import { Home } from "@/components/v3/Home";
import { pageMetadata } from "@/lib/seo";
import { getVersion, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `Portfolio, ${getVersion("v3").name}`,
  path: routes.home("v3"),
  og: "v3",
});

export default function Page() {
  return <Home />;
}

import type { Metadata } from "next";
import { Home } from "@/components/v1/Home";
import { pageMetadata } from "@/lib/seo";
import { getVersion, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `Portfolio, ${getVersion("v1").name}`,
  path: routes.home("v1"),
  og: "v1",
});

export default function Page() {
  return <Home />;
}

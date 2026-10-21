import type { Metadata } from "next";
import { Home } from "@/components/v4/Home";
import { pageMetadata } from "@/lib/seo";
import { getVersion, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: `Portfolio, ${getVersion("v4").name}`,
  path: routes.home("v4"),
  og: "v4",
});

export default function Page() {
  return <Home />;
}

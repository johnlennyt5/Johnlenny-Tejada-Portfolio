import type { Metadata } from "next";
import { Home } from "@/components/site/Home";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({ path: routes.root, og: "default" });

export default function HomePage() {
  return <Home />;
}

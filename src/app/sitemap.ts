import type { MetadataRoute } from "next";
import { absoluteUrl, routes } from "@/lib/site";
import { featuredSlugs } from "@/content/showcase";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: string[] = [routes.root];
  for (const slug of featuredSlugs) paths.push(routes.project(slug));
  return paths.map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: "monthly",
    priority: p === routes.root ? 1 : p.split("/").length <= 3 ? 0.8 : 0.6,
  }));
}

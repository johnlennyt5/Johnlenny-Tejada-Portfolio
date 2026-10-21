import type { MetadataRoute } from "next";
import { projectSlugs } from "@/content";
import { absoluteUrl, routes, versions } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths: string[] = [routes.root];
  for (const v of versions) {
    paths.push(routes.home(v.id), routes.about(v.id));
    for (const slug of projectSlugs) paths.push(routes.work(v.id, slug));
  }
  return paths.map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: "monthly",
    priority: p === routes.root ? 1 : p.split("/").length <= 3 ? 0.8 : 0.6,
  }));
}

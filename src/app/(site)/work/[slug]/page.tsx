import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject } from "@/content";
import { featuredSlugs } from "@/content/showcase";
import { CaseStudy } from "@/components/site/CaseStudy";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return featuredSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return pageMetadata({ title: `${p.name}: ${p.tagline}`, description: p.summary, path: routes.project(slug) });
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProject(slug) || !featuredSlugs.includes(slug as (typeof featuredSlugs)[number])) notFound();
  return <CaseStudy slug={slug} />;
}

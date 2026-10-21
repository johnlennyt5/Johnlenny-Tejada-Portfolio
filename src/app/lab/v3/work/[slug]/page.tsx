import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/v3/CaseStudy";
import { getProject, projectSlugs } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.name}: ${project.tagline}`,
    description: project.oneLiner,
    path: routes.work("v3", slug),
    og: "v3",
  });
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}

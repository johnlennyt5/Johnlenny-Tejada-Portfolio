import { getCode } from "@/components/site/media";
import { featuredSlugs } from "@/content/showcase";

/*
 * Highlighted code for each project as a static JSON file (/code/<slug>.json). The Code tab
 * fetches it on first open, so the pages do not carry every project's code in their HTML.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return featuredSlugs.map((slug) => ({ file: `${slug}.json` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  return Response.json(await getCode(file.replace(/\.json$/, "")));
}

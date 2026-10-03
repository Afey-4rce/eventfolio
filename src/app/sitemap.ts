import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

/**
 * Dynamic sitemap listing all published EventFolio sites.
 * Cached at the edge for 1 hour. Referenced from /robots.txt.
 *
 * In Next.js 16, a `sitemap.ts` file at the app root generates the
 * `/sitemap.xml` route automatically.
 */
export const revalidate = 3600;
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://eventfolio.app";

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const sites = await db.site.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const siteEntries: MetadataRoute.Sitemap = sites.map((s) => ({
    url: `${base}/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...siteEntries];
}

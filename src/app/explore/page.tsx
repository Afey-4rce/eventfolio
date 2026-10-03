import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ExploreGalleryClient } from "@/components/public/explore-gallery-client";

export const dynamic = "force-static";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Explore · EventFolio",
  description: "Browse published event pages and portfolios built with EventFolio. Filter by type and theme, sort by views, likes, or recency.",
  openGraph: {
    title: "Explore · EventFolio",
    description: "Browse published event pages and portfolios built with EventFolio.",
    siteName: "EventFolio",
    type: "website",
  },
};

export default async function ExplorePage() {
  // Fetch all published sites for the initial SSR render (client refetches on filter change).
  const sites = await db.site.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { user: { select: { name: true } } },
  });

  const initial = sites.map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    slug: s.slug,
    type: s.type as "event" | "portfolio",
    theme: s.theme,
    coverImage: s.coverImage,
    views: s.views,
    likes: s.likes,
    ownerName: s.user?.name ?? null,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-ef-bg text-ef-ink">
      <ExploreGalleryClient initial={initial} />
    </div>
  );
}

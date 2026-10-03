import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { PublicSiteClient } from "@/components/public/public-site-client";

const THEMES = ["aurora", "noir", "sunset", "mint", "crimson"] as const;

export const dynamic = "force-static";
export const revalidate = 60;

/**
 * Public SSR route for a published EventFolio site.
 * Renders the full site server-side (SEO-indexable) and records a view via the API.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await db.site.findFirst({
    where: { slug, published: true },
    select: {
      title: true,
      subtitle: true,
      description: true,
      type: true,
      theme: true,
      coverImage: true,
      slug: true,
      content: true,
      user: { select: { name: true } },
    },
  });

  if (!site) {
    return { title: "Not found · EventFolio" };
  }

  let heroTitle = site.title;
  let heroTagline = site.subtitle ?? "";
  try {
    const parsed = JSON.parse(site.content);
    if (parsed?.hero?.title) heroTitle = parsed.hero.title;
    if (parsed?.hero?.tagline) heroTagline = parsed.hero.tagline;
  } catch {
    /* keep defaults */
  }

  const description = site.description ?? heroTagline ?? `A ${site.type} published on EventFolio.`;

  // OG image: prefer the user's uploaded/generated cover if present,
  // otherwise fall back to our branded SVG OG image at /api/og/[slug].
  const ogImage = site.coverImage && (site.coverImage.startsWith("http") || site.coverImage.startsWith("/") || site.coverImage.startsWith("data:"))
    ? site.coverImage
    : `/api/og/${site.slug}`;

  return {
    title: `${heroTitle} · EventFolio`,
    description,
    openGraph: {
      title: heroTitle,
      description,
      type: "website",
      siteName: "EventFolio",
      images: [{ url: ogImage, width: 1200, height: 630, alt: heroTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: heroTitle,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.site.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      type: true,
      title: true,
      slug: true,
      subtitle: true,
      description: true,
      theme: true,
      content: true,
      coverImage: true,
      views: true,
      likes: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  if (!site) {
    notFound();
  }

  // Validate theme against the known set
  const theme = (THEMES as readonly string[]).includes(site.theme)
    ? (site.theme as (typeof THEMES)[number])
    : "aurora";

  // Parse the structured content
  let content: Record<string, unknown> = {};
  try {
    content = JSON.parse(site.content);
  } catch {
    content = {};
  }

  return (
    <PublicSiteClient
      site={{
        id: site.id,
        type: site.type as "event" | "portfolio",
        title: site.title,
        slug: site.slug,
        subtitle: site.subtitle,
        description: site.description,
        theme,
        coverImage: site.coverImage,
        views: site.views,
        likes: site.likes,
        ownerName: site.user?.name ?? "Anonymous",
        createdAt: site.createdAt.toISOString(),
        content,
      }}
    />
  );
}

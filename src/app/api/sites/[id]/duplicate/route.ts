import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { uniqueSlug } from "@/lib/helpers";

/**
 * POST /api/sites/[id]/duplicate
 * Clones the given site into a new draft owned by the current user.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const original = await db.site.findUnique({ where: { id } });
    if (!original) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    if (original.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const baseSlug = `${original.slug}-copy`;
    const slug = await uniqueSlug(baseSlug, async (s) => {
      const c = await db.site.findFirst({ where: { slug: s }, select: { id: true } });
      return !!c;
    });

    const copy = await db.site.create({
      data: {
        userId: user.id,
        type: original.type,
        title: `${original.title} (copy)`,
        slug,
        subtitle: original.subtitle,
        description: original.description,
        theme: original.theme,
        content: original.content,
        coverImage: original.coverImage,
        published: false,
        views: 0,
        likes: 0,
      },
    });

    await db.analyticsEvent.create({
      data: {
        userId: user.id,
        siteId: copy.id,
        event: "create_site",
        metadata: JSON.stringify({ source: "duplicate", originalId: original.id }),
      },
    });

    return NextResponse.json({ site: copy });
  } catch (e) {
    console.error("[POST /api/sites/:id/duplicate]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

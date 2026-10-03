import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const url = new URL(req.url);
    const publishedParam = url.searchParams.get("published");
    const typeParam = url.searchParams.get("type");

    const where: {
      published?: boolean;
      type?: string;
    } = {};
    if (publishedParam === "true") where.published = true;
    else if (publishedParam === "false") where.published = false;
    if (typeParam === "event" || typeParam === "portfolio") {
      where.type = typeParam;
    }

    const sites = await db.site.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    const result = sites.map((s) => ({
      id: s.id,
      userId: s.userId,
      type: s.type,
      title: s.title,
      slug: s.slug,
      subtitle: s.subtitle,
      description: s.description,
      theme: s.theme,
      content: s.content,
      coverImage: s.coverImage,
      published: s.published,
      views: s.views,
      likes: s.likes,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      ownerName: s.user?.name ?? null,
    }));

    return NextResponse.json({ sites: result });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[admin/sites]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

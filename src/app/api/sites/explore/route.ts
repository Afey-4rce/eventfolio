import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/sites/explore
 * Public. Returns published sites.
 *
 * Query params:
 *  - type=event|portfolio       (filter by site type)
 *  - theme=aurora|noir|...      (filter by theme)
 *  - sort=recent|views|likes    (default: recent)
 *  - limit=1..60                (default: 12, max 60)
 *  - all=1                      (return all — ignores the default 12-cap, capped at 60)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const theme = url.searchParams.get("theme");
    const sortParam = url.searchParams.get("sort") ?? "recent";
    const limitParam = parseInt(url.searchParams.get("limit") ?? "12", 10);
    const wantsAll = url.searchParams.get("all") === "1";

    const where: { published: boolean; type?: string; theme?: string } = { published: true };
    if (type === "event" || type === "portfolio") {
      where.type = type;
    }
    if (["aurora", "noir", "sunset", "mint", "crimson"].includes(theme ?? "")) {
      where.theme = theme as string;
    }

    const sort: "recent" | "views" | "likes" =
      sortParam === "views" ? "views" : sortParam === "likes" ? "likes" : "recent";

    const orderBy =
      sort === "views"
        ? { views: "desc" as const }
        : sort === "likes"
          ? { likes: "desc" as const }
          : { createdAt: "desc" as const };

    const take = wantsAll ? 60 : Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 60 ? limitParam : 12;

    const sites = await db.site.findMany({
      where,
      orderBy,
      take,
      include: {
        user: { select: { name: true } },
      },
    });

    const result = sites.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      slug: s.slug,
      type: s.type,
      theme: s.theme,
      coverImage: s.coverImage,
      views: s.views,
      likes: s.likes,
      ownerName: s.user?.name ?? null,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ sites: result, count: result.length, sort, type: type ?? null, theme: theme ?? null });
  } catch (err) {
    console.error("[sites/explore]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

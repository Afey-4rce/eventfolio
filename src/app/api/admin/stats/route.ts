import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      totalSites,
      publishedSites,
      viewsAgg,
      likesAgg,
      recentSignupsRaw,
      recentSitesRaw,
    ] = await Promise.all([
      db.user.count(),
      db.site.count(),
      db.site.count({ where: { published: true } }),
      db.site.aggregate({ _sum: { views: true } }),
      db.site.aggregate({ _sum: { likes: true } }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      db.site.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: { select: { name: true } } },
      }),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newSignupsLast7Days = await db.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    const eventCount = await db.site.count({ where: { type: "event" } });
    const portfolioCount = await db.site.count({
      where: { type: "portfolio" },
    });

    return NextResponse.json({
      totalUsers,
      totalSites,
      publishedSites,
      totalViews: viewsAgg._sum.views ?? 0,
      totalLikes: likesAgg._sum.likes ?? 0,
      newSignupsLast7Days,
      sitesByType: { event: eventCount, portfolio: portfolioCount },
      recentSignups: recentSignupsRaw,
      recentSites: recentSitesRaw.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        ownerName: s.user?.name ?? null,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[admin/stats]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

/**
 * GET /api/admin/analytics/timeseries
 * Returns daily view + like counts for the last N days (default 14).
 * Output shape: { days: [{ date: "YYYY-MM-DD", views, likes }] }
 */
export async function GET(req: Request) {
  try {
    const user = await requireAdmin();
    const url = new URL(req.url);
    const daysParam = parseInt(url.searchParams.get("days") || "14", 10);
    const days = Number.isFinite(daysParam) && daysParam > 0 && daysParam <= 90 ? daysParam : 14;

    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const events = await db.analyticsEvent.findMany({
      where: {
        createdAt: { gte: start },
        event: { in: ["view", "like"] },
      },
      select: { event: true, createdAt: true },
    });

    const buckets = new Map<string, { views: number; likes: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { views: 0, likes: 0 });
    }

    for (const e of events) {
      const key = e.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (e.event === "view") bucket.views += 1;
      else if (e.event === "like") bucket.likes += 1;
    }

    const daysArr = Array.from(buckets.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      user: { id: user.id, role: user.role },
      days: daysArr,
      totalViews: daysArr.reduce((a, b) => a + b.views, 0),
      totalLikes: daysArr.reduce((a, b) => a + b.likes, 0),
    });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json(
        { error: err.message === "UNAUTHORIZED" ? "Unauthorized" : "Forbidden" },
        { status: 401 },
      );
    }
    console.error("[admin/analytics/timeseries]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

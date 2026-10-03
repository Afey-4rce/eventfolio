import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

type Params = { id: string };

export async function POST(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const site = await db.site.findUnique({ where: { id } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    if (site.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const next =
      typeof body === "object" &&
      body !== null &&
      typeof body.published === "boolean"
        ? body.published
        : !site.published;

    const updated = await db.site.update({
      where: { id },
      data: { published: next },
    });

    await db.analyticsEvent.create({
      data: {
        userId: user.id,
        siteId: site.id,
        event: "publish",
        metadata: JSON.stringify({ published: next }),
      },
    });

    return NextResponse.json({ site: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[sites/[id]/publish]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

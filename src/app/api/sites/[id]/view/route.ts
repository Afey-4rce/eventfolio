import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { id: string };

export async function POST(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const { id } = await params;

    const site = await db.site.findUnique({ where: { id } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const updated = await db.site.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    await db.analyticsEvent.create({
      data: {
        siteId: site.id,
        userId: site.userId,
        event: "view",
      },
    });

    return NextResponse.json({ views: updated.views });
  } catch (err) {
    console.error("[sites/[id]/view]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

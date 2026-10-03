import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { slug: string };

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const { slug } = await params;

    const site = await db.site.findFirst({
      where: { slug },
      include: { user: { select: { name: true } } },
    });

    if (!site || !site.published) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    return NextResponse.json({
      site,
      ownerName: site.user?.name ?? null,
    });
  } catch (err) {
    console.error("[sites/by-slug]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

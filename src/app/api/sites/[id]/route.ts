import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

type Params = { id: string };

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
function notFound() {
  return NextResponse.json({ error: "Site not found" }, { status: 404 });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const site = await db.site.findUnique({ where: { id } });
    if (!site) return notFound();
    if (site.userId !== user.id && user.role !== "admin") return forbidden();

    return NextResponse.json({ site });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorized();
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return forbidden();
    }
    console.error("[sites/[id]/GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const site = await db.site.findUnique({ where: { id } });
    if (!site) return notFound();
    if (site.userId !== user.id && user.role !== "admin") return forbidden();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) {
      data.title = body.title.trim();
    }
    if (typeof body.subtitle === "string") {
      data.subtitle = body.subtitle.trim() || null;
    }
    if (typeof body.description === "string") {
      data.description = body.description.trim() || null;
    }
    if (typeof body.theme === "string" && body.theme.trim()) {
      data.theme = body.theme.trim();
    }
    if (typeof body.content === "string") {
      data.content = body.content;
    }
    if (typeof body.coverImage === "string") {
      data.coverImage = body.coverImage || null;
    }
    if (typeof body.published === "boolean") {
      data.published = body.published;
    }
    if (typeof body.type === "string" && (body.type === "event" || body.type === "portfolio")) {
      data.type = body.type;
    }

    const updated = await db.site.update({ where: { id }, data });
    return NextResponse.json({ site: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorized();
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return forbidden();
    }
    console.error("[sites/[id]/PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const site = await db.site.findUnique({ where: { id } });
    if (!site) return notFound();
    if (site.userId !== user.id && user.role !== "admin") return forbidden();

    await db.site.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorized();
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return forbidden();
    }
    console.error("[sites/[id]/DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

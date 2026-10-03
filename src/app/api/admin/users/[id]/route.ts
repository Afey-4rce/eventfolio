import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

type Params = { id: string };

export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const data: { role?: string; plan?: string } = {};
    if (
      typeof body.role === "string" &&
      (body.role === "user" || body.role === "admin")
    ) {
      data.role = body.role;
    }
    if (
      typeof body.plan === "string" &&
      (body.plan === "free" || body.plan === "pro" || body.plan === "studio")
    ) {
      data.plan = body.plan;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await db.user.update({ where: { id }, data });

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        plan: updated.plan,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[admin/users/[id]/PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

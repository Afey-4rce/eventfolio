import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

/**
 * PATCH /api/users/me
 * Body: { name?, bio?, avatarUrl? }
 * Updates the currently logged-in user's profile.
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { name, bio, avatarUrl, coverUrl } = body as {
      name?: string;
      bio?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
    };

    const data: Record<string, unknown> = {};
    if (typeof name === "string" && name.trim()) {
      data.name = name.trim().slice(0, 80);
    }
    if (typeof bio === "string") {
      data.bio = bio.slice(0, 500);
    }
    if (avatarUrl !== undefined) {
      data.avatarUrl = typeof avatarUrl === "string" ? avatarUrl.slice(0, 500) : null;
    }
    if (coverUrl !== undefined) {
      data.coverUrl = typeof coverUrl === "string" ? coverUrl.slice(0, 500) : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("[PATCH /api/users/me]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

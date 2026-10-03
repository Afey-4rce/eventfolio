import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const templates = await db.template.findMany({
      orderBy: { popularity: "desc" },
    });
    return NextResponse.json({ templates });
  } catch (err) {
    console.error("[templates]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

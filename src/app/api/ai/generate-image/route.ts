import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import ZAI from "z-ai-web-dev-sdk";
import { requireUser } from "@/lib/session";

const SUPPORTED_SIZES = [
  "1024x1024",
  "768x1344",
  "864x1152",
  "1344x768",
  "1152x864",
  "1440x720",
  "720x1440",
] as const;

type GenerateImageBody = {
  prompt?: string;
  size?: (typeof SUPPORTED_SIZES)[number] | string;
};

const GENERATED_DIR = path.join(process.cwd(), "public", "generated");

export async function POST(req: Request) {
  try {
    await requireUser();

    const body = (await req.json().catch(() => null)) as GenerateImageBody | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 },
      );
    }

    const requestedSize = typeof body.size === "string" ? body.size : "";
    const size = (SUPPORTED_SIZES as readonly string[]).includes(requestedSize)
      ? (requestedSize as (typeof SUPPORTED_SIZES)[number])
      : "1024x1024";

    const zai = await ZAI.create();
    const response = await zai.images.generations.create({
      prompt,
      size,
    });

    const base64 = response?.data?.[0]?.base64;
    if (!base64) {
      return NextResponse.json(
        { error: "Image generation returned no data" },
        { status: 500 },
      );
    }

    // Persist to disk so the URL is cacheable + doesn't bloat the DB.
    // Returns a relative URL like `/generated/{siteId-or-session}-{timestamp}.png`.
    let url: string;
    try {
      if (!existsSync(GENERATED_DIR)) {
        await mkdir(GENERATED_DIR, { recursive: true });
      }
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const filename = `img-${stamp}.png`;
      const filepath = path.join(GENERATED_DIR, filename);
      await writeFile(filepath, Buffer.from(base64, "base64"));
      url = `/generated/${filename}`;
    } catch (writeErr) {
      console.error("[ai/generate-image] disk write failed, falling back to data URL", writeErr);
      url = `data:image/png;base64,${base64}`;
    }

    return NextResponse.json({ url, size });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[ai/generate-image]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

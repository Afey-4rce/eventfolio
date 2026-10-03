import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { slugify, uniqueSlug } from "@/lib/helpers";

function starterContent(type: string, title: string, subtitle?: string) {
  if (type === "portfolio") {
    return JSON.stringify({
      hero: {
        title,
        eyebrow: "",
        tagline: subtitle ?? "",
        ctaPrimary: "View work",
        ctaSecondary: "About",
      },
      selected_work: [],
      about: { body: "", highlights: [] },
      services: [],
      contact: { email: "", phone: "", location: "", socials: [] },
    });
  }
  return JSON.stringify({
    hero: {
      title,
      eyebrow: "",
      tagline: subtitle ?? "",
      ctaPrimary: "Reserve a seat",
      ctaSecondary: "Learn more",
    },
    stats: [],
    speakers: [],
    agenda: [],
    sponsors: [],
  });
}

export async function GET() {
  try {
    const user = await requireUser();
    const sites = await db.site.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ sites });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[sites/GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const type =
      typeof body.type === "string" &&
      (body.type === "event" || body.type === "portfolio")
        ? body.type
        : null;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const subtitle =
      typeof body.subtitle === "string" && body.subtitle.trim()
        ? body.subtitle.trim()
        : undefined;
    const description =
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : undefined;
    const theme =
      typeof body.theme === "string" && body.theme.trim()
        ? body.theme.trim()
        : undefined;
    const templateId =
      typeof body.templateId === "string" && body.templateId.trim()
        ? body.templateId.trim()
        : undefined;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type (event|portfolio) and title are required" },
        { status: 400 },
      );
    }

    // Enforce one-portfolio limit: users can have multiple events but only one portfolio
    if (type === "portfolio") {
      const existingPortfolio = await db.site.findFirst({
        where: { userId: user.id, type: "portfolio" },
        select: { id: true },
      });
      if (existingPortfolio) {
        return NextResponse.json(
          { error: "You already have a portfolio. Each account can have only one portfolio site." },
          { status: 409 },
        );
      }
    }

    let resolvedTheme = theme ?? "aurora";
    if (templateId) {
      const tpl = await db.template.findUnique({ where: { id: templateId } });
      if (tpl) {
        resolvedTheme = tpl.theme;
      }
    }

    const base = slugify(title);
    const slug = await uniqueSlug(base, async (s) => {
      const found = await db.site.findFirst({ where: { slug: s } });
      return !!found;
    });

    const site = await db.site.create({
      data: {
        userId: user.id,
        type,
        title,
        slug,
        subtitle,
        description,
        theme: resolvedTheme,
        content: starterContent(type, title, subtitle),
      },
    });

    await db.analyticsEvent.create({
      data: {
        userId: user.id,
        siteId: site.id,
        event: "create_site",
        metadata: JSON.stringify({ type, slug }),
      },
    });

    return NextResponse.json({ site });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[sites/POST]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

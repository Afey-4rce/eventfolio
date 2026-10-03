import { NextRequest } from "next/server";
import sharp from "sharp";
import { db } from "@/lib/db";

/**
 * GET /api/og/[slug]
 * Returns a branded 1200×630 social-share image for the given published site.
 * The image is an SVG (served as `image/svg+xml`) so we don't need an image
 * rendering library — it renders correctly as an OG image on most platforms
 * that accept SVG, and on platforms that don't, the gradient + title fallback
 * still looks good when scraped.
 *
 * Design:
 *  - 1200×630 canvas (standard OG aspect)
 *  - Theme gradient background (aurora/noir/sunset/mint/crimson)
 *  - Subtle grid overlay
 *  - "EventFolio" mono wordmark top-left
 *  - Site type pill top-right (Event / Portfolio)
 *  - Hero eyebrow (small uppercase mono)
 *  - Hero title (large bold, multi-line if long)
 *  - Hero tagline (smaller, muted)
 *  - Owner name bottom-left
 *
 * The route is public (no auth) and cached at the edge for 1 hour.
 */

export const revalidate = 3600;
export const dynamic = "force-static";

const THEMES: Record<string, { from: string; via: string; to: string }> = {
  aurora: { from: "#0d2818", via: "#0d2818", to: "#96a131" },
  noir: { from: "#000900", via: "#0d2818", to: "#0d2818" },
  sunset: { from: "#96a131", via: "#0d2818", to: "#000900" },
  mint: { from: "#f0faf4", via: "#96a131", to: "#0d2818" },
  crimson: { from: "#000900", via: "#0d2818", to: "#96a131" },
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Word-wrap a title into N lines of ~maxChars each. */
function wrapTitle(title: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if (current.length === 0) {
      current = w;
    } else if (current.length + 1 + w.length <= maxCharsPerLine) {
      current += " " + w;
    } else {
      lines.push(current);
      current = w;
      if (lines.length === maxLines - 1) break;
    }
  }
  if (current) lines.push(current);
  // If we ran out of lines, append "…" to the last line
  if (words.join(" ").length > lines.join(" ").length && lines.length === maxLines) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1) + "…";
  }
  return lines;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await db.site.findFirst({
    where: { slug, published: true },
    select: {
      title: true,
      subtitle: true,
      type: true,
      theme: true,
      content: true,
      user: { select: { name: true } },
    },
  });

  if (!site) {
    return new Response("Site not found", { status: 404 });
  }

  const theme = THEMES[site.theme] ?? THEMES.aurora;

  // Parse hero from content
  let heroTitle = site.title;
  let heroEyebrow = site.subtitle ?? "";
  let heroTagline = site.description ?? "";
  try {
    const parsed = JSON.parse(site.content);
    if (parsed?.hero?.title) heroTitle = String(parsed.hero.title);
    if (parsed?.hero?.eyebrow) heroEyebrow = String(parsed.hero.eyebrow);
    if (parsed?.hero?.tagline) heroTagline = String(parsed.hero.tagline);
  } catch {
    /* keep defaults */
  }

  // Cap lengths so the SVG doesn't overflow
  heroTitle = heroTitle.slice(0, 80);
  heroEyebrow = heroEyebrow.slice(0, 60);
  heroTagline = heroTagline.slice(0, 120);
  const ownerName = (site.user?.name ?? "Anonymous").slice(0, 40);
  const typeLabel = site.type === "event" ? "Event" : "Portfolio";

  // Wrap the title into up to 3 lines of ~22 chars
  const titleLines = wrapTitle(heroTitle, 22, 3);
  const titleBlockHeight = titleLines.length * 64; // 64px line height
  const titleStartY = 250; // baseline for the first line

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.from}" />
      <stop offset="50%" stop-color="${theme.via}" />
      <stop offset="100%" stop-color="${theme.to}" />
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.0" />
      <stop offset="60%" stop-color="#000000" stop-opacity="0.0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55" />
    </linearGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect width="1200" height="630" fill="url(#grid)" />
  <rect width="1200" height="630" fill="url(#overlay)" />

  <!-- Top bar: EventFolio wordmark left, type pill right -->
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace">
    <text x="80" y="78" fill="#ffffff" font-size="22" font-weight="600" letter-spacing="-0.5">
      EventFolio<tspan fill="#96a131">.</tspan>
    </text>
  </g>
  <rect x="1040" y="55" width="80" height="32" rx="16" fill="#ffffff" fill-opacity="0.15" />
  <text x="1080" y="76" text-anchor="middle" fill="#ffffff" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="13" font-weight="600" letter-spacing="1.5">${escapeXml(typeLabel.toUpperCase())}</text>

  <!-- Hero eyebrow -->
  ${heroEyebrow ? `<text x="80" y="195" fill="#ffffff" fill-opacity="0.85" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="16" font-weight="500" letter-spacing="3">${escapeXml(heroEyebrow.toUpperCase())}</text>` : ""}

  <!-- Hero title (multi-line) -->
  <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" fill="#ffffff">
    ${titleLines
      .map(
        (line, i) =>
          `<text x="80" y="${titleStartY + i * 64}" font-size="56" letter-spacing="-1.5">${escapeXml(line)}</text>`
      )
      .join("\n    ")}
  </g>

  <!-- Hero tagline -->
  ${heroTagline ? `<text x="80" y="${titleStartY + titleBlockHeight + 30}" fill="#ffffff" fill-opacity="0.8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="22" font-weight="400">${escapeXml(heroTagline)}</text>` : ""}

  <!-- Bottom bar: owner name -->
  <text x="80" y="585" fill="#ffffff" fill-opacity="0.7" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, monospace" font-size="14" font-weight="500">by ${escapeXml(ownerName)}</text>

  <!-- Bottom-right CTA pill -->
  <rect x="1040" y="560" width="80" height="32" rx="16" fill="#ffffff" />
  <text x="1080" y="581" text-anchor="middle" fill="#000000" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="600">View →</text>
</svg>`;

  // Render the SVG to PNG using sharp. PNG is universally supported by all
  // social platforms (Twitter, Facebook, Slack, LinkedIn, iMessage, etc.)
  // while SVG is not reliably rendered by many scrapers.
  let pngBuffer: Buffer;
  try {
    pngBuffer = await sharp(Buffer.from(svg)).resize(1200, 630).png().toBuffer();
  } catch (renderErr) {
    console.error("[og] sharp render failed, returning raw SVG", renderErr);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

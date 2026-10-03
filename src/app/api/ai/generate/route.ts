import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

type GenerateBody = {
  type?: "event" | "portfolio";
  prompt?: string;
  theme?: string;
  siteId?: string;
  section?: string; // "speakers" | "agenda" | "stats" | "sponsors" | "gallery" | "selected_work" | "about" | "services" | "contact"
};

const EVENT_SYSTEM = `You are an expert content designer for event landing pages. Given a free-text description of an event, produce a rich, accurate JSON object that will populate the site.

Respond with STRICT JSON ONLY. Do NOT wrap the answer in markdown fences. Do NOT add commentary before or after the JSON.

The JSON shape MUST be exactly:
{
  "category": string,
  "sectionLabels": {
    "speakers": string,
    "agenda": string,
    "sponsors": string,
    "stats": string,
    "gallery": string
  },
  "hero": {
    "title": string,
    "eyebrow": string,
    "tagline": string,
    "ctaPrimary": string,
    "ctaSecondary": string
  },
  "stats": [{ "value": string, "label": string }],
  "speakers": [{ "name": string, "role": string, "studio": string }],
  "agenda": [{ "time": string, "title": string, "track": string, "country": string, "city": string, "date": string }],
  "sponsors": [{ "name": string, "logo": string }],
  "gallery": [{ "src": string, "caption": string, "alt": string }]
}

Rules:
- "category" must be ONE of: "Conference", "Festival", "Workshop", "Meetup", "Exhibition", "Summit", "Retreat". Pick the closest match.
- "sectionLabels" lets you rename the section headers based on the event type. Pick audience-appropriate labels:
  - For a Conference/Summit: speakers="Speakers", agenda="Schedule", sponsors="Partners", stats="By the numbers", gallery="Highlights"
  - For a Festival (music/film/arts): speakers="Lineup" or "Artists" or "Directors", agenda="Schedule", sponsors="Partners", gallery="Moments" or "Past editions"
  - For a Workshop: speakers="Instructors" or "Hosts", agenda="Curriculum", sponsors="" (often none), gallery="Studio"
  - For a Meetup: speakers="Hosts", agenda="Agenda", sponsors="", gallery="From past meetups"
  - For an Exhibition: speakers="Featured Artists" or "Curators", agenda="Program", sponsors="Supporters", gallery="Installations"
  Use empty string "" when a section is empty/irrelevant.
- The "role" field inside speakers entries should match the event type: "Speaker" for conferences, "Artist"/"Performer"/"Headliner" for festivals, "Director"/"Filmmaker" for film festivals, "Instructor"/"Facilitator" for workshops, "Curator" for exhibitions, etc.
- All fields are required. Use empty strings or empty arrays when no info is available — never omit keys.
- "value" in stats is the big headline (e.g. "20+", "3 days"), "label" is the descriptor (e.g. "Speakers", "Workshops").
- "track" in agenda is a short label like "Keynote", "Workshop", "Panel", "Screening", "Set".
- For "gallery": produce 4-6 entries representing the kinds of photos that would showcase this event (e.g. "Keynote stage", "Workshop in progress", "Networking reception", "Closing night"). Leave "src" as an empty string (the user uploads their own images). "caption" is a 2-5 word description; "alt" is a short accessibility description of the imagined photo.
- All strings must be plain text (no markdown, no double quotes inside the value unless escaped).
- Make the content compelling and specific to the user's prompt. Invent plausible specifics (real-sounding names, plausible studios/labels) only when the prompt is vague.`;

const PORTFOLIO_SYSTEM = `You are an expert content designer for creative portfolio sites. Given a free-text description of a creative professional or studio, produce a rich, accurate JSON object that will populate the site.

Respond with STRICT JSON ONLY. Do NOT wrap the answer in markdown fences. Do NOT add commentary before or after the JSON.

The JSON shape MUST be exactly:
{
  "sectionLabels": {
    "selected_work": string,
    "about": string,
    "services": string,
    "contact": string,
    "gallery": string
  },
  "hero": {
    "title": string,
    "eyebrow": string,
    "tagline": string,
    "ctaPrimary": string,
    "ctaSecondary": string
  },
  "selected_work": [
    {
      "title": string,
      "client": string,
      "year": string,
      "description": string,
      "tag": string
    }
  ],
  "about": {
    "body": string,
    "highlights": [string]
  },
  "services": [{ "name": string, "description": string }],
  "contact": {
    "email": string,
    "phone": string,
    "location": string,
    "socials": [{ "platform": string, "handle": string, "url": string }]
  },
  "gallery": [{ "src": string, "caption": string, "alt": string }]
}

Rules:
- "sectionLabels" lets you rename section headers based on the portfolio type:
  - For a designer/studio: selected_work="Selected work", about="About", services="Services", contact="Contact", gallery="Studio"
  - For a photographer: selected_work="Series", about="About", services="Prints & Licensing", contact="Get in touch", gallery="Portfolio"
  - For an illustrator: selected_work="Portfolio", about="Bio", services="Commissions", contact="Contact", gallery="Sketchbook"
  - For a developer: selected_work="Projects", about="About", services="Capabilities", contact="Contact", gallery="Showcase"
  Use empty string "" when a section is empty/irrelevant.
- All fields are required. Use empty strings or empty arrays when no info is available — never omit keys.
- For "gallery": produce 4-6 entries representing showcase images that would suit this portfolio (e.g. "Brand identity in situ", "Editorial spread", "Type detail", "Packaging shot"). Leave "src" as an empty string (the user uploads their own images). "caption" is a 2-5 word label; "alt" is a short accessibility description of the imagined photo.
- All strings must be plain text (no markdown, no double quotes inside values unless escaped).
- Make the content compelling and specific to the user's prompt. Invent plausible specifics (real-sounding client names, plausible years) only when the prompt is vague.`;

function stripFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  }
  return t;
}

/**
 * Attempt to repair common LLM JSON mistakes:
 * - Missing colon + missing closing quote:  "key "value" → "key": "value"
 * - Missing colon only:                      "key" "value" → "key": "value"
 * - Trailing commas:                         ...,} or ...,] → clean
 * - Smart quotes:                            ' or ' or " → straight "
 */
function repairJson(raw: string): string {
  let t = raw;
  // Convert smart quotes to straight quotes
  t = t.replace(/\u201C/g, '"').replace(/\u201D/g, '"').replace(/\u2018/g, "'").replace(/\u2019/g, "'");
  // Fix "key "value"  →  "key": "value"  (missing closing quote of key + missing colon)
  // Must come first so we don't accidentally match the "key" "value" case below.
  t = t.replace(/"([A-Za-z_][A-Za-z0-9_]*)\s+"/g, '"$1": "');
  // Fix "key"  "value"  →  "key": "value"  (missing colon only, both quotes present)
  t = t.replace(/"([A-Za-z_][A-Za-z0-9_]*)"\s+"/g, '"$1": "');
  // Strip trailing commas before } or ]
  t = t.replace(/,(\s*[}\]])/g, "$1");
  return t;
}

function tryParse(raw: string): unknown | null {
  const cleaned = stripFences(raw);
  // Direct parse
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try the outermost object slice
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = cleaned.slice(start, end + 1);
      try {
        return JSON.parse(slice);
      } catch {
        // Try the repaired version
        try {
          return JSON.parse(repairJson(slice));
        } catch {
          /* fall through */
        }
      }
    }
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();

    const body = (await req.json().catch(() => null)) as GenerateBody | null;
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const type = body.type;
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    if (type !== "event" && type !== "portfolio") {
      return NextResponse.json(
        { error: "type must be 'event' or 'portfolio'" },
        { status: 400 },
      );
    }

    const section = typeof body.section === "string" ? body.section.trim() : "";

    // For full-content generation, prompt is required. For section-scoped
    // regeneration, we can derive context from the existing site content.
    if (!prompt && !section) {
      return NextResponse.json(
        { error: "prompt is required (or provide 'section' for scoped regeneration)" },
        { status: 400 },
      );
    }

    // Load the existing site content if we're doing section-scoped regeneration
    let existingContent: Record<string, unknown> = {};
    let existingTitle = "";
    if (section && body.siteId) {
      const existing = await db.site.findUnique({
        where: { id: body.siteId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Site not found for siteId" },
          { status: 404 },
        );
      }
      if (existing.userId !== user.id && user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }
      try {
        existingContent = JSON.parse(existing.content);
      } catch {
        existingContent = {};
      }
      existingTitle = existing.title;
    }

    const zai = await ZAI.create();

    // Build the system + user messages based on whether this is full or section-scoped
    let systemPrompt: string;
    let userMessage: string;

    if (section) {
      // Section-scoped regeneration: ask the LLM for just that one section
      const heroTitle = (existingContent.hero as { title?: string } | undefined)?.title ?? existingTitle;
      const heroEyebrow = (existingContent.hero as { eyebrow?: string } | undefined)?.eyebrow ?? "";
      const heroTagline = (existingContent.hero as { tagline?: string } | undefined)?.tagline ?? "";
      const context = `Event title: "${heroTitle}". Eyebrow: "${heroEyebrow}". Tagline: "${heroTagline}".`;

      const sectionDefs: Record<string, { shape: string; instruction: string }> = type === "event"
        ? {
            speakers: { shape: '[{ "name": string, "role": string, "studio": string }]', instruction: "3-6 plausible people relevant to the event type. Role should match the event type (Speaker/Artist/Instructor/Director/Curator)." },
            agenda: { shape: '[{ "time": string, "title": string, "track": string, "country": string, "city": string, "date": string }]', instruction: "4-8 time-slot entries. Times like '10:00', '14:30'. Track is a short label like 'Main stage', 'Workshop', 'Screening'. Country should be an African country name. City is the city name. Date is like 'Mar 14' or '2025-03-14'." },
            stats: { shape: '[{ "value": string, "label": string }]', instruction: "3-4 stat pairs. Value is the big number (e.g. '20+', '3 days'), label is the descriptor." },
            sponsors: { shape: '[{ "name": string, "logo": string }]', instruction: "4-8 plausible sponsor/partner names. Logo should be an empty string (users upload their own)." },
            gallery: { shape: '[{ "src": string, "caption": string, "alt": string }]', instruction: "4-6 entries describing the kinds of photos that would showcase this event. Leave src empty. caption is 2-5 words (e.g. 'Keynote stage', 'Workshop in progress'). alt is a short accessibility description of the imagined photo." },
          }
        : {
            selected_work: { shape: '[{ "title": string, "client": string, "year": string, "description": string, "tag": string }]', instruction: "3-5 case-study entries. Year is a 4-digit string. Tag is a short category like 'Brand', 'Editorial', 'Identity'." },
            services: { shape: '[{ "name": string, "description": string }]', instruction: "3-5 services with a name and one-sentence description." },
            about: { shape: '{ "body": string, "highlights": [string] }', instruction: "A 2-3 sentence narrative body + 3-5 highlight strings." },
            contact: { shape: '{ "email": string, "phone": string, "location": string, "socials": [{ "platform": string, "handle": string, "url": string }] }', instruction: "Contact details. Socials should include the platform name, handle, and full URL (e.g. https://instagram.com/user). Email and phone can be empty strings if not known." },
            gallery: { shape: '[{ "src": string, "caption": string, "alt": string }]', instruction: "4-6 entries representing showcase images that would suit this portfolio (e.g. 'Brand identity in situ', 'Editorial spread', 'Type detail'). Leave src empty. caption is 2-5 words. alt is a short accessibility description of the imagined photo." },
          };

      const def = sectionDefs[section];
      if (!def) {
        return NextResponse.json(
          { error: `Unknown section: ${section}. Valid: ${Object.keys(sectionDefs).join(", ")}` },
          { status: 400 },
        );
      }

      systemPrompt = `You are an expert content designer. Generate ONLY the "${section}" section for an existing ${type} site. Context: ${context}

Respond with STRICT JSON ONLY. No markdown fences, no commentary.
The JSON shape must be exactly: ${def.shape}
${def.instruction}
All strings must be plain text. Make the content specific and compelling.`;
      userMessage = prompt || `Regenerate the ${section} section for this ${type}.`;
    } else {
      systemPrompt = type === "event" ? EVENT_SYSTEM : PORTFOLIO_SYSTEM;
      userMessage = prompt;
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      thinking: { type: "disabled" },
    });

    const rawText =
      completion?.choices?.[0]?.message?.content ?? "";

    const parsed = tryParse(rawText);
    if (!parsed || typeof parsed !== "object") {
      console.error(
        "[ai/generate] Failed to parse model output. Raw:",
        rawText.slice(0, 1000),
      );
      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
          raw: rawText,
        },
        { status: 500 },
      );
    }

    let site: unknown = undefined;
    let mergedContent: unknown = parsed;

    if (body.siteId) {
      const existing = await db.site.findUnique({
        where: { id: body.siteId },
      });
      if (!existing) {
        return NextResponse.json(
          { error: "Site not found for siteId" },
          { status: 404 },
        );
      }
      if (existing.userId !== user.id && user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }

      // For section-scoped regeneration, merge the new section into the existing content
      if (section) {
        try {
          const base = JSON.parse(existing.content);
          mergedContent = { ...base, [section]: parsed };
        } catch {
          mergedContent = { [section]: parsed };
        }
      } else {
        mergedContent = parsed;
      }

      const updated = await db.site.update({
        where: { id: body.siteId },
        data: {
          content: JSON.stringify(mergedContent),
          theme: body.theme ?? existing.theme,
        },
      });
      site = updated;
    }

    return NextResponse.json({
      content: mergedContent,
      section: section || undefined,
      ...(site ? { site } : {}),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    console.error("[ai/generate]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

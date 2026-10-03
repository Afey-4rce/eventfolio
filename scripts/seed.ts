import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const TEMPLATES: Array<{
  name: string;
  type: "event" | "portfolio";
  category: string;
  description: string;
  thumbnail: string;
  theme: string;
  preview: Record<string, unknown>;
}> = [
  {
    name: "Summit Conference",
    type: "event",
    category: "Conference",
    description: "A bold, high-energy conference landing page with speaker grid and agenda timeline.",
    thumbnail: "linear-gradient(135deg,#fb923c 0%,#db2777 100%)",
    theme: "sunset",
    preview: {
      sections: ["hero", "stats", "speakers", "agenda", "sponsors", "register"],
    },
  },
  {
    name: "Workshop Lab",
    type: "event",
    category: "Workshop",
    description: "Hands-on workshop page with curriculum modules, instructor card, and seat limits.",
    thumbnail: "linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)",
    theme: "mint",
    preview: {
      sections: ["hero", "curriculum", "instructor", "logistics", "register"],
    },
  },
  {
    name: "Festival After Dark",
    type: "event",
    category: "Festival",
    description: "Immersive festival page with lineup, stages, and ticketing tiers.",
    thumbnail: "linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)",
    theme: "aurora",
    preview: {
      sections: ["hero", "lineup", "stages", "tickets", "faq"],
    },
  },
  {
    name: "Designer Folio",
    type: "portfolio",
    category: "Designer",
    description: "Minimal folio for designers with case-study cards and an about narrative.",
    thumbnail: "linear-gradient(135deg,#171717 0%,#525252 100%)",
    theme: "noir",
    preview: {
      sections: ["hero", "selected_work", "about", "contact"],
    },
  },
  {
    name: "Photographer Showcase",
    type: "portfolio",
    category: "Photographer",
    description: "Visual-first portfolio with full-bleed gallery and project stories.",
    thumbnail: "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
    theme: "crimson",
    preview: {
      sections: ["hero", "gallery", "series", "about", "contact"],
    },
  },
  {
    name: "Studio Index",
    type: "portfolio",
    category: "Studio",
    description: "Studio index with services, process, and a curated work reel.",
    thumbnail: "linear-gradient(135deg,#0ea5e9 0%,#22c55e 100%)",
    theme: "mint",
    preview: {
      sections: ["hero", "services", "work", "process", "team", "contact"],
    },
  },
];

async function main() {
  // Admin user
  const adminEmail = "admin@eventfolio.app";
  const existing = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await db.user.create({
      data: {
        email: adminEmail,
        name: "EventFolio Admin",
        passwordHash: hashPassword("admin12345"),
        role: "admin",
        plan: "studio",
        bio: "Keeper of the EventFolio realm.",
      },
    });
    console.log("✓ Created admin user — admin@eventfolio.app / admin12345");
  } else {
    console.log("• Admin user already exists");
  }

  // Templates
  for (const tpl of TEMPLATES) {
    const found = await db.template.findFirst({ where: { name: tpl.name } });
    if (!found) {
      await db.template.create({
        data: {
          name: tpl.name,
          type: tpl.type,
          category: tpl.category,
          description: tpl.description,
          thumbnail: tpl.thumbnail,
          theme: tpl.theme,
          preview: JSON.stringify(tpl.preview),
          popularity: Math.floor(Math.random() * 800) + 100,
        },
      });
      console.log(`✓ Created template: ${tpl.name}`);
    } else {
      console.log(`• Template exists: ${tpl.name}`);
    }
  }

  // Demo user with sample sites
  const demoEmail = "demo@eventfolio.app";
  let demoUser = await db.user.findUnique({ where: { email: demoEmail } });
  if (!demoUser) {
    demoUser = await db.user.create({
      data: {
        email: demoEmail,
        name: "Maya Lin",
        passwordHash: hashPassword("demo12345"),
        role: "user",
        plan: "pro",
        bio: "Independent designer & event curator based in Lisbon.",
        avatarUrl: null,
      },
    });
    console.log("✓ Created demo user — demo@eventfolio.app / demo12345");
  } else {
    console.log("• Demo user exists");
  }

  // Demo site
  const demoSlug = "design-fringe-2025";
  const demoSiteExists = await db.site.findFirst({ where: { slug: demoSlug } });
  if (!demoSiteExists) {
    await db.site.create({
      data: {
        userId: demoUser.id,
        type: "event",
        title: "Design Fringe 2025",
        slug: demoSlug,
        subtitle: "A 3-day festival on the edges of contemporary design.",
        description:
          "Design Fringe returns to Lisbon for its 4th edition — a meeting of independent studios, type designers, and material researchers.",
        theme: "aurora",
        coverImage:
          "https://images.unsplash.com/photo-1505374998124-4b2b3c4c4c8a?auto=format&fit=crop&w=1200&q=80",
        published: true,
        views: 1842,
        likes: 134,
        content: JSON.stringify({
          hero: {
            title: "Design Fringe 2025",
            eyebrow: "Mar 14 — 16 · Lisbon",
            tagline: "A 3-day festival on the edges of contemporary design.",
            ctaPrimary: "Reserve your seat",
            ctaSecondary: "See the lineup",
          },
          stats: [
            { value: "32", label: "Studios" },
            { value: "12", label: "Talks" },
            { value: "6", label: "Workshops" },
            { value: "1.4k", label: "Attendees" },
          ],
          speakers: [
            { name: "Aria Volk", role: "Type Designer", studio: "Volk Studio" },
            { name: "Hiro Tanaka", role: "Material Researcher", studio: "Mori Lab" },
            { name: "Lena Korhonen", role: "Brand Director", studio: "North Field" },
          ],
          agenda: [
            { time: "10:00", title: "Opening keynote — The Edges", track: "Main stage" },
            { time: "11:30", title: "Workshop — Risograph for type", track: "Studio 1" },
            { time: "14:00", title: "Panel — Material futures", track: "Main stage" },
          ],
          sponsors: ["Volk", "Mori", "North Field", "Atelier 9", "Fringe Co.", "Lisbo Type"],
        }),
      },
    });
    console.log("✓ Created demo event site");
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

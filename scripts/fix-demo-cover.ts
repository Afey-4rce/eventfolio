import { db } from "@/lib/db";

/**
 * Clear the broken coverImage URL on the demo Design Fringe 2025 site so the
 * gradient cover renders cleanly (the previous URL pointed at a non-existent
 * Unsplash photo). Run with: bun scripts/fix-demo-cover.ts
 */
async function main() {
  const site = await db.site.findFirst({ where: { slug: "design-fringe-2025" } });
  if (!site) {
    console.log("✗ Demo site not found");
    return;
  }
  await db.site.update({
    where: { id: site.id },
    data: { coverImage: null },
  });
  console.log(`✓ Cleared coverImage on ${site.slug} (${site.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

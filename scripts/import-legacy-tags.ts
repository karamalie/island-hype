// scripts/import-legacy-tags.ts
//
// Turns the old Experience rows into filter categories.
//
// Production had eight Experiences — Diving, Honeymoon, Snorkeling, Water Sports,
// Wellness & Spa, Family, Local Culture, Sunset Cruise — and thirteen rows
// linking them to packages. Experiences were dropped from the site, but that list
// is not a feature: it is the client's own categorisation of their catalogue, and
// the new Tag model is the same concept under a different name.
//
// So rather than migrate to a schema seeded with four invented tags and ask staff
// to re-tag everything by hand, this restores what they already had. The mapping
// was exported from the verified production backup before the migration dropped
// the tables (scripts/data/legacy-experience-tags.json).
//
// Idempotent: tags are matched on slug and links are skipped when they exist, so
// running it twice changes nothing.
//
// Run with: npm run db:import-legacy-tags

import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Payload {
  tags: { name: string; slug: string; sortOrder: number }[];
  links: { tagSlug: string; packageSlug: string }[];
}

async function main() {
  const file = path.join(process.cwd(), "scripts", "data", "legacy-experience-tags.json");
  const payload: Payload = JSON.parse(readFileSync(file, "utf8"));

  let created = 0;
  let linked = 0;
  let skippedLinks = 0;

  // sortOrder was 0 for every Experience, so the original order is not
  // recoverable. Alphabetical is a defensible default and staff can reorder them
  // on the Filter categories screen.
  const tags = [...payload.tags].sort((a, b) => a.name.localeCompare(b.name));

  for (const [i, t] of tags.entries()) {
    const existing = await prisma.tag.findUnique({ where: { slug: t.slug } });
    if (existing) continue;
    await prisma.tag.create({
      data: { name: t.name, slug: t.slug, sortOrder: i },
    });
    created++;
  }

  for (const l of payload.links) {
    const tag = await prisma.tag.findUnique({ where: { slug: l.tagSlug } });
    const pkg = await prisma.package.findUnique({ where: { slug: l.packageSlug } });
    if (!tag || !pkg) {
      // A package renamed or removed since the export. Worth reporting rather
      // than silently dropping: it tells whoever runs this that the catalogue
      // moved on.
      console.warn(
        `  ! skipped ${l.tagSlug} -> ${l.packageSlug} (${!tag ? "tag" : "package"} not found)`
      );
      skippedLinks++;
      continue;
    }
    const already = await prisma.packageTag.findUnique({
      where: { packageId_tagId: { packageId: pkg.id, tagId: tag.id } },
    });
    if (already) continue;
    await prisma.packageTag.create({
      data: { packageId: pkg.id, tagId: tag.id },
    });
    linked++;
  }

  const total = await prisma.tag.count();
  const totalLinks = await prisma.packageTag.count();
  console.log(`  categories created   ${created}`);
  console.log(`  package links made   ${linked}`);
  if (skippedLinks) console.log(`  links skipped        ${skippedLinks}`);
  console.log(`  categories now       ${total}`);
  console.log(`  package links now    ${totalLinks}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

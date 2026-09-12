// scripts/seed-stay-types.ts
//
// The five kinds of night, and which islands offer each.
//
// This exists because there was no reproducible way to create them. The five
// StayType rows in the development database were made by hand during
// implementation and no script or seed file produced them — so a fresh database,
// production included, had none. The /accommodations page opens with "Five kinds
// of night. Decide this before you pick an island", and with an empty StayType
// table that section renders nothing, taking the page's whole argument with it.
//
// The content is editorial rather than derived — price bands and the wording of
// each kind of night are business decisions — so it lives in
// scripts/data/stay-types.json rather than being generated. Staff can edit any of
// it afterwards from the island pages; this only establishes the baseline.
//
// Idempotent: matched on slug, and per-island overrides are only written when the
// link does not already exist, so re-running never overwrites an edit someone has
// made in admin.
//
// Run with: npm run db:seed-stay-types

import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Payload {
  stayTypes: {
    name: string;
    slug: string;
    band: string;
    blurb: string;
    nightlyFrom: number | null;
    sortOrder: number;
    isActive: boolean;
  }[];
  links: {
    locationSlug: string;
    stayTypeSlug: string;
    blurb: string | null;
    nightlyFrom: number | null;
    sortOrder: number;
  }[];
}

async function main() {
  const file = path.join(process.cwd(), "scripts", "data", "stay-types.json");
  const payload: Payload = JSON.parse(readFileSync(file, "utf8"));

  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const s of payload.stayTypes) {
    const existing = await prisma.stayType.findUnique({ where: { slug: s.slug } });
    if (existing) continue;
    await prisma.stayType.create({
      data: {
        name: s.name,
        slug: s.slug,
        band: s.band,
        blurb: s.blurb,
        nightlyFrom: s.nightlyFrom,
        sortOrder: s.sortOrder,
        isActive: s.isActive,
      },
    });
    created++;
  }

  for (const l of payload.links) {
    const location = await prisma.location.findUnique({
      where: { slug: l.locationSlug },
    });
    const stayType = await prisma.stayType.findUnique({
      where: { slug: l.stayTypeSlug },
    });
    if (!location || !stayType) {
      console.warn(
        `  ! skipped ${l.locationSlug} / ${l.stayTypeSlug} (${!location ? "island" : "stay type"} not found)`
      );
      skipped++;
      continue;
    }
    const already = await prisma.locationStayType.findUnique({
      where: {
        locationId_stayTypeId: {
          locationId: location.id,
          stayTypeId: stayType.id,
        },
      },
    });
    if (already) continue;
    await prisma.locationStayType.create({
      data: {
        locationId: location.id,
        stayTypeId: stayType.id,
        blurb: l.blurb,
        nightlyFrom: l.nightlyFrom,
        sortOrder: l.sortOrder,
      },
    });
    linked++;
  }

  console.log(`  stay types created   ${created}`);
  console.log(`  island links made    ${linked}`);
  if (skipped) console.log(`  links skipped        ${skipped}`);
  console.log(`  stay types now       ${await prisma.stayType.count()}`);
  console.log(`  island links now     ${await prisma.locationStayType.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

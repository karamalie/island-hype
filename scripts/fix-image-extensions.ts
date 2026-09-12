// scripts/fix-image-extensions.ts
//
// The media tree had eleven files whose extension lied — WebP and PNG bytes
// inside .jpg names. `npm run images:build` renames them to match their real
// format; this points the database at the new names.
//
// Browsers sniff content and render these regardless, so nothing looked broken.
// nginx does not: it serves them with a Content-Type taken from the extension,
// which is wrong, and caches under that wrong type.
//
// Idempotent. Run after images:build, then again on production after the media
// tree is synced.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Manifest = Record<string, { widths: number[]; ext: string }>;

async function main() {
  const manifest: Manifest = JSON.parse(
    await readFile(path.join(process.cwd(), "lib", "design", "image-manifest.json"), "utf8")
  );

  /** bucket -> { oldFilename -> newFilename } for anything whose stem matches. */
  const byBucket = new Map<string, Map<string, string>>();
  for (const key of Object.keys(manifest)) {
    const [bucket, ...rest] = key.split("/");
    const file = rest.join("/");
    const stem = file.replace(/\.[^.]+$/, "");
    if (!byBucket.has(bucket)) byBucket.set(bucket, new Map());
    // Register every extension the DB might be holding for this stem.
    for (const ext of ["jpg", "jpeg", "png", "webp"]) {
      byBucket.get(bucket)!.set(`${stem}.${ext}`, file);
    }
  }

  const fix = (bucket: string, value: string | null): string | null => {
    if (!value) return value;
    const mapped = byBucket.get(bucket)?.get(value);
    return mapped && mapped !== value ? mapped : value;
  };

  let changed = 0;

  for (const row of await db.location.findMany()) {
    const next = fix("locations", row.coverImage);
    if (next !== row.coverImage) {
      await db.location.update({ where: { id: row.id }, data: { coverImage: next } });
      console.log(`  location     ${row.coverImage} -> ${next}`);
      changed++;
    }
  }

  for (const row of await db.accommodation.findMany()) {
    const next = fix("accommodations", row.coverImage);
    if (next !== row.coverImage) {
      await db.accommodation.update({ where: { id: row.id }, data: { coverImage: next } });
      console.log(`  stay         ${row.coverImage} -> ${next}`);
      changed++;
    }
  }

  for (const row of await db.package.findMany()) {
    const next = fix("packages", row.coverImage);
    if (next !== row.coverImage) {
      await db.package.update({ where: { id: row.id }, data: { coverImage: next } });
      console.log(`  package      ${row.coverImage} -> ${next}`);
      changed++;
    }
  }

  for (const row of await db.activity.findMany()) {
    const next = fix("activities", row.coverImage);
    if (next !== row.coverImage) {
      await db.activity.update({ where: { id: row.id }, data: { coverImage: next } });
      console.log(`  activity     ${row.coverImage} -> ${next}`);
      changed++;
    }
  }

  console.log(changed === 0 ? "  nothing to change" : `  ${changed} reference(s) corrected`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});

// scripts/build-image-derivatives.ts
//
// Generates correctly-sized WebP copies of every source image, and writes a
// manifest the app uses to emit a srcset.
//
// Why this exists rather than Next's image optimiser: next.config.ts sets
// `images: { unoptimized: true }`, deliberately, because the production box has
// 1 GB of RAM and resizing images on demand is exactly the kind of work it cannot
// afford. The consequence was that every page shipped the full-size original —
// /locations came to 2.1 MB, 1.4 MB of it one hero — and the 1920px files still
// looked soft on a retina screen because there was nothing larger to offer.
//
// Pre-generating derivatives fixes both halves: the browser picks a width that
// suits its viewport and pixel density, and the server does no work at all.
//
// It also corrects the four files whose extension lies — they are WebP inside a
// .jpg name, which browsers sniff and render but nginx mislabels.
//
// Run with: npm run images:build

import { createHash } from "node:crypto";
import { mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

/** Where the media lives in development. Production syncs the same tree. */
const MEDIA_ROOT = path.join(
  process.cwd(),
  "public",
  "storage",
  "v1",
  "object",
  "public"
);

const MANIFEST = path.join(process.cwd(), "lib", "design", "image-manifest.json");

/**
 * The widths worth generating. Chosen from the layout rather than by convention:
 *
 *   480   a phone card or a one-up tile
 *   768   a phone hero at 2x, or a two-up card
 *   1200  a desktop card, a portrait editorial frame
 *   1920  a full-bleed band on a standard display
 *   2560  the same band on a retina display
 *
 * A derivative is only written when the source is at least that wide — upscaling
 * would add bytes and no detail.
 */
const WIDTHS = [480, 768, 1200, 1920, 2560];

const QUALITY = 78;

type Manifest = Record<string, { widths: number[]; ext: string }>;

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/** Derivatives are named `<stem>@<width>.webp` next to their source. */
function derivativeName(stem: string, width: number) {
  return `${stem}@${width}.webp`;
}

async function actualFormat(file: string): Promise<string | null> {
  try {
    return (await sharp(file).metadata()).format ?? null;
  } catch {
    return null;
  }
}

async function main() {
  if (!existsSync(MEDIA_ROOT)) {
    console.error(`No media at ${MEDIA_ROOT}. Pull it from the server first.`);
    process.exit(1);
  }

  const manifest: Manifest = {};
  const renames: [string, string][] = [];
  let written = 0;
  let sourceBytes = 0;
  let derivedBytes = 0;

  for await (const file of walk(MEDIA_ROOT)) {
    const ext = path.extname(file).toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;
    // Skip the derivatives themselves on a re-run.
    if (path.basename(file).includes("@")) continue;

    const format = await actualFormat(file);
    if (!format) {
      console.warn(`  ! not an image, skipping: ${path.relative(MEDIA_ROOT, file)}`);
      continue;
    }

    // The extension lies on four files. Fix it rather than leave nginx serving
    // WebP bytes labelled image/jpeg.
    let current = file;
    const claimed = ext.replace(".", "").replace("jpeg", "jpg");
    const real = format.replace("jpeg", "jpg");
    if (claimed !== real) {
      const fixed = file.replace(/\.[^.]+$/, `.${real}`);
      renames.push([path.relative(MEDIA_ROOT, file), path.relative(MEDIA_ROOT, fixed)]);
      await rename(file, fixed);
      current = fixed;
    }

    const rel = path.relative(MEDIA_ROOT, current).split(path.sep).join("/");
    const image = sharp(current);
    const meta = await image.metadata();
    const sourceWidth = meta.width ?? 0;
    sourceBytes += (await stat(current)).size;

    const stem = current.replace(/\.[^.]+$/, "");
    const widths = WIDTHS.filter((w) => w <= sourceWidth);
    // A small source still gets one derivative at its own width, so every image
    // has a WebP the browser can prefer.
    if (widths.length === 0 && sourceWidth > 0) widths.push(sourceWidth);

    for (const w of widths) {
      const out = derivativeName(stem, w);
      await sharp(current)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      derivedBytes += (await stat(out)).size;
      written++;
    }

    manifest[rel] = { widths, ext: real };
  }

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  // Sort by rebuilding the object, not via stringify's second argument — that
  // parameter is a replacer/allow-list, and passing key names there silently
  // strips every nested field, which is exactly the bug this comment replaces.
  const sorted: Manifest = {};
  for (const key of Object.keys(manifest).sort()) sorted[key] = manifest[key];
  const json = JSON.stringify(sorted, null, 2) + "\n";
  await writeFile(MANIFEST, json);

  console.log(`  sources          ${Object.keys(manifest).length}`);
  console.log(`  derivatives      ${written}`);
  console.log(`  source bytes     ${(sourceBytes / 1048576).toFixed(1)} MB`);
  console.log(`  derivative bytes ${(derivedBytes / 1048576).toFixed(1)} MB`);
  if (renames.length) {
    console.log(`  corrected extensions:`);
    for (const [from, to] of renames) console.log(`    ${from}  ->  ${to}`);
  }
  console.log(
    `  manifest         ${path.relative(process.cwd(), MANIFEST)} (${createHash("sha1").update(json).digest("hex").slice(0, 8)})`
  );
  if (renames.length) {
    console.log(
      "\n  Renamed files are referenced in the database — run scripts/fix-image-extensions.ts next."
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// scripts/build-logo-assets.ts
//
// Turns the supplied logo into web assets. Run with: npm run brand:build
//
// SOURCE. black-bg-logo-islandhype.JPG, not the "Gold Transparent" PDF, and
// deliberately so. macOS ships no usable PDF converter on this machine: Quick
// Look flattens the PDF onto opaque white, and sips renders a white backing box
// behind the artwork, so neither gives real transparency. The JPG is 1280x1280
// and — more usefully — its gold is FLAT rather than the PDF's gradient, which
// means it keys off the near-black background cleanly.
//
// THE CUT-OUT, and why it does not fringe. Alpha comes from luminance, then the
// output RGB is set to a constant. Because every output pixel is the same colour
// and only alpha varies, an anti-aliased edge becomes a partially transparent
// edge of that one colour. There is no dark halo — which is the usual failure
// when you key a logo off a dark background and keep the original pixels.
//
// THE LOGO STAYS GOLD. #AC9A74, measured from the source. It is 6.24:1 on the
// ink-900 footer and 2.75:1 on white; the latter is below the 3:1 WCAG asks of
// graphics, but a logotype is explicitly exempt from contrast minimums, and the
// answer to a gold mark on a bright photograph is to give it a ground rather
// than to recolour the brand. Hence the variants below.
//
// WHAT IS EMITTED, and which to use where:
//
//   *-gold.*            transparent. THE PRIMARY ASSET. Use this inside a CSS
//                       pill or on any known dark ground — the pill stays crisp
//                       vector-sharp at any size and any radius, which a baked
//                       background cannot do.
//   *-on-white.*        gold over #FFFFFF, baked. For contexts that cannot do
//                       transparency or CSS: email, social cards, print.
//   *-on-ink.*          gold over #1C1B1B, the site's own ink. Same reason.
//
//   island-hype-logo-*      the full stacked lockup: mark, ISLAND HYPE, MALDIVES.
//   island-hype-wordmark-*  the words alone, horizontal. The lockup is aspect
//                           1.67, so at a height that fits a 72px nav bar the
//                           words would be ~8px tall and unreadable. The wordmark
//                           is aspect ~6 and sits in a nav properly.
//   island-hype-mark-*      the circular sun-and-waves alone, square, for
//                           favicons and any small square slot.

import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const SOURCE = path.join(os.homedir(), "Downloads", "black-bg-logo-islandhype.JPG");
const OUT_DIR = path.join(process.cwd(), "public", "brand");

/** Measured from the source. The brand gold; nothing here recolours it. */
const GOLD = { r: 0xac, g: 0x9a, b: 0x74 };
/** The site's ink-900, so a baked dark variant matches the real footer ground. */
const INK = { r: 0x1c, g: 0x1b, b: 0x1b };
const WHITE = { r: 0xff, g: 0xff, b: 0xff };

const srgb = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const lum = (r: number, g: number, b: number) =>
  0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);

type RGB = { r: number; g: number; b: number };

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Source not found: ${SOURCE}`);
    process.exit(1);
  }
  await mkdir(OUT_DIR, { recursive: true });

  const { data, info } = await sharp(SOURCE).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;

  // Normalising by the gold's own luminance is what makes solid gold land at
  // alpha 255 rather than at whatever its luminance happens to be.
  const BG_LUM = 0.002;
  const GOLD_LUM = lum(GOLD.r, GOLD.g, GOLD.b);

  // The JPEG's background is not exactly black, so a straight luminance mask
  // leaves a faint wash of alpha across the entire frame — measured at a uniform
  // 3/255, covering 88% of the pixels. On a dark ground that reads as a visible
  // lighter rectangle around the logo, which is exactly what it looked like.
  //
  // So the mask gets a floor. Measured: the background sits at alpha 3 (p99 = 3,
  // max = 3) and genuine anti-aliased edges begin at 6, so anything at or below
  // 5 is noise. The remainder is rescaled from that floor rather than clipped, so
  // solid gold still lands at 255 and the soft ray tips keep their gradation.
  const NOISE_FLOOR = 5;
  const alpha = new Uint8Array(W * H);
  for (let i = 0, p = 0; p < W * H; p++, i += C) {
    const t = (lum(data[i], data[i + 1], data[i + 2]) - BG_LUM) / (GOLD_LUM - BG_LUM);
    const raw = Math.max(0, Math.min(255, Math.round(t * 255)));
    alpha[p] =
      raw <= NOISE_FLOOR
        ? 0
        : Math.round(((raw - NOISE_FLOOR) / (255 - NOISE_FLOOR)) * 255);
  }

  // Crop to the artwork. The threshold keeps the soft outer tips of the rays;
  // anything at or below it is JPEG noise in the background.
  const THRESHOLD = 12;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (alpha[y * W + x] > THRESHOLD) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) {
    console.error("Found no artwork — is that the expected source image?");
    process.exit(1);
  }
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.02);
  x0 = Math.max(0, x0 - pad);
  y0 = Math.max(0, y0 - pad);
  x1 = Math.min(W - 1, x1 + pad);
  y1 = Math.min(H - 1, y1 + pad);
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;

  console.log(`  source            ${W}x${H}`);
  console.log(`  artwork           ${cw}x${ch} at (${x0},${y0})`);

  /** The mark/wordmark split, found by scanning for the blank rows between them. */
  const rowHas: boolean[] = [];
  for (let y = 0; y < ch; y++) {
    let any = false;
    for (let x = 0; x < cw; x++) {
      if (alpha[(y + y0) * W + (x + x0)] > THRESHOLD) { any = true; break; }
    }
    rowHas.push(any);
  }
  let gapStart = -1, gapLen = 0, bestStart = -1, bestLen = 0;
  for (let y = 0; y < ch; y++) {
    if (!rowHas[y]) {
      if (gapStart < 0) { gapStart = y; gapLen = 0; }
      gapLen++;
      if (gapLen > bestLen) { bestLen = gapLen; bestStart = gapStart; }
    } else { gapStart = -1; gapLen = 0; }
  }
  const splitAt = bestLen > 0 ? bestStart + Math.floor(bestLen / 2) : Math.round(ch * 0.56);
  console.log(`  mark/word split   y ${splitAt} (gap ${bestLen}px)`);

  /**
   * One band of the artwork, as gold, in three grounds and two widths.
   * `ground: null` means transparent.
   */
  async function emitBand(name: string, from: number, to: number, widths: number[]) {
    const bh = to - from;
    const rgba = Buffer.alloc(cw * bh * 4);
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < cw; x++) {
        const a = alpha[(y + from + y0) * W + (x + x0)];
        const o = (y * cw + x) * 4;
        rgba[o] = GOLD.r; rgba[o + 1] = GOLD.g; rgba[o + 2] = GOLD.b; rgba[o + 3] = a;
      }
    }
    // Trim so each band is tight to its own ink, not to the lockup's box.
    const trimmed = await sharp(rgba, { raw: { width: cw, height: bh, channels: 4 } })
      .trim({ threshold: 1 })
      .png()
      .toBuffer({ resolveWithObject: true });

    const grounds: [string, RGB | null][] = [
      ["", null],
      ["-on-white", WHITE],
      ["-on-ink", INK],
    ];

    for (const [suffix, ground] of grounds) {
      for (const w of widths) {
        // Baked grounds get padding so the logo is not flush to the edge; the
        // transparent one must not, or it cannot be positioned precisely.
        const padPx = ground ? Math.round(w * 0.06) : 0;
        let img = sharp(trimmed.data).resize({ width: w - padPx * 2 });
        if (ground) {
          img = img.extend({
            top: padPx, bottom: padPx, left: padPx, right: padPx,
            background: { ...ground, alpha: 1 },
          }).flatten({ background: ground });
        }
        const buf = await img.png({ compressionLevel: 9 }).toBuffer();
        await writeFile(path.join(OUT_DIR, `${name}${suffix}-${w}.png`), buf);
        await sharp(buf).webp({ quality: 92, alphaQuality: 100 })
          .toFile(path.join(OUT_DIR, `${name}${suffix}-${w}.webp`));
      }
    }
    // Archival master, transparent, full size.
    await writeFile(path.join(OUT_DIR, `${name}.png`), trimmed.data);
    console.log(
      `  ${name.padEnd(22)} ${trimmed.info.width}x${trimmed.info.height} -> ${widths.join(", ")} x {gold, on-white, on-ink}`
    );
  }

  await emitBand("island-hype-logo", 0, ch, [320, 640]);
  await emitBand("island-hype-wordmark", splitAt, ch, [320, 640]);

  // The mark alone, squared, for favicons and small square slots.
  const markH = splitAt - bestLen / 2 > 0 ? Math.round(bestStart) : Math.round(ch * 0.56);
  const markRgba = Buffer.alloc(cw * markH * 4);
  for (let y = 0; y < markH; y++) {
    for (let x = 0; x < cw; x++) {
      const a = alpha[(y + y0) * W + (x + x0)];
      const o = (y * cw + x) * 4;
      markRgba[o] = GOLD.r; markRgba[o + 1] = GOLD.g; markRgba[o + 2] = GOLD.b; markRgba[o + 3] = a;
    }
  }
  const mark = await sharp(markRgba, { raw: { width: cw, height: markH, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toBuffer({ resolveWithObject: true });
  console.log(`  mark                   ${mark.info.width}x${mark.info.height}`);
  // 128 and 256 exist for the nav, which renders the mark at ~42px: the 512 PNG
  // is 94KB and serving that into a 42px slot is pure waste. 180/512 stay for
  // favicons and apple-touch-icon, which want exact sizes and PNG.
  for (const s of [128, 180, 256, 512]) {
    const inner = Math.round(s * 0.82);
    await sharp(mark.data)
      .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.round((s - inner) / 2), bottom: Math.round((s - inner) / 2),
        left: Math.round((s - inner) / 2), right: Math.round((s - inner) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_DIR, `island-hype-mark-${s}.png`));
    await sharp(mark.data)
      .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.round((s - inner) / 2), bottom: Math.round((s - inner) / 2),
        left: Math.round((s - inner) / 2), right: Math.round((s - inner) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 92, alphaQuality: 100 })
      .toFile(path.join(OUT_DIR, `island-hype-mark-${s}.webp`));
    await sharp(mark.data)
      .resize({ width: inner, height: inner, fit: "contain", background: { ...INK, alpha: 1 } })
      .extend({
        top: Math.round((s - inner) / 2), bottom: Math.round((s - inner) / 2),
        left: Math.round((s - inner) / 2), right: Math.round((s - inner) / 2),
        background: { ...INK, alpha: 1 },
      })
      .flatten({ background: INK })
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUT_DIR, `island-hype-mark-on-ink-${s}.png`));
  }
  console.log(`  island-hype-mark       128, 180, 256, 512 x {gold, on-ink}`);

  await writeFile(
    path.join(OUT_DIR, "README.md"),
    [
      "# Brand assets",
      "",
      "Generated by `npm run brand:build` from `~/Downloads/black-bg-logo-islandhype.JPG`.",
      "Do not edit by hand — re-run the script.",
      "",
      "The logo is always gold, `#AC9A74`, measured from the source.",
      "",
      "| file | use |",
      "| --- | --- |",
      "| `island-hype-logo-*.png` | full stacked lockup (mark + ISLAND HYPE + MALDIVES) |",
      "| `island-hype-wordmark-*.png` | the words alone, horizontal — for nav bars |",
      "| `island-hype-mark-*.png` | circular mark alone, square — favicons |",
      "",
      "Each comes in three grounds:",
      "",
      "- no suffix — **transparent**. Prefer this. Put it in a CSS pill or on a",
      "  known dark ground; the pill stays crisp at any size and radius.",
      "- `-on-white` — gold baked over white, for email, social cards and print.",
      "- `-on-ink` — gold baked over `#1C1B1B`, the site's own ink.",
      "",
      "Contrast: gold is 6.24:1 on ink-900 and 2.75:1 on white. The second is below",
      "the 3:1 WCAG asks of graphics, but a logotype is exempt — which is why the",
      "answer over photography is a white pill behind the gold, not a recoloured logo.",
      "",
    ].join("\n")
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// lib/storage.ts
//
// Server-side image ingest: validate, normalise, write to the local media tree.
// Self-hosted, no external object store.
//
// The one rule this file enforces is that NOTHING reaches the media tree in the
// shape it arrived in. Before, an upload was `Buffer.from(await
// file.arrayBuffer())` straight to disk — whatever the camera produced, at
// whatever size, with whatever metadata, under whatever extension the filename
// claimed. That made three separate problems:
//
//   * a 40 MP original was served to phones as-is, because staff uploads never
//     appeared in the build-time derivative manifest and never got a srcset
//   * the camera's EXIF, GPS coordinates included, shipped to the public web
//   * four files in the existing tree are WebP inside a .jpg name, which
//     browsers sniff and render but nginx mislabels
//
// next/image now produces the delivery sizes on demand, so this file no longer
// builds a ladder. It produces ONE master per upload: correctly oriented, sRGB,
// stripped of metadata, capped at 3000px, at a quality high enough that the
// master is indistinguishable from the original at any size the site displays.
//
// The cap is also what makes the optimiser safe to run here. next/image resizes
// inside the web server process, and libvips only has shrink-on-load for JPEG —
// a 48 MP PNG decodes at full resolution, ~144 MB of bitmap, on a box with about
// 360 MB free. Capping at ingest means the optimiser never meets one.

import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { MAX_UPLOAD_BYTES, uploadSizeError } from "@/lib/upload-limits";

export type StorageBucket =
  | "locations"
  | "accommodations"
  | "packages"
  | "experiences"
  | "activities"
  | "images"; // Misc site images

interface UploadOptions {
  bucket: StorageBucket;
  folder?: string; // Optional subfolder, e.g., entity ID
  fileName?: string; // Custom filename stem, otherwise generated
}

interface UploadResult {
  url: string;
  path: string;
  /** What ended up on disk, so the admin can be shown what was achieved. */
  storedBytes?: number;
  error?: string;
}

/**
 * Filesystem root where uploaded images are stored.
 * Dev default: `public/storage/v1/object/public` so files are served by Next's
 * static handler at the same URL path. Production: set MEDIA_ROOT to the
 * nginx-served media dir (e.g. /var/www/island-hype-media).
 *
 * Either way the tree must be reachable through Next's `public/` directory, not
 * only through nginx — the image optimiser fetches originals via an internal
 * mocked request to Next's own static handler, so a path only nginx knows about
 * returns 404 to it. In production that is a symlink; see the deploy workflow.
 */
const MEDIA_ROOT =
  process.env.MEDIA_ROOT ||
  path.join(process.cwd(), "public", "storage", "v1", "object", "public");

/** The master's longest edge. Above the largest width the layout ever asks for. */
const MASTER_MAX_EDGE = 3000;

/** Visually lossless for photography. The delivery re-encode happens downstream. */
const MASTER_QUALITY = 90;

/**
 * Decompression-bomb and memory guards, which have to differ by format.
 *
 * A flat 100 MP ceiling was the first attempt and it was wrong twice over. It
 * rejected a real client photograph at 12288 x 8192 — 100.7 MP, over by 0.7% —
 * and it applied the same number to formats with wildly different costs.
 *
 * JPEG is cheap to shrink: libvips decodes at 1/2, 1/4 or 1/8 scale when the
 * output is smaller, so a 200 MP JPEG bound for 3000px never allocates more than
 * a few tens of MB. PNG, TIFF and HEIF have no equivalent — they decode at full
 * resolution, three bytes a pixel, and 200 MP of that is 600 MB on a box with
 * about 350 MB free. Hence the two numbers.
 *
 * The 50 MB file ceiling is the real backstop for the non-JPEG formats anyway: a
 * 60 MP PNG photograph does not fit inside it.
 */
const JPEG_MAX_PIXELS = 200_000_000;
const OTHER_MAX_PIXELS = 60_000_000;

/** What libvips will decode. SVG is deliberately absent: it is script, not photo. */
const ACCEPTED_FORMATS = new Set([
  "jpeg",
  "png",
  "webp",
  "avif",
  "heif",
  "tiff",
  "gif",
]);

// One image at a time, and no libvips operation cache. The default thread pool
// sizes itself to the host's CPU count and the cache holds decoded images in
// memory between calls — both are reasonable on a build machine and neither is
// affordable on a 1 GB droplet that is also running MySQL.
sharp.concurrency(1);
sharp.cache(false);

/**
 * Get the public URL for a stored image.
 * Empty NEXT_PUBLIC_MEDIA_URL => same-origin relative path (served by nginx/Next).
 */
export function getImageUrl(bucket: StorageBucket, objectPath: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${objectPath}`;
}

/**
 * Normalise an uploaded image and save it to the local media filesystem.
 * Server-side only.
 *
 * The returned `path` carries the extension we chose, which is not necessarily
 * the one that was uploaded — a PNG photograph is stored as JPEG, an iPhone HEIC
 * as JPEG. Callers must persist the returned path rather than deriving one from
 * the original filename.
 */
/**
 * Normalise an image and save it into the media tree.
 *
 * `source` is either the bytes or a path on disk, and which one matters. A
 * Server Action can only give us bytes — it buffers the whole body to build a
 * File. The upload route streams to a temp file and passes the path, and libvips
 * then reads it back lazily: measured on a 100 MP photograph, 147 MB peak from a
 * Buffer against 53 MB from a path, and the path figure does not grow with the
 * file.
 *
 * The returned `path` carries the extension we chose, which is not necessarily
 * the one that was uploaded — a PNG photograph is stored as JPEG, an iPhone HEIC
 * as JPEG. Callers must persist the returned path rather than deriving one from
 * the original filename.
 */
async function processAndWrite(
  source: Buffer | string,
  originalName: string,
  options: UploadOptions
): Promise<UploadResult> {
  const { bucket, folder, fileName } = options;

  // The format comes from the bytes, never from the filename. libvips sniffs the
  // header, which is the same check that found the four mislabelled files.
  //
  // Read with no pixel ceiling on purpose: metadata() parses the header and does
  // not allocate the bitmap, so nothing can be spent here — and the header is
  // how we learn which ceiling this file should be held to.
  let meta: sharp.Metadata;
  try {
    meta = await sharp(source as never, { limitInputPixels: false, animated: false }).metadata();
  } catch (err) {
    return { url: "", path: "", error: describeDecodeFailure(originalName, err) };
  }

  const format = meta.format ?? "";
  if (!ACCEPTED_FORMATS.has(format)) {
    return {
      url: "",
      path: "",
      error: `${originalName} is not an image we can use${format ? ` (it is ${format})` : ""}. Upload a JPEG, PNG, WebP or HEIC.`,
    };
  }

  const ceiling = format === "jpeg" ? JPEG_MAX_PIXELS : OTHER_MAX_PIXELS;
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width * height > ceiling) {
    return {
      url: "",
      path: "",
      error: `${originalName} is ${width} x ${height} (${((width * height) / 1e6).toFixed(1)} megapixels), which is larger than this server can process. Export it at up to ${(ceiling / 1e6).toFixed(0)} megapixels and upload again.`,
    };
  }

  const image = sharp(source as never, {
    limitInputPixels: ceiling,
    animated: false,
    // Streams the source instead of random-accessing it, which is the single
    // biggest lever on this box. Measured on a 100.7 MP JPEG: peak memory for
    // the resize fell from 108 MB to 4 MB for the same 1.5 seconds of work.
    // Without it, one upload took the process to roughly 375 MB against the
    // 450 MB at which pm2 restarts it — a spike that would have killed the
    // request, and the site with it, at exactly the wrong moment.
    sequentialRead: true,
  });

  // Alpha has to survive, so anything transparent becomes WebP and everything
  // else becomes JPEG. JPEG for the common case on purpose: the master is also
  // what someone gets if they open the /storage/ URL directly or save the image
  // out of the admin panel, and JPEG is the format that opens everywhere.
  const toWebp = Boolean(meta.hasAlpha);
  const extension = toWebp ? "webp" : "jpg";

  let output: Buffer;
  try {
    const pipeline = image
      // Before the resize, and before the metadata is dropped: this reads the
      // EXIF orientation flag and bakes it into the pixels. Without it, every
      // portrait photograph from a phone arrives on its side once the EXIF that
      // described the rotation has been stripped.
      .rotate()
      .resize({
        width: MASTER_MAX_EDGE,
        height: MASTER_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      // Converts out of Adobe RGB / Display P3 and attaches sRGB. Keeping the
      // original profile would also be correct, but only for as long as every
      // downstream re-encode preserves it — and an image that loses a wide-gamut
      // profile somewhere in the chain is read as sRGB and renders flat.
      .withIccProfile("srgb");

    output = await (toWebp
      ? pipeline.webp({ quality: MASTER_QUALITY, alphaQuality: 100, effort: 4 })
      : pipeline.jpeg({
          quality: MASTER_QUALITY,
          mozjpeg: true,
          // No chroma subsampling. Turquoise water against white sand is exactly
          // the high-saturation edge where 4:2:0 shows as coloured fringing.
          chromaSubsampling: "4:4:4",
        })
    ).toBuffer();
    // Everything not explicitly kept above is gone by now, EXIF and its GPS
    // coordinates included. sharp drops input metadata unless asked to keep it.
  } catch (err) {
    return {
      url: "",
      path: "",
      error: `Could not process ${originalName}: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }

  const timestamp = Date.now();
  const stem = fileName ?? `${timestamp}-${Math.random().toString(36).substring(7)}`;
  const objectPath = folder ? `${folder}/${stem}.${extension}` : `${stem}.${extension}`;
  const destPath = path.join(MEDIA_ROOT, bucket, objectPath);

  try {
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, output);
  } catch (err) {
    return {
      url: "",
      path: "",
      error: err instanceof Error ? err.message : "Failed to save file",
    };
  }

  return {
    url: getImageUrl(bucket, objectPath),
    path: objectPath,
    storedBytes: output.length,
  };
}

/**
 * The Server Action path: a File in memory. Used by the create forms, where the
 * image travels with the rest of the form.
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const tooBig = uploadSizeError(file.name, file.size);
  if (tooBig) return { url: "", path: "", error: tooBig };
  if (file.size === 0) {
    return { url: "", path: "", error: `${file.name} is empty.` };
  }
  return processAndWrite(Buffer.from(await file.arrayBuffer()), file.name, options);
}

/**
 * The upload-route path: a file already streamed to disk. Costs the same
 * whatever its size, which is the point.
 */
export async function storeImageFromPath(
  tempPath: string,
  options: UploadOptions & { originalName: string }
): Promise<UploadResult> {
  return processAndWrite(tempPath, options.originalName, options);
}

export async function deleteImage(
  bucket: StorageBucket,
  objectPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await fs.unlink(path.join(MEDIA_ROOT, bucket, objectPath));
    return { success: true };
  } catch (err) {
    // Already gone is not a hard failure
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      return { success: true };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete file",
    };
  }
}

/**
 * Turn a libvips decode failure into something a non-technical person can act on.
 *
 * The two cases worth separating are a file that is too large to decode safely
 * and a HEIC that this libvips build cannot read — both of which otherwise
 * surface as the same opaque "unsupported image format".
 */
function describeDecodeFailure(name: string, err: unknown): string {
  const message = err instanceof Error ? err.message : "";

  if (/pixel limit|too large|exceeds/i.test(message)) {
    return `${name} has too many pixels to process safely. Export it at a smaller size and try again.`;
  }

  if (/heif|heic|unsupported image format/i.test(message)) {
    return `${name} is in a format this server cannot read. Export it as JPEG and upload that.`;
  }

  return `${name} does not look like an image we can read.`;
}

export { MAX_UPLOAD_BYTES };

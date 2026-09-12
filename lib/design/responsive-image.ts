// lib/design/responsive-image.ts
//
// Turns a stored filename into a srcset over the pre-generated WebP derivatives.
//
// The manifest is written by `npm run images:build` and committed, so the app
// knows which widths exist without touching the filesystem at request time. When
// a file is missing from it — someone uploaded through admin and nobody has run
// the build since — there is no srcset and the browser gets the original. That
// degradation is deliberate: a new image should appear immediately at full size
// rather than 404 while waiting for a build step.

import manifest from "./image-manifest.json";
import { getImageUrl, type StorageBucket } from "@/lib/image-urls";

type ManifestEntry = { widths: number[]; ext: string };
const MANIFEST = manifest as unknown as Record<string, ManifestEntry>;

export interface ResponsiveSource {
  /** Always set — the original, as a fallback for browsers ignoring srcset. */
  src: string;
  /** Null when no derivatives exist for this file. */
  srcSet: string | null;
  /** The largest available width, for intrinsic sizing hints. */
  maxWidth: number | null;
}

export function responsiveSource(
  bucket: StorageBucket,
  objectPath: string
): ResponsiveSource {
  const src = getImageUrl(bucket, objectPath);
  const entry = MANIFEST[`${bucket}/${objectPath}`];

  if (!entry || entry.widths.length === 0) {
    return { src, srcSet: null, maxWidth: null };
  }

  const stem = objectPath.replace(/\.[^.]+$/, "");
  const srcSet = entry.widths
    .map((w) => `${getImageUrl(bucket, `${stem}@${w}.webp`)} ${w}w`)
    .join(", ");

  return { src, srcSet, maxWidth: Math.max(...entry.widths) };
}

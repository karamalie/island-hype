// lib/design/optimized-image.ts
//
// Builds srcsets that point at Next's image optimiser.
//
// This replaces lib/design/responsive-image.ts, which read a committed JSON
// manifest of pre-generated WebP files. The manifest was produced by a script run
// on a developer's machine against the repo's media tree, so an image uploaded
// through admin was never in it — `responsiveSource` returned srcSet: null and
// the browser got the full-size original. Every photograph the client adds from
// now on would have had that problem, permanently.
//
// /_next/image resizes on demand instead, caches the result on disk for 30 days
// (see minimumCacheTTL in next.config.ts) and needs nothing built or committed.
//
// Why the URLs are assembled here rather than using <Image> everywhere: the page
// heads do art direction with <picture><source media>, swapping a different crop
// below 768px, and next/image cannot express that. Rather than run next/image in
// one place and a hand-built srcset in the other, both go through this.

/**
 * Where images are served from. Empty means same-origin, which is what local
 * development and any deploy without a CDN do.
 *
 * This is deliberately NOT NEXT_PUBLIC_MEDIA_URL, which already exists and looks
 * like the right knob. That one prefixes getImageUrl, and getImageUrl feeds the
 * `url` parameter the optimiser resolves — making it absolute would send the
 * optimiser out over the network to fetch originals it currently reads off local
 * disk, and would break optimizedSrcSet below, which tests for a path starting
 * "/storage/". The CDN belongs in front of the finished image, not in front of
 * the source the optimiser reads.
 */
const CDN = process.env.NEXT_PUBLIC_CDN_URL ?? "";

/** Puts the CDN in front of a site-relative path. A no-op when unset. */
export function cdnUrl(path: string): string {
  return CDN && path.startsWith("/") ? CDN + path : path;
}

/**
 * Must stay a subset of `images.deviceSizes` in next.config.ts — the optimiser
 * rejects any width outside deviceSizes + imageSizes with a 400.
 */
const WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3000];

/**
 * Must be listed in `images.qualities`. 82 rather than the 75 default because
 * these are large photographs of water, where banding in a gradient sky is the
 * first artefact to show.
 */
export const PHOTO_QUALITY = 82;

/** One optimiser URL. `url` is a site-relative media path, e.g. /storage/... */
export function optimizedSrc(url: string, width: number, quality = PHOTO_QUALITY): string {
  return cdnUrl(`/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`);
}

/**
 * The full candidate set. Returns null for anything not served from our own
 * media path — an absolute URL to another origin would need a remotePatterns
 * entry, and silently emitting a srcset the optimiser will 400 on is worse than
 * falling back to the plain src.
 */
export function optimizedSrcSet(url: string, quality = PHOTO_QUALITY): string | null {
  if (!url.startsWith("/storage/")) return null;
  return WIDTHS.map((w) => `${optimizedSrc(url, w, quality)} ${w}w`).join(", ");
}

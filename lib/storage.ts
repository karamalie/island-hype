// lib/storage.ts
// Server-side local-filesystem image storage (self-hosted; no external object store).
import { promises as fs } from "fs";
import path from "path";

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
  fileName?: string; // Custom filename, otherwise uses original
}

interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Filesystem root where uploaded images are stored.
 * Dev default: `public/storage/v1/object/public` so files are served by Next's
 * static handler at the same URL path. Production: set MEDIA_ROOT to the
 * nginx-served media dir (e.g. /var/www/island-hype-media).
 */
const MEDIA_ROOT =
  process.env.MEDIA_ROOT ||
  path.join(process.cwd(), "public", "storage", "v1", "object", "public");

/**
 * Get the public URL for a stored image.
 * Empty NEXT_PUBLIC_MEDIA_URL => same-origin relative path (served by nginx/Next).
 */
export function getImageUrl(bucket: StorageBucket, objectPath: string): string {
  const base = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${objectPath}`;
}

/**
 * Get optimized image URL using Supabase transform
 * @param url Original image URL
 * @param options Transform options
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "avif";
  } = {}
): string {
  const { width, height, quality = 80, format = "webp" } = options;

  // If it's a Supabase storage URL, use transforms
  if (url.includes("supabase.co/storage")) {
    const params = new URLSearchParams();
    if (width) params.set("width", width.toString());
    if (height) params.set("height", height.toString());
    params.set("quality", quality.toString());
    params.set("format", format);

    // Convert public URL to render URL with transforms
    return (
      url.replace("/object/public/", "/render/image/public/") +
      "?" +
      params.toString()
    );
  }

  // Return original URL for external images
  return url;
}

/**
 * Save an uploaded image to the local media filesystem.
 * Server-side only!
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const { bucket, folder, fileName } = options;

  // Generate a safe, unique object path
  const timestamp = Date.now();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = fileName
    ? `${fileName}.${extension}`
    : `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

  const objectPath = folder ? `${folder}/${safeName}` : safeName;
  const destPath = path.join(MEDIA_ROOT, bucket, objectPath);

  try {
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(destPath, buffer);
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
  };
}

/**
 * Delete an image from the local media filesystem.
 * Server-side only! Accepts a bucket-relative object path.
 */
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
 * Generate responsive image srcSet for use with next/image or img tags
 */
export function generateSrcSet(
  url: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048]
): string {
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(", ");
}

/**
 * Common image sizes for different use cases
 */
export const imageSizes = {
  thumbnail: { width: 200, height: 200 },
  card: { width: 400, height: 300 },
  cardLarge: { width: 600, height: 400 },
  hero: { width: 1920, height: 1080 },
  gallery: { width: 1200, height: 800 },
  full: { width: 2400, height: 1600 },
} as const;

// lib/image-url.ts
// Client-safe image URL helpers - can be used in both client and server components

export type StorageBucket =
  | "locations"
  | "accommodations"
  | "packages"
  | "experiences"
  | "activities"
  | "images";

/**
 * Get the public URL for a stored image
 * Safe to use in client components
 */
export function getImageUrl(bucket: StorageBucket, path: string): string {
  // Handle empty/null paths
  if (!path) return "/placeholder.jpg";

  // If already a full URL, return as-is
  if (path.startsWith("http")) return path;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Extract the storage-relative path from a full URL.
 * If already a relative path, returns as-is.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/locations/abc/img.jpg" → "abc/img.jpg"
 */
export function getStoragePath(url: string, bucket: StorageBucket): string {
  if (!url || !url.startsWith("http")) return url;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx !== -1) return url.slice(idx + marker.length);
  return url;
}

/**
 * Get optimized image URL using Supabase transform
 * Safe to use in client components
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

    return (
      url.replace("/object/public/", "/render/image/public/") +
      "?" +
      params.toString()
    );
  }

  return url;
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

// lib/image-urls.ts
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

  // Media base. Empty/unset => same-origin relative path (served by nginx on this host).
  const base = process.env.NEXT_PUBLIC_MEDIA_URL ?? "";

  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
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

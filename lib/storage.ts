// lib/storage.ts
import { createAdminClient } from "./supabase/server";

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
 * Get the public URL for a stored image
 */
export function getImageUrl(bucket: StorageBucket, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
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
 * Upload an image to Supabase Storage
 * Server-side only!
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const supabase = createAdminClient();
  const { bucket, folder, fileName } = options;

  // Generate unique filename
  const timestamp = Date.now();
  const extension = file.name.split(".").pop() || "jpg";
  const safeName = fileName
    ? `${fileName}.${extension}`
    : `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

  const path = folder ? `${folder}/${safeName}` : safeName;

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return {
      url: "",
      path: "",
      error: error.message,
    };
  }

  const url = getImageUrl(bucket, data.path);

  return {
    url,
    path: data.path,
  };
}

/**
 * Delete an image from Supabase Storage
 * Server-side only!
 */
export async function deleteImage(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
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

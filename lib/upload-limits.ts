// lib/upload-limits.ts
//
// The upload ceiling, in the one place both ends of the wire can import.
//
// Four things gate an upload and they used to disagree with each other: nginx
// allowed 20 MB, Next's Server Actions allowed 1 MB (the unset default, which is
// why any real photograph failed), the admin UI claimed 5 MB in prose, and the
// server checked nothing at all. A staff member picking a 12 MB photo got
// "Failed to upload" after waiting for the whole file to transfer.
//
// So the number lives here, the client checks it before spending the upload, the
// server checks it again as the authority, and the two error messages are the
// same sentence. next.config.ts and nginx are set above it on purpose — see the
// note on the body limit there.
//
// Client-safe: no node builtins, no sharp. lib/storage.ts is the server half.

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

/** For prose. Kept in step with MAX_UPLOAD_BYTES by hand — it is one number. */
export const MAX_UPLOAD_LABEL = "50 MB";

/**
 * What the file picker offers. Deliberately not `image/*`: that also matches
 * SVG, which is a script vector rather than a photograph and has no business in
 * a gallery. HEIC is here because it is what an iPhone produces by default and
 * the client's photographer is not going to convert them by hand.
 */
export const ACCEPTED_UPLOAD_TYPES =
  "image/jpeg,image/png,image/webp,image/avif,image/tiff,image/heic,image/heif,.heic,.heif";

export function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} bytes`;
}

/**
 * The shared rejection. Returns a sentence to show the user, or null to proceed.
 *
 * It names the file and its actual size rather than restating the limit alone,
 * because someone uploading eight photographs at once needs to know which one
 * was refused.
 */
export function uploadSizeError(name: string, bytes: number): string | null {
  if (bytes <= MAX_UPLOAD_BYTES) return null;
  return `${name} is ${formatBytes(bytes)}. The limit is ${MAX_UPLOAD_LABEL} — please resize it and try again.`;
}

/**
 * Browsers disagree about HEIC: some report `image/heic`, some report an empty
 * `File.type` entirely. A MIME-only check therefore rejects the format we just
 * taught the server to read, so fall back to the extension.
 */
export function looksLikeImage(file: { name: string; type: string }): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|avif|tiff?|heic|heif)$/i.test(file.name);
}

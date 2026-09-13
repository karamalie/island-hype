"use client";

// lib/admin/upload-file.ts
//
// One upload, start to finish, reporting what it is doing at each step.
//
// XMLHttpRequest rather than fetch, for one reason: fetch has no upload progress
// events. It can tell you a request finished but never how far through it is, so
// an admin sending 47 MB over a hotel connection would watch a spinner for six
// minutes unable to tell a slow upload from a hung one. XHR's upload.onprogress
// is the only way to know, and it is why app/api/admin/media exists at all.

import { compressImage, type CompressPhase } from "./compress-image";

export type UploadPhase = "compressing" | "uploading" | "optimising" | "done";

export interface UploadProgress {
  phase: UploadPhase;
  /** Within "compressing": what the worker is up to. */
  compressPhase?: CompressPhase;
  /** Within "uploading": real bytes on the wire. */
  loaded?: number;
  total?: number;
  percent?: number;
  originalBytes?: number;
  uploadBytes?: number;
  storedBytes?: number;
  /** Set when the browser could not shrink it, so the UI can say why. */
  compressSkipped?: string;
}

export interface UploadOutcome {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  originalBytes?: number;
  storedBytes?: number;
}

export async function uploadWithProgress(
  file: File,
  options: { bucket: string; folder?: string },
  onProgress: (p: UploadProgress) => void
): Promise<UploadOutcome> {
  const originalBytes = file.size;

  onProgress({ phase: "compressing", originalBytes });
  const shrunk = await compressImage(file, (compressPhase) =>
    onProgress({ phase: "compressing", compressPhase, originalBytes })
  );

  const toSend = shrunk.file;
  const compressSkipped = shrunk.compressed ? undefined : shrunk.reason;

  const params = new URLSearchParams({ bucket: options.bucket });
  if (options.folder) params.set("folder", options.folder);

  return new Promise<UploadOutcome>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/media?${params.toString()}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    // Headers are latin-1 only, and these filenames have spaces and accents.
    xhr.setRequestHeader("x-filename", encodeURIComponent(toSend.name));

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      onProgress({
        phase: "uploading",
        loaded: e.loaded,
        total: e.total,
        percent: Math.round((e.loaded / e.total) * 100),
        originalBytes,
        uploadBytes: toSend.size,
        compressSkipped,
      });
    };

    // Bytes are all sent; the server is now resizing. Nothing reports progress
    // on that, so the UI says what is happening rather than pretending to a
    // percentage it cannot know.
    xhr.upload.onload = () =>
      onProgress({ phase: "optimising", originalBytes, uploadBytes: toSend.size, compressSkipped });

    xhr.onload = () => {
      let body: Record<string, unknown> = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        /* a proxy error page, or an empty body */
      }
      if (xhr.status >= 200 && xhr.status < 300 && typeof body.url === "string") {
        onProgress({
          phase: "done",
          originalBytes,
          uploadBytes: toSend.size,
          storedBytes: typeof body.storedBytes === "number" ? body.storedBytes : undefined,
          compressSkipped,
        });
        resolve({
          success: true,
          url: body.url as string,
          path: body.path as string,
          originalBytes,
          storedBytes: typeof body.storedBytes === "number" ? body.storedBytes : undefined,
        });
        return;
      }
      resolve({
        success: false,
        error:
          (typeof body.error === "string" && body.error) ||
          (xhr.status === 401
            ? "Your session has expired. Sign in again and retry."
            : `The upload failed (${xhr.status || "no response"}).`),
      });
    };

    xhr.onerror = () =>
      resolve({ success: false, error: "Could not reach the server. Check your connection and try again." });
    xhr.onabort = () => resolve({ success: false, error: "Upload cancelled." });
    xhr.ontimeout = () =>
      resolve({ success: false, error: "The upload timed out. Try again on a stronger connection." });

    xhr.send(toSend);
  });
}

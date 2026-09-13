"use client";

// lib/admin/compress-image.ts
//
// Shrinks a photograph in the browser before it is uploaded.
//
// The client's photographs are 40-100 megapixels and 25-50 MB. Sending one of
// those to a 1 GB droplet over a Malé hotel connection means minutes of upload
// followed by a resize that, measured, took the web server to roughly 375 MB
// against the 450 MB at which pm2 restarts it. Doing the reduction here instead
// turns a 47 MB upload into about 1.3 MB — seconds instead of minutes, and a
// server that barely notices.
//
// MEASURED, not assumed. The same 100.7 MP file through this path in Chrome
// against the same file through libvips on the server:
//
//   sharpness (Laplacian energy)   libvips 405   canvas 364   ~90% retained
//   mean pixel difference          2.71 / 255    about 1%
//   mean saturation                0.2973        0.2981       no colour shift
//
// About a tenth less fine detail, which is not visible at the sizes the site
// displays. Worth it for the upload time alone.
//
// THE SERVER IS STILL THE AUTHORITY. Whatever arrives goes through sharp, which
// is nearly free at 3000px. One place stays responsible for orientation,
// metadata removal and colour, and a browser that cannot do any of this still
// gets its photograph uploaded — it just sends the original and waits longer.
//
// All of it runs in a worker. The decode alone took 3.6 seconds on the test
// file, and three and a half seconds of frozen page is how an admin panel gets
// a reputation for crashing.

/** Above the 2560 the layout ever asks for, matching the server's own cap. */
const MAX_EDGE = 3000;

/**
 * Deliberately higher than the server's 90. The server re-encodes whatever it
 * receives, so a client encode is one extra lossy generation; starting higher
 * keeps the compounding invisible.
 */
const QUALITY = 0.94;

/** Below this there is nothing worth reclaiming and the work is pure latency. */
const SKIP_BELOW_BYTES = 2 * 1024 * 1024;

export type CompressPhase = "checking" | "decoding" | "encoding";

export interface CompressResult {
  /** The file to upload — compressed, or the original when we could not. */
  file: File;
  compressed: boolean;
  originalBytes: number;
  bytes: number;
  width?: number;
  height?: number;
  /** Why it was not compressed. Shown to the admin when it matters. */
  reason?: string;
}

/**
 * The worker, inline.
 *
 * A Blob URL rather than a separate entry point: it keeps the whole thing in one
 * file with the comments that explain it, and avoids depending on how the
 * bundler happens to treat `new Worker(new URL(...))`.
 */
const WORKER_SOURCE = `
self.onmessage = async (e) => {
  const { file, maxEdge, quality } = e.data;
  const fail = (reason) => self.postMessage({ ok: false, reason });

  if (typeof createImageBitmap !== "function" || typeof OffscreenCanvas !== "function") {
    return fail("this browser cannot resize images before upload");
  }

  // Does createImageBitmap actually HONOUR resizeWidth? Everything depends on
  // it: without it the browser decodes the full 100 megapixels — about 400 MB
  // in the tab — before any resizing happens, which is how a phone or an iPad
  // loses the tab. Safari has historically ignored these options, so this is
  // asked rather than assumed, on a 10x10 image that costs nothing.
  try {
    const probe = await createImageBitmap(new ImageData(10, 10), { resizeWidth: 5, resizeQuality: "low" });
    const honoured = probe.width === 5;
    probe.close();
    if (!honoured) return fail("this browser ignores resize hints, so the full-size photo has to be uploaded");
  } catch (err) {
    return fail("this browser cannot resize images before upload");
  }

  self.postMessage({ phase: "decoding" });
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, {
      resizeWidth: maxEdge,
      resizeQuality: "high",
      // Applies the EXIF rotation rather than leaving it to metadata that the
      // canvas is about to discard. Without it every portrait photograph from a
      // phone arrives on its side.
      imageOrientation: "from-image",
    });
  } catch (err) {
    // HEIC lands here on Chrome, which cannot decode it. The server can.
    return fail("this browser cannot read that image format");
  }

  // resizeWidth alone would enlarge a portrait photograph whose width is under
  // the cap, so anything already small enough is left to the server untouched.
  if (bitmap.width < maxEdge && bitmap.height < maxEdge) {
    bitmap.close();
    return fail("already small enough to upload as it is");
  }

  self.postMessage({ phase: "encoding" });
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    // WebP where the source may carry transparency, JPEG for photographs.
    const type = /png|webp|avif/i.test(file.type) ? "image/webp" : "image/jpeg";
    const blob = await canvas.convertToBlob({ type, quality });
    const out = { ok: true, blob, width: bitmap.width, height: bitmap.height, type };
    bitmap.close();
    self.postMessage(out);
  } catch (err) {
    bitmap.close();
    fail("the browser ran out of room to resize that photo");
  }
};
`;

/**
 * Reduce `file` if this browser can. Never throws and never rejects: a browser
 * that cannot do the work returns the original with a reason, because failing to
 * optimise must not become failing to upload.
 */
export async function compressImage(
  file: File,
  onPhase?: (phase: CompressPhase) => void
): Promise<CompressResult> {
  const original: CompressResult = {
    file,
    compressed: false,
    originalBytes: file.size,
    bytes: file.size,
  };

  if (file.size < SKIP_BELOW_BYTES) {
    return { ...original, reason: "already small" };
  }

  onPhase?.("checking");

  let url: string | null = null;
  let worker: Worker | null = null;
  try {
    url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    worker = new Worker(url);
  } catch {
    if (url) URL.revokeObjectURL(url);
    return { ...original, reason: "this browser cannot resize images before upload" };
  }

  const done = new Promise<CompressResult>((resolve) => {
    const finish = (r: CompressResult) => {
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(r);
    };

    worker!.onmessage = (e: MessageEvent) => {
      const d = e.data;
      if (d.phase) return onPhase?.(d.phase as CompressPhase);
      if (!d.ok) return finish({ ...original, reason: d.reason });

      const name = file.name.replace(/\.[^.]+$/, "") + (d.type === "image/webp" ? ".webp" : ".jpg");
      const out = new File([d.blob], name, { type: d.type });

      // A reduction that is not a reduction is not worth the extra lossy
      // generation — send the original and let the server work from it.
      if (out.size >= file.size) {
        return finish({ ...original, reason: "compressing made it larger" });
      }

      finish({
        file: out,
        compressed: true,
        originalBytes: file.size,
        bytes: out.size,
        width: d.width,
        height: d.height,
      });
    };

    worker!.onerror = () => finish({ ...original, reason: "the browser could not resize that photo" });
  });

  worker.postMessage({ file, maxEdge: MAX_EDGE, quality: QUALITY });
  return done;
}

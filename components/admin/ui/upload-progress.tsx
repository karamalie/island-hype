"use client";

// components/admin/ui/upload-progress.tsx
//
// What the admin watches while a photograph is being processed and sent.
//
// It exists because the honest answer at each step is different, and a single
// spinner lies about all of them. Compressing takes a few seconds and cannot
// report a percentage. Uploading can, exactly, and on a slow connection it is
// the only thing distinguishing "working" from "hung". The server-side resize
// takes a second or two and again has no percentage to give.
//
// So each phase says what it is, only the phase that genuinely knows a number
// shows a determinate bar, and the end states what was actually achieved —
// "47.1 MB to 1.6 MB" is the sentence that tells someone the thing they uploaded
// will not be what visitors download.

import { Check, Loader2 } from "lucide-react";
import type { UploadProgress } from "@/lib/admin/upload-file";

function mb(bytes?: number): string {
  if (bytes === undefined) return "";
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function UploadProgressBar({ progress }: { progress: UploadProgress }) {
  const { phase } = progress;

  const label =
    phase === "compressing"
      ? progress.compressPhase === "encoding"
        ? "Compressing photo…"
        : progress.compressPhase === "decoding"
          ? "Reading photo…"
          : "Checking photo…"
      : phase === "uploading"
        ? "Uploading…"
        : phase === "optimising"
          ? "Optimising on the server…"
          : "Done";

  // Only the upload knows a real percentage. The other phases get a moving
  // indeterminate bar rather than a fake number.
  const determinate = phase === "uploading" && progress.percent !== undefined;
  const pct = phase === "done" ? 100 : determinate ? progress.percent! : undefined;

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          {phase === "done" ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
          )}
          {label}
        </span>
        <span className="shrink-0 tabular-nums text-slate-500">
          {phase === "uploading" && determinate
            ? `${mb(progress.loaded)} of ${mb(progress.total)}`
            : phase === "done"
              ? `${mb(progress.originalBytes)} → ${mb(progress.storedBytes ?? progress.uploadBytes)}`
              : ""}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        {pct !== undefined ? (
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-200"
            style={{ width: `${pct}%` }}
          />
        ) : (
          // Indeterminate: a band that travels, so a long compress still looks
          // alive. Animation defined in globals.css.
          <div className="upload-indeterminate h-full rounded-full bg-blue-500" />
        )}
      </div>

      {/* Said once, at the moment it is true, rather than as a standing warning
          nobody reads. Chrome and Edge shrink the photo before sending it;
          Safari does not, which turns a 2 MB upload into a 47 MB one. */}
      {progress.compressSkipped &&
        phase !== "compressing" &&
        progress.compressSkipped !== "already small" && (
          <p className="mt-1.5 text-xs leading-5 text-amber-700">
            Your browser couldn&rsquo;t shrink this photo first ({progress.compressSkipped}), so
            the full {mb(progress.originalBytes)} is being sent. It will still work — Chrome
            makes large photos much faster to upload.
          </p>
        )}
    </div>
  );
}

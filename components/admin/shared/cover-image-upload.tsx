"use client";

// components/admin/shared/cover-image-upload.tsx
//
// The cover photograph picker, in the two modes the forms need.
//
// On an EXISTING record it uploads straight away, through /api/admin/media, and
// shows real progress while it does. On a NEW one there is no record to attach
// to yet, so the file is shrunk and handed to the form to travel with the rest
// of it on save.
//
// Both modes shrink the photograph in the browser first. That is what turns a
// 47 MB upload into roughly 1.7 MB, and it is why the create path can still go
// through a Server Action without the memory cost that used to imply.

import { useState, useRef, useCallback } from "react";
import { Loader2, ImageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_LABEL,
  looksLikeImage,
  uploadSizeError,
} from "@/lib/upload-limits";
import { compressImage } from "@/lib/admin/compress-image";
import { uploadWithProgress, type UploadProgress } from "@/lib/admin/upload-file";
import { setCoverPath, type MediaKind } from "@/lib/actions/media";
import { runAction } from "@/lib/admin/run-action";
import { UploadProgressBar } from "@/components/admin/ui/upload-progress";

interface CoverImageUploadProps {
  currentImageUrl?: string;
  /** Which table the record lives in. */
  kind: MediaKind;
  /** Present only on an existing record — its absence is what "create" means. */
  entityId?: string;
  /** Create mode: hand the (shrunk) file to the form to submit. */
  onFileChange?: (file: File | null) => void;
  /** Edit mode: called after the cover has been stored and recorded. */
  onUploaded?: () => void;
  required?: boolean;
}

const BUCKETS: Record<MediaKind, string> = {
  location: "locations",
  accommodation: "accommodations",
  activity: "activities",
  package: "packages",
};

export function CoverImageUpload({
  currentImageUrl,
  kind,
  entityId,
  onFileChange,
  onUploaded,
  required = false,
}: CoverImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = progress !== null && progress.phase !== "done";
  const displayUrl = previewUrl || currentImageUrl;

  const handleFile = useCallback(
    async (file: File) => {
      if (!looksLikeImage(file)) {
        toast.error("Please select an image file");
        return;
      }
      const tooBig = uploadSizeError(file.name, file.size);
      if (tooBig) {
        toast.error(tooBig);
        return;
      }

      if (entityId) {
        const result = await uploadWithProgress(
          file,
          { bucket: BUCKETS[kind], folder: entityId },
          setProgress
        );
        if (!result.success || !result.path) {
          setProgress(null);
          toast.error(result.error || "Failed to upload cover image");
          return;
        }
        // Stored, but not yet the cover — that is a separate, tiny write.
        const recorded = await runAction(() => setCoverPath(kind, entityId, result.path!));
        if (!recorded.success) {
          setProgress(null);
          toast.error(recorded.error || "Failed to set the cover image");
          return;
        }
        setPreviewUrl(result.url!);
        toast.success("Cover image updated");
        onUploaded?.();
        // Leave the finished bar up briefly so the size line can be read.
        setTimeout(() => setProgress(null), 2500);
        return;
      }

      // Create mode: no record to attach to, so shrink and hand it over.
      setProgress({ phase: "compressing", originalBytes: file.size });
      const shrunk = await compressImage(file, (compressPhase) =>
        setProgress({ phase: "compressing", compressPhase, originalBytes: file.size })
      );
      setProgress({
        phase: "done",
        originalBytes: shrunk.originalBytes,
        storedBytes: shrunk.bytes,
        compressSkipped: shrunk.compressed ? undefined : shrunk.reason,
      });
      setPreviewUrl(URL.createObjectURL(shrunk.file));
      onFileChange?.(shrunk.file);
      setTimeout(() => setProgress(null), 2500);
    },
    [entityId, kind, onFileChange, onUploaded]
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!busy) setDragOver(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (busy) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Cover Image {required && "*"}
      </label>

      {displayUrl ? (
        <div
          className={`relative group rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
            dragOver ? "border-blue-500" : "border-slate-200"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !busy && fileInputRef.current?.click()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayUrl} alt="Cover image" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            {busy ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 text-sm font-medium text-slate-700">
                <Pencil className="w-4 h-4" />
                Change cover image
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !busy && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          } ${busy ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <ImageIcon className="w-8 h-8 text-slate-400" />
          <div className="text-center">
            <p className="text-sm text-slate-600 font-medium">Drop an image here or click to upload</p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, WebP or HEIC, up to {MAX_UPLOAD_LABEL}
            </p>
          </div>
        </div>
      )}

      {progress && (
        <div className="mt-3">
          <UploadProgressBar progress={progress} />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_UPLOAD_TYPES}
        onChange={handleFileInput}
        disabled={busy}
        className="hidden"
      />
    </div>
  );
}

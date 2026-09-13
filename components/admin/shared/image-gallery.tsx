"use client";

// components/admin/shared/image-gallery.tsx
//
// The gallery manager: add photographs to a record, remove them.
//
// Uploads go one at a time, on purpose. Each one is resized on a server with
// 1 GB of RAM shared with MySQL, and several at once is how that server gets
// itself restarted mid-request. Sequential is also what lets the progress bar
// mean anything — "3 of 8" plus a real percentage for the one in flight.
//
// Each photograph is shrunk in the browser first, so what actually crosses the
// wire is about 1.7 MB rather than 47 MB.

import { useState, useCallback, useRef } from "react";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_LABEL,
  looksLikeImage,
  uploadSizeError,
} from "@/lib/upload-limits";
import { uploadWithProgress, type UploadProgress } from "@/lib/admin/upload-file";
import { attachImage, type MediaKind } from "@/lib/actions/media";
import { runAction } from "@/lib/admin/run-action";
import { UploadProgressBar } from "@/components/admin/ui/upload-progress";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  kind: MediaKind;
  entityId: string;
  onDelete: (imageId: string) => Promise<{ success: boolean; error?: string }>;
  /** Called once a batch finishes, so the page can pick up the new rows. */
  onUploaded?: () => void;
  disabled?: boolean;
}

const BUCKETS: Record<MediaKind, string> = {
  location: "locations",
  accommodation: "accommodations",
  activity: "activities",
  package: "packages",
};

export function ImageGallery({
  images,
  kind,
  entityId,
  onDelete,
  onUploaded,
  disabled = false,
}: ImageGalleryProps) {
  const [currentImages, setCurrentImages] = useState<GalleryImage[]>(images);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [batch, setBatch] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploading = progress !== null;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const all = Array.from(files).filter(looksLikeImage);
      if (all.length === 0) {
        toast.error("Please select image files only");
        return;
      }

      // Refused instantly, rather than after the browser has spent minutes on it.
      const tooBig = all.filter((f) => uploadSizeError(f.name, f.size));
      const toSend = all.filter((f) => !uploadSizeError(f.name, f.size));
      for (const f of tooBig) toast.error(uploadSizeError(f.name, f.size)!);
      if (toSend.length === 0) return;

      let uploaded = 0;
      let failed = 0;

      for (const [index, file] of toSend.entries()) {
        setBatch({ done: index, total: toSend.length });
        const result = await uploadWithProgress(
          file,
          { bucket: BUCKETS[kind], folder: entityId },
          setProgress
        );

        if (!result.success || !result.path) {
          failed++;
          toast.error(result.error || `Failed to upload ${file.name}`);
          continue;
        }

        const recorded = await runAction(() => attachImage(kind, entityId, result.path!));
        if (!recorded.success) {
          failed++;
          toast.error(recorded.error || `Uploaded ${file.name} but could not attach it`);
          continue;
        }

        uploaded++;
        setCurrentImages((prev) => [
          ...prev,
          { id: (recorded as { id?: string }).id ?? result.path!, url: result.url!, alt: null },
        ]);
      }

      setProgress(null);
      setBatch(null);

      // Only claim what actually happened.
      if (uploaded === 1 && failed === 0) toast.success("Image uploaded");
      else if (uploaded > 0 && failed === 0) toast.success(`${uploaded} images uploaded`);
      else if (uploaded > 0) toast.success(`${uploaded} uploaded, ${failed} failed`);
      if (uploaded > 0) onUploaded?.();
    },
    [kind, entityId, onUploaded]
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setDragOver(true);
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
    if (disabled || uploading) return;
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
    e.target.value = "";
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId);
    const result = await runAction(() => onDelete(imageId));
    setDeletingId(null);
    if (result.success) {
      setCurrentImages((prev) => prev.filter((i) => i.id !== imageId));
      toast.success("Image deleted");
    } else {
      toast.error(result.error || "Failed to delete image");
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">Image Gallery</h2>

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {currentImages.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-lg overflow-hidden border-2 border-slate-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt || ""} className="w-full h-28 object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(img.id);
                }}
                disabled={deletingId === img.id}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                {deletingId === img.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <X className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors ${
          uploading ? "cursor-default border-slate-300" : "cursor-pointer"
        } ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {uploading && progress ? (
          <div className="w-full max-w-md">
            {batch && batch.total > 1 && (
              <p className="mb-2 text-center text-xs font-medium text-slate-500">
                Photo {batch.done + 1} of {batch.total}
              </p>
            )}
            <UploadProgressBar progress={progress} />
          </div>
        ) : currentImages.length === 0 ? (
          <>
            <ImageIcon className="w-8 h-8 text-slate-400" />
            <div className="text-center">
              <p className="text-sm text-slate-600 font-medium">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-slate-400 mt-1">
                JPG, PNG, WebP or HEIC, up to {MAX_UPLOAD_LABEL} each
              </p>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-slate-400" />
            <p className="text-sm text-slate-500">Drop more images or click to upload</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_UPLOAD_TYPES}
          multiple
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>
    </div>
  );
}

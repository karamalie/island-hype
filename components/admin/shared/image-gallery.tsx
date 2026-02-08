"use client";

import { useState, useCallback, useRef } from "react";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  onUpload: (file: File) => Promise<{ success: boolean; url?: string; id?: string; error?: string }>;
  onDelete: (imageId: string) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
}

export function ImageGallery({
  images,
  onUpload,
  onDelete,
  disabled = false,
}: ImageGalleryProps) {
  const [currentImages, setCurrentImages] = useState<GalleryImage[]>(images);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (fileArray.length === 0) {
        toast.error("Please select image files only");
        return;
      }

      setUploading(true);
      for (const file of fileArray) {
        const result = await onUpload(file);
        if (result.success && result.url) {
          setCurrentImages((prev) => [
            ...prev,
            {
              id: result.id || Date.now().toString(),
              url: result.url!,
              alt: file.name,
            },
          ]);
        } else {
          toast.error(result.error || `Failed to upload ${file.name}`);
        }
      }
      setUploading(false);
      toast.success(
        fileArray.length === 1
          ? "Image uploaded"
          : `${fileArray.length} images uploaded`
      );
    },
    [onUpload]
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
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFiles(files);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) handleFiles(files);
    e.target.value = "";
  }

  async function handleDelete(imageId: string) {
    setDeletingId(imageId);
    const result = await onDelete(imageId);
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
      <h2 className="text-base font-semibold text-slate-900 mb-4">
        Image Gallery
      </h2>

      {/* Thumbnail grid */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {currentImages.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-lg overflow-hidden border-2 border-slate-200"
            >
              <img
                src={img.url}
                alt={img.alt || ""}
                className="w-full h-28 object-cover"
              />
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

      {/* Drag & drop upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
        } ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-600 font-medium">Uploading...</p>
          </>
        ) : currentImages.length === 0 ? (
          <>
            <ImageIcon className="w-8 h-8 text-slate-400" />
            <div className="text-center">
              <p className="text-sm text-slate-600 font-medium">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG, WebP up to 5MB each
              </p>
            </div>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-slate-400" />
            <p className="text-sm text-slate-500">
              Drop more images or click to upload
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />
      </div>
    </div>
  );
}

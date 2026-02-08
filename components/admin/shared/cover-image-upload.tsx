"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, ImageIcon, Pencil } from "lucide-react";
import { toast } from "sonner";

interface CoverImageUploadProps {
  currentImageUrl?: string;
  /** Create mode: store file locally, parent includes in form submission */
  onFileChange?: (file: File | null) => void;
  /** Edit mode: upload immediately */
  onUpload?: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  required?: boolean;
}

export function CoverImageUpload({
  currentImageUrl,
  onFileChange,
  onUpload,
  required = false,
}: CoverImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = previewUrl || currentImageUrl;

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (onFileChange) {
        // Create mode - store file and show local preview
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onFileChange(file);
      } else if (onUpload) {
        // Edit mode - upload immediately
        setUploading(true);
        const result = await onUpload(file);
        setUploading(false);
        if (result.success && result.url) {
          setPreviewUrl(result.url);
          toast.success("Cover image updated");
        } else {
          toast.error(result.error || "Failed to upload cover image");
        }
      }
    },
    [onFileChange, onUpload]
  );

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setDragOver(true);
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
    if (uploading) return;
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
        // Show current cover with change overlay
        <div
          className={`relative group rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${
            dragOver ? "border-blue-500" : "border-slate-200"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <img
            src={displayUrl}
            alt="Cover image"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            {uploading ? (
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
        // Empty upload zone
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-slate-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-slate-400" />
              <div className="text-center">
                <p className="text-sm text-slate-600 font-medium">
                  Drop an image here or click to upload
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        disabled={uploading}
        className="hidden"
      />
    </div>
  );
}

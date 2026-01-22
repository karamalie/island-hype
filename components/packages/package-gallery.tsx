// components/packages/package-gallery.tsx
"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/image-urls";

interface PackageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
  }>;
  packageName: string;
}

export function PackageGallery({ images, packageName }: PackageGalleryProps) {
  // Show first 3 images
  const displayImages = images.slice(0, 3);

  if (displayImages.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {displayImages.map((image, index) => (
        <div
          key={image.id}
          className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer"
        >
          <Image
            src={getImageUrl("packages", image.url)}
            alt={image.alt || `${packageName} - Image ${index + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>
      ))}
    </div>
  );
}

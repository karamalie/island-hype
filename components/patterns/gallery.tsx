// components/patterns/gallery.tsx
//
// Three photographs fill the mosaic exactly — one large frame plus two stacked.
// Below three, a single wide frame beats a grid of grey boxes, which is the
// branch that fires on every detail page today because the image tables are empty.

import { galleryLayout, galleryPillLabel } from "@/lib/design/density";
import type { StorageBucket } from "@/lib/image-urls";
import { PhotoFrame } from "./photo-frame";

export interface GalleryProps {
  images: { id: string; url: string; alt: string | null }[];
  /** Used for the single frame when there are no gallery images at all. */
  cover: string | null;
  bucket: StorageBucket;
  name: string;
}

export function Gallery({ images, cover, bucket, name }: GalleryProps) {
  if (galleryLayout(images.length) === "single") {
    const src = images[0]?.url ?? cover;
    return (
      <PhotoFrame
        src={src}
        bucket={bucket}
        alt={images[0]?.alt ?? name}
        ratio="21 / 9"
        radius="xl"
        className="min-h-[320px]"
        sizes="100vw"
        priority
      />
    );
  }

  const [lead, ...rest] = images;

  return (
    <div className="flex flex-wrap gap-3">
      <PhotoFrame
        src={lead.url}
        bucket={bucket}
        alt={lead.alt ?? name}
        radius="xl"
        className="min-h-[420px] min-w-0 shrink grow-[2] basis-[400px]"
        sizes="(max-width: 768px) 100vw, 760px"
        priority
      />
      <div className="flex min-w-0 shrink grow basis-[200px] flex-col gap-3">
        {rest.slice(0, 2).map((img, i) => (
          <PhotoFrame
            key={img.id}
            src={img.url}
            bucket={bucket}
            alt={img.alt ?? name}
            radius="xl"
            className="min-h-[204px] flex-1"
            sizes="(max-width: 768px) 100vw, 380px"
          >
            {/* The label switches rather than the pill disappearing. */}
            {i === 1 && (
              <span className="absolute bottom-4 right-4 inline-flex h-9 items-center rounded-full border border-ink-200 bg-white px-4 text-caption font-medium text-ink-900">
                {galleryPillLabel(images.length)}
              </span>
            )}
          </PhotoFrame>
        ))}
      </div>
    </div>
  );
}

"use client";

// components/patterns/gallery.tsx
//
// Three photographs fill the mosaic exactly — one large frame plus two stacked.
// Below three, a single wide frame beats a grid of grey boxes.
//
// The mosaic is now the door to the rest. It used to show three photographs and
// label the pill "All 12 photos" as a <span>, so the site named nine more and
// offered no way to reach them; every frame is a button now and the pill opens
// the viewer. With one or two photographs the layout is unchanged but the second
// one is finally reachable — before, it was uploaded, stored, and never shown.
//
// This became a client component when the viewer landed. It is presentational
// and every frame needs a handler, so a wrapper per frame would have cost more
// than it saved. The three detail pages above it stay server components and pass
// plain data.

import { useState } from "react";
import { galleryLayout, galleryPillLabel } from "@/lib/design/density";
import { getImageUrl, type StorageBucket } from "@/lib/image-urls";
import { PhotoFrame } from "./photo-frame";
import { Lightbox } from "./lightbox";

export interface GalleryProps {
  images: { id: string; url: string; alt: string | null }[];
  /** Used for the single frame when there are no gallery images at all. */
  cover: string | null;
  bucket: StorageBucket;
  name: string;
}

export function Gallery({ images, cover, bucket, name }: GalleryProps) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  // With no gallery rows there is only the cover, and a viewer holding one
  // photograph that is already full-bleed on the page is a control that does
  // nothing. The frames stay inert in that case.
  const viewable = images.length > 0;

  const viewer = viewable ? (
    <Lightbox
      images={images.map((i) => ({ ...i, url: getImageUrl(bucket, i.url) }))}
      openAt={openAt}
      onClose={() => setOpenAt(null)}
      name={name}
    />
  ) : null;

  if (galleryLayout(images.length) === "single") {
    const src = images[0]?.url ?? cover;
    const frame = (
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

    return (
      <>
        {viewable ? (
          <Trigger onOpen={() => setOpenAt(0)} name={name} index={0} total={images.length}>
            {frame}
          </Trigger>
        ) : (
          frame
        )}
        {viewer}
      </>
    );
  }

  const [lead, ...rest] = images;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Trigger
          onOpen={() => setOpenAt(0)}
          name={name}
          index={0}
          total={images.length}
          className="min-w-0 shrink grow-[2] basis-[400px]"
        >
          <PhotoFrame
            src={lead.url}
            bucket={bucket}
            alt={lead.alt ?? name}
            radius="xl"
            className="min-h-[420px]"
            sizes="(max-width: 768px) 100vw, 760px"
            priority
          />
        </Trigger>

        <div className="flex min-w-0 shrink grow basis-[200px] flex-col gap-3">
          {rest.slice(0, 2).map((img, i) => (
            <Trigger
              key={img.id}
              onOpen={() => setOpenAt(i + 1)}
              name={name}
              index={i + 1}
              total={images.length}
              className="flex-1"
            >
              <PhotoFrame
                src={img.url}
                bucket={bucket}
                alt={img.alt ?? name}
                radius="xl"
                className="min-h-[204px] h-full"
                sizes="(max-width: 768px) 100vw, 380px"
              >
                {/* The label switches rather than the pill disappearing. It sits
                    inside the frame's own button, so it is decoration here — the
                    whole frame is the control. */}
                {i === 1 && (
                  <span className="absolute bottom-4 right-4 inline-flex h-9 items-center rounded-full border border-ink-200 bg-white px-4 text-caption font-medium text-ink-900">
                    {galleryPillLabel(images.length)}
                  </span>
                )}
              </PhotoFrame>
            </Trigger>
          ))}
        </div>
      </div>
      {viewer}
    </>
  );
}

/**
 * Makes a frame open the viewer. A button rather than a div with onClick, so it
 * is reachable by keyboard and announced as something that can be activated.
 */
function Trigger({
  onOpen,
  name,
  index,
  total,
  className,
  children,
}: {
  onOpen: () => void;
  name: string;
  index: number;
  total: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View photograph ${index + 1} of ${total} of ${name}`}
      className={`group block cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-deep ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

"use client";

// components/patterns/lightbox.tsx
//
// The full-screen photo viewer behind the gallery mosaic.
//
// It exists because `galleryPillLabel` has always produced "All 12 photos" and
// the pill rendering it was a <span> — the site told people there were nine more
// photographs and gave them no way to see any of them. The mosaic shows three.
//
// Everything here is one client component so that Gallery, and the three detail
// pages above it, stay server components. The photographs are passed in as plain
// data; nothing is fetched.
//
// Interaction is deliberately conventional: arrows and swipe to move, Escape to
// close, click the backdrop to close. People have used this control before and
// the worst thing it could do is be inventive.

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { optimizedSrc, optimizedSrcSet } from "@/lib/design/optimized-image";

export interface LightboxImage {
  id: string;
  /** A resolved media URL, as the gallery already has. */
  url: string;
  alt: string | null;
}

export interface LightboxProps {
  images: LightboxImage[];
  /** Index to open at, or null for closed. */
  openAt: number | null;
  onClose: () => void;
  /** Falls back as the alt text for photographs that have none. */
  name: string;
}

export function Lightbox({ images, openAt, onClose, name }: LightboxProps) {
  const [index, setIndex] = useState(openAt ?? 0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const open = openAt !== null;

  // Follow the index the caller opened at, including when the viewer is already
  // open and someone clicks a different frame behind it.
  //
  // Adjusted during render rather than in an effect. React documents this as the
  // way to reset state when a prop changes: an effect would render once with the
  // stale index, then again with the right one, so opening at photograph 7 would
  // show photograph 1 for a frame first.
  const [lastOpenAt, setLastOpenAt] = useState(openAt);
  if (openAt !== lastOpenAt) {
    setLastOpenAt(openAt);
    if (openAt !== null) setIndex(openAt);
  }

  const count = images.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count]
  );

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);

    // The page behind must not scroll while the overlay is up, and restoring the
    // previous value rather than clearing it means we do not fight anything else
    // that may have set it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus moves into the dialog so the keyboard handlers are reachable without
    // a click, and so a screen reader announces the viewer rather than leaving
    // the user on the page underneath.
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose, go]);

  if (!open || count === 0) return null;

  const current = images[index];
  const src = optimizedSrc(current.url, 2048);
  const srcSet = optimizedSrcSet(current.url);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} photographs`}
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const from = touchStartX.current;
        touchStartX.current = null;
        if (from === null) return;
        const dx = e.changedTouches[0].clientX - from;
        // Far enough to be a swipe rather than a tap that drifted.
        if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
      }}
      className="fixed inset-0 z-[100] flex flex-col bg-ink-900/95 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between px-[var(--gutter)] py-5">
        <span className="text-caption font-medium text-white/80 tabular-nums">
          {index + 1} / {count}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photographs"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* stopPropagation so a click on the photograph itself does not close the
          viewer — only the backdrop around it does. */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-[var(--gutter)] pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        {count > 1 && (
          <Arrow side="left" onClick={() => go(-1)} label="Previous photograph" />
        )}

        <img
          key={current.id}
          src={src}
          srcSet={srcSet ?? undefined}
          sizes="100vw"
          alt={current.alt || name}
          decoding="async"
          // Sized by CSS, not by the image's own intrinsic size, and that is a
          // fix rather than a preference. With `max-w-full max-h-full` the
          // browser sizes the image intrinsically — and because our srcset
          // declares widths the optimiser will not actually produce (it never
          // upscales past the source), it treats a 1024px file delivered against
          // a 3000w descriptor as a high-density image and renders it at 516 CSS
          // px in the middle of a full-screen viewer. Giving the box the size and
          // letting object-contain fit the photograph inside removes the
          // descriptor from the sizing decision entirely.
          className="h-full w-full rounded-lg object-contain"
        />

        {count > 1 && (
          <Arrow side="right" onClick={() => go(1)} label="Next photograph" />
        )}
      </div>
    </div>
  );
}

function Arrow({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      {side === "left" ? (
        <ChevronLeft className="h-6 w-6" />
      ) : (
        <ChevronRight className="h-6 w-6" />
      )}
    </button>
  );
}

// components/patterns/photo-frame.tsx
//
// Every photograph on the site goes through here, so the placeholder, the radius
// assignments and the hover scale are decided once.
//
// Radius is fixed by role, never mixed within an element class: 24px for
// photography and hero frames, 16px inside a card whose own corner is already 16.

import { cn } from "@/lib/utils";
import type { StorageBucket } from "@/lib/image-urls";
import { responsiveSource } from "@/lib/design/responsive-image";

export interface PhotoFrameProps {
  /** A bare filename as stored, or null. */
  src: string | null;
  bucket: StorageBucket;
  alt: string;
  /**
   * CSS aspect-ratio, e.g. "4 / 3". Safe to combine with a min-height: the frame
   * is capped at its container's width, so the ratio governs height and the
   * min-height raises it where the ratio would be too shallow to read.
   */
  ratio?: string;
  radius?: "none" | "lg" | "xl";
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Image lifts slightly on hover of the enclosing group. */
  zoom?: boolean;
  children?: React.ReactNode;
}

export function PhotoFrame({
  src,
  bucket,
  alt,
  ratio,
  radius = "none",
  className,
  sizes = "(max-width: 768px) 100vw, 420px",
  priority = false,
  zoom = false,
  children,
}: PhotoFrameProps) {
  return (
    <div
      className={cn(
        // max-w-full is load-bearing, not a precaution. An aspect-ratio box is
        // free to resolve its width *from* its height, so `ratio="21 / 9"` with
        // `min-h-[280px]` made the guide hero 653px wide inside a 390px phone —
        // 280 x 21/9 — and the whole page scrolled sideways. Capping the width
        // makes the ratio set the height and the min-height raise it, which is
        // what every call site here means by passing both.
        "relative max-w-full min-w-0 overflow-hidden",
        radius === "lg" && "rounded-lg",
        radius === "xl" && "rounded-xl",
        !src && "photo-placeholder",
        className
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {src && <Frame src={src} bucket={bucket} alt={alt} sizes={sizes} priority={priority} zoom={zoom} />}
      {children}
    </div>
  );
}

/**
 * A plain <img> rather than next/image, because the project runs with
 * `unoptimized: true` — next/image would give us the same single-source tag with
 * extra indirection, and no way to pass the srcset we pre-generated. This mirrors
 * what `fill` does: absolutely positioned, covering, inside a positioned parent.
 */
function Frame({
  src,
  bucket,
  alt,
  sizes,
  priority,
  zoom,
}: {
  src: string;
  bucket: StorageBucket;
  alt: string;
  sizes: string;
  priority: boolean;
  zoom: boolean;
}) {
  const { src: fallback, srcSet } = responsiveSource(bucket, src);
  return (
    <img
      src={fallback}
      srcSet={srcSet ?? undefined}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn(
        "absolute inset-0 h-full w-full object-cover",
        zoom &&
          "transition-transform duration-[220ms] ease-[var(--ease-standard)] group-hover:scale-[1.015]"
      )}
    />
  );
}

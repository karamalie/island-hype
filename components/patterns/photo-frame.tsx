// components/patterns/photo-frame.tsx
//
// Every photograph on the site goes through here, so the placeholder, the radius
// assignments and the hover scale are decided once.
//
// Radius is fixed by role, never mixed within an element class: 24px for
// photography and hero frames, 16px inside a card whose own corner is already 16.

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getImageUrl, type StorageBucket } from "@/lib/image-urls";

export interface PhotoFrameProps {
  /** A bare filename as stored, or null. */
  src: string | null;
  bucket: StorageBucket;
  alt: string;
  /** CSS aspect-ratio, e.g. "4 / 3". Omit when a min-height drives the box. */
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
        "relative overflow-hidden",
        radius === "lg" && "rounded-lg",
        radius === "xl" && "rounded-xl",
        !src && "photo-placeholder",
        className
      )}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {src && (
        <Image
          src={getImageUrl(bucket, src)}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover",
            zoom &&
              "transition-transform duration-[220ms] ease-[var(--ease-standard)] group-hover:scale-[1.015]"
          )}
        />
      )}
      {children}
    </div>
  );
}

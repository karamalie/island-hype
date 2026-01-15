// components/ui/image-card.tsx
import { forwardRef, HTMLAttributes, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ImageCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "rounded" | "circular";
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  hover?: boolean;
}

/**
 * ImageCard - Container for tour/destination images
 * Reference: Image 2 carousel images, Image 1 hero carousel
 */
const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(
  (
    {
      className,
      variant = "default",
      aspectRatio = "auto",
      hover = false,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "rounded-2xl",
      rounded: "rounded-3xl",
      circular: "rounded-full",
    };

    const aspects = {
      square: "aspect-square",
      portrait: "aspect-[3/4]",
      landscape: "aspect-[4/3]",
      auto: "",
    };

    const hoverStyles = hover
      ? "transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden bg-[var(--color-gray-100)]",
          variants[variant],
          aspects[aspectRatio],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ImageCard.displayName = "ImageCard";

/**
 * ImageCardImage - The actual image inside ImageCard
 */
interface ImageCardImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  overlay?: boolean;
}

const ImageCardImage = forwardRef<HTMLImageElement, ImageCardImageProps>(
  ({ className, overlay = false, alt = "", ...props }, ref) => (
    <>
      <img
        ref={ref}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        {...props}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      )}
    </>
  )
);

ImageCardImage.displayName = "ImageCardImage";

/**
 * ImageCardContent - Overlay content (title, description)
 */
const ImageCardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("absolute bottom-0 left-0 right-0 p-4 text-white", className)}
    {...props}
  />
));

ImageCardContent.displayName = "ImageCardContent";

/**
 * ImageCardInfo - Card info section below image (for cards with external info)
 */
const ImageCardInfo = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4", className)} {...props} />
));

ImageCardInfo.displayName = "ImageCardInfo";

export { ImageCard, ImageCardImage, ImageCardContent, ImageCardInfo };

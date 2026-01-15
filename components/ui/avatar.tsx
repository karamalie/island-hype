// components/ui/avatar.tsx
import { forwardRef, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = "md", src, alt, fallback, ...props }, ref) => {
    const sizes = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
      xl: "h-16 w-16 text-xl",
    };

    if (!src && fallback) {
      return (
        <div
          className={cn(
            "rounded-full bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-700)] flex items-center justify-center font-medium text-[var(--color-gray-600)] dark:text-[var(--color-gray-300)]",
            sizes[size],
            className
          )}
        >
          {fallback}
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover border-2 border-white dark:border-[var(--color-gray-800)] shadow-sm",
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Avatar.displayName = "Avatar";

const AvatarGroup = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { max?: number }
>(({ className, children, max = 4, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex -space-x-2", className)} {...props}>
      {children}
    </div>
  );
});

AvatarGroup.displayName = "AvatarGroup";

import { HTMLAttributes } from "react";

export { Avatar, AvatarGroup };

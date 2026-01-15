// components/ui/badge.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-teal-500 text-white",
        secondary: "bg-gray-800 text-white",
        outline: "border border-gray-300 text-gray-700 bg-transparent",
        // White badge for dark backgrounds (glass/hero sections)
        white: "bg-white/10 backdrop-blur-sm border border-white/20 text-white",
        // Light badge for light backgrounds - USE THIS ON WHITE BACKGROUNDS
        light: "bg-gray-100 text-gray-700 border border-gray-200",
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 text-white",
        success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-800",
        error: "bg-red-100 text-red-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: ReactNode;
}

function Badge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };

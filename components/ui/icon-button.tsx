// components/ui/icon-button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white hover:bg-gray-800",
        outline:
          "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-400",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        white: "bg-white text-gray-900 hover:bg-gray-100 shadow-sm",
        // Glass variant for dark backgrounds
        glass:
          "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20",
        primary: "bg-teal-500 text-white hover:bg-teal-600",
      },
      size: {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };

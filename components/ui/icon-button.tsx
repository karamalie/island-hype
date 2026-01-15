// components/ui/icon-button.tsx
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
      default:
        "bg-white text-[var(--color-gray-700)] hover:bg-[var(--color-gray-100)] border border-[var(--border-color)] dark:bg-[var(--color-gray-800)] dark:text-[var(--color-gray-300)] dark:hover:bg-[var(--color-gray-700)]",
      outline:
        "border border-[var(--border-color)] bg-transparent hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-800)]",
      ghost:
        "bg-transparent hover:bg-[var(--color-gray-100)] dark:hover:bg-[var(--color-gray-800)]",
      glass: "glass hover:bg-white/90 dark:hover:bg-black/70",
    };

    const sizes = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };

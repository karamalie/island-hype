// components/ui/button.tsx
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "glass"
    | "dark"
    | "white"
    | "white-outline";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      // Default dark button
      primary:
        "bg-[var(--color-gray-900)] text-white hover:bg-[var(--color-gray-800)] active:bg-[var(--color-gray-950)]",
      // Light gray background
      secondary:
        "bg-[var(--color-gray-100)] text-[var(--color-gray-900)] hover:bg-[var(--color-gray-200)]",
      // Border only
      outline:
        "border border-[var(--color-gray-300)] bg-transparent text-[var(--color-gray-900)] hover:bg-[var(--color-gray-100)]",
      // No background
      ghost:
        "bg-transparent text-[var(--color-gray-900)] hover:bg-[var(--color-gray-100)]",
      // Glassmorphism (for hero/dark backgrounds)
      glass: "glass-btn text-white hover:bg-white/20",
      // Solid dark
      dark: "bg-[var(--color-gray-900)] text-white hover:bg-[var(--color-gray-800)]",
      // White solid (for dark backgrounds)
      white:
        "bg-white text-[var(--color-gray-900)] hover:bg-white/90 active:bg-white/80",
      // White outline (for dark backgrounds)
      "white-outline":
        "border border-white/30 bg-transparent text-white hover:bg-white/10",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-full",
      md: "h-11 px-5 text-sm rounded-full",
      lg: "h-12 px-6 text-base rounded-full",
      xl: "h-14 px-8 text-lg rounded-full",
      icon: "h-11 w-11 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={{
          transitionDuration: "var(--motion-base)",
          transitionTimingFunction: "var(--ease-standard)",
        }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

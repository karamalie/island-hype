// components/ui/button.tsx
import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass" | "dark";
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
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out focus-ring disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[var(--color-gray-900)] text-white hover:bg-[var(--color-gray-800)] dark:bg-white dark:text-[var(--color-gray-900)] dark:hover:bg-[var(--color-gray-100)]",
      secondary:
        "bg-[var(--color-gray-100)] text-[var(--color-gray-900)] hover:bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-800)] dark:text-white dark:hover:bg-[var(--color-gray-700)]",
      outline:
        "border border-[var(--color-gray-300)] bg-transparent text-[var(--color-gray-900)] hover:bg-[var(--color-gray-100)] dark:border-[var(--color-gray-700)] dark:text-white dark:hover:bg-[var(--color-gray-800)]",
      ghost:
        "bg-transparent text-[var(--color-gray-900)] hover:bg-[var(--color-gray-100)] dark:text-white dark:hover:bg-[var(--color-gray-800)]",
      glass:
        "glass text-[var(--color-gray-900)] hover:bg-white/90 dark:text-white dark:hover:bg-black/70",
      dark: "bg-[var(--color-gray-900)] text-white hover:bg-[var(--color-gray-800)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-full",
      md: "h-10 px-5 text-sm rounded-full",
      lg: "h-12 px-6 text-base rounded-full",
      xl: "h-14 px-8 text-lg rounded-full",
      icon: "h-10 w-10 rounded-full",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
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

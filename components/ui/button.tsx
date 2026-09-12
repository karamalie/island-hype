// components/ui/button.tsx
//
// Four variants and one boolean, down from eight variants.
//
// The eight were really four treatments times two grounds: `white` and
// `white-outline` existed only to sit on a photograph, and `glass` only on a
// hero. So the ground became a prop. `onImage` is what a hero passes; everything
// else is the same four buttons it always was.

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Sitting over photography: primary goes solid white, outline goes glass. */
  onImage?: boolean;
  isLoading?: boolean;
}

const onGround: Record<ButtonVariant, string> = {
  primary: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-900",
  // teal-deep is the only teal that may hold white text.
  accent: "bg-teal-deep text-white hover:bg-teal-press active:bg-teal-press",
  outline:
    "bg-white text-ink-900 border border-ink-200 hover:border-meta-inverse hover:bg-ink-50",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-50",
};

const onPhoto: Record<ButtonVariant, string> = {
  primary: "bg-white text-ink-900 hover:bg-white/90 active:bg-white/80",
  accent: "bg-teal-deep text-white hover:bg-teal-press",
  outline: "glass-light text-white hover:bg-white/20",
  ghost: "bg-transparent text-white hover:bg-white/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-body-xs",
  md: "h-11 px-[22px] text-body-xs",
  lg: "h-[52px] px-7 text-body-m",
  icon: "h-11 w-11",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    onImage = false,
    isLoading = false,
    disabled,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium",
        "cursor-pointer transition-[background-color,border-color,box-shadow,transform]",
        "duration-[220ms] ease-[var(--ease-standard)]",
        "disabled:pointer-events-none disabled:opacity-50",
        (onImage ? onPhoto : onGround)[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Sending…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

export { Button };

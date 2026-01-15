// components/ui/slide-counter.tsx
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SlideCounterProps extends HTMLAttributes<HTMLDivElement> {
  current: number;
  total: number;
  variant?: "light" | "dark";
}

/**
 * SlideCounter - Display current/total slide numbers (01/05)
 * Reference: Image 1 bottom left
 */
const SlideCounter = forwardRef<HTMLDivElement, SlideCounterProps>(
  ({ className, current, total, variant = "light", ...props }, ref) => {
    const colors = {
      light: {
        current: "text-white",
        total: "text-white/50",
      },
      dark: {
        current: "text-[var(--text-primary)]",
        total: "text-[var(--text-tertiary)]",
      },
    };

    // Pad numbers with leading zeros
    const currentStr = current.toString().padStart(2, "0");
    const totalStr = total.toString().padStart(2, "0");

    return (
      <div
        ref={ref}
        className={cn("flex items-baseline gap-0.5", className)}
        {...props}
      >
        <span className={cn("text-5xl font-light", colors[variant].current)}>
          {currentStr}
        </span>
        <span className={cn("text-xl", colors[variant].total)}>
          /{totalStr}
        </span>
      </div>
    );
  }
);

SlideCounter.displayName = "SlideCounter";

export { SlideCounter };

// components/ui/progress-bar.tsx
export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  variant?: "default" | "white";
}

/**
 * ProgressBar - Linear progress indicator
 * Reference: Image 2 carousel progress
 */
const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, variant = "default", ...props }, ref) => {
    const variants = {
      default: {
        track: "bg-[var(--color-gray-200)]",
        fill: "bg-[var(--color-gray-900)]",
      },
      white: {
        track: "bg-white/20",
        fill: "bg-white",
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          "h-0.5 rounded-full overflow-hidden",
          variants[variant].track,
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            variants[variant].fill
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };

// components/ui/pill.tsx
//
// Filter affordances. Heights match the button scale (36 / 44) so a filter row
// lines up with a CTA beside it rather than sitting a few pixels off.
//
// `selected` is the one place in the system where teal fills a surface.

import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type PillVariant = "solid" | "outline" | "selected";
export type PillSize = "sm" | "md";

export interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillVariant;
  size?: PillSize;
}

const variants: Record<PillVariant, string> = {
  solid: "bg-ink-900 text-white font-medium",
  outline: "bg-white border border-ink-200 text-ink-700 hover:bg-ink-50 hover:border-meta-inverse",
  selected: "bg-teal-tint border border-teal-bright text-teal-deep font-medium",
};

const sizes: Record<PillSize, string> = {
  sm: "h-9 px-4 text-body-xs",
  md: "h-11 px-5 text-body-xs",
};

const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill(
  { className, variant = "outline", size = "sm", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full",
        "transition-colors duration-[220ms] ease-[var(--ease-standard)]",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

function PillRow({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
}

export { Pill, PillRow };

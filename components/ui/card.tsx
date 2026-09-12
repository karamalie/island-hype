// components/ui/card.tsx
//
// Three variants, down from eight. The five that went were the glass cards, and
// glass does not belong on something that scrolls over flat ground — it only
// reads as glass when there is a photograph behind it.
//
// The rule the old set broke: a resting card uses a border, not a shadow. Shadow
// is the hover state, so it means "this lifts" rather than decorating everything.

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "image-overlay" | "elevated";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Lift on hover. Only for cards that are themselves a link. */
  interactive?: boolean;
}

const variants: Record<CardVariant, string> = {
  default: "bg-white border border-ink-200 rounded-lg",
  // The scrim is mandatory, not optional: text over an unscrimmed photograph is
  // legible only by luck.
  "image-overlay": "rounded-xl overflow-hidden relative",
  // The booking rail. The only card with a resting shadow.
  elevated: "bg-white border border-ink-200 rounded-lg shadow-card-hover",
};

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = "default", interactive = false, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        variants[variant],
        interactive &&
          "transition-[box-shadow,transform] duration-[220ms] ease-[var(--ease-standard)] hover:shadow-card-hover hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  );
});

export { Card };

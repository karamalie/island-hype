// components/ui/card.tsx
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "outline"
    | "elevated"
    | "glass"
    | "glass-dark"
    | "clean" // No border, just rounded
    | "clean-elevated" // Soft shadow for light backgrounds
    | "clean-bordered"; // Subtle border
  hover?: boolean; // Add hover lift effect
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const variants = {
      // Default with border
      default: "bg-white border border-[var(--border-color)]",
      // Border only, transparent
      outline: "bg-transparent border border-[var(--border-color)]",
      // Shadow elevation
      elevated: "bg-white shadow-lg",
      // Glass for image/dark backgrounds
      glass: "glass-card",
      // Dark glass
      "glass-dark": "glass-dark",
      // Clean - just white rounded (no border/shadow)
      clean: "bg-white",
      // Clean with soft shadow (for light backgrounds like Image 2)
      "clean-elevated": "bg-white shadow-soft",
      // Clean with subtle border
      "clean-bordered": "bg-white border border-[var(--color-gray-200)]",
    };

    const hoverStyles = hover
      ? "transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl overflow-hidden",
          variants[variant],
          hoverStyles,
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0 flex items-center", className)}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };

// components/ui/section.tsx
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  tone?: "default" | "muted" | "inverse";
  surface?: "plain" | "soft" | "brand" | "deep" | "sand-lagoon";
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "lg", tone = "default", surface, ...props }, ref) => {
    const spacings = {
      none: "",
      sm: "py-8 md:py-12",
      md: "py-12 md:py-16",
      lg: "py-16 md:py-24",
      xl: "py-24 md:py-32",
    };
    const tones = {
      default: "bg-white text-gray-900",
      muted: "bg-gray-50 text-gray-900",
      inverse: "bg-gray-950 text-white",
    };
    const surfaces = {
      plain: "bg-white text-gray-900",
      soft: "bg-maldives-soft text-maldives-ink",
      brand: "bg-maldives-brand text-white",
      deep: "bg-maldives-deep text-white",
      "sand-lagoon": "bg-maldives-sand-lagoon text-maldives-ink",
    };

    return (
      <section
        ref={ref}
        className={cn(
          spacings[spacing],
          surface ? surfaces[surface] : tones[tone],
          className
        )}
        {...props}
      />
    );
  }
);

Section.displayName = "Section";

export { Section };

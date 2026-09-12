// components/ui/section.tsx
//
// Three tones. The five `maldives-*` surfaces are gone — they were five ways to
// say "tinted", and the redesign has exactly two grounds plus the footer's ink.
//
// Vertical rhythm comes from --section-y (96px desktop, 56px mobile) rather than
// per-section padding, so the whole page breathes at one interval.

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SectionTone = "plain" | "muted" | "inverse";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  /** Hairlines that separate a tinted band from the white above and below it. */
  bordered?: "top" | "both" | "none";
  /** Suppress the built-in vertical rhythm, for a section that owns its spacing. */
  flush?: boolean;
}

const tones: Record<SectionTone, string> = {
  plain: "bg-white text-ink-900",
  muted: "bg-ink-50 text-ink-900",
  inverse: "bg-ink-900 text-white",
};

const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { className, tone = "plain", bordered = "none", flush = false, ...props },
  ref
) {
  return (
    <section
      ref={ref}
      className={cn(
        tones[tone],
        bordered === "top" && "border-t border-ink-200",
        bordered === "both" && "border-y border-ink-200",
        className
      )}
      style={
        flush ? undefined : { paddingBlock: "var(--section-y)" }
      }
      {...props}
    />
  );
});

export { Section };

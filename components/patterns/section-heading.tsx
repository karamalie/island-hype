// components/patterns/section-heading.tsx
//
// The eyebrow / heading / lede block that opens most sections, optionally with
// something pinned to its right (a filter row, a text link).
//
// The measure cap is in px rather than em on purpose: a max-width in em on a
// wrapper resolves against the wrapper's own font size, not the heading's, so an
// em cap around display type is silently wrong.

import { Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  aside?: React.ReactNode;
  className?: string;
  size?: "m" | "l";
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  aside,
  className,
  size = "m",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-wrap items-end justify-between gap-6",
        className
      )}
    >
      <div className="min-w-0 max-w-[620px]">
        {eyebrow && <Label className="mb-4">{eyebrow}</Label>}
        <h2
          className={cn(
            "m-0 text-ink-900",
            size === "l" ? "text-display-m" : "text-[clamp(28px,3.2vw,40px)] font-medium leading-[1.14] tracking-[-0.02em]"
          )}
        >
          {title}
        </h2>
        {lede && (
          <p className="m-0 mt-4 text-body-l text-ink-700">{lede}</p>
        )}
      </div>
      {aside}
    </div>
  );
}

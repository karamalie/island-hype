// components/ui/badge.tsx
//
// The small mono marker: a package's badge, a stay's type, a mono tag beside a
// suggestion. 12px radius, 24px tall, uppercase mono.
//
// Two grounds, because the badge sits on a photograph in one place and on white
// in another — and on the photograph it needs to be the solid one.

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "on-photo" | "tint" | "quiet" | "offer";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  "on-photo": "bg-white text-teal-deep",
  tint: "bg-teal-tint text-teal-deep",
  quiet: "bg-ink-50 border border-ink-200 text-meta",
  // An offer has to out-rank the package's own badge, which sits next to it on
  // the same photograph, so it takes the solid fill. teal-deep is the only teal
  // in the palette permitted to carry white text.
  offer: "bg-teal-deep text-white",
};

export function Badge({ className, tone = "tint", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-md px-2.5",
        "font-mono text-label-sm uppercase",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

/** The mono eyebrow above a heading, and the label in a spec sheet. */
export function Label({
  className,
  as: Tag = "div",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "div" | "span" | "dt" }) {
  return (
    <Tag
      className={cn("font-mono text-label uppercase text-meta", className)}
      {...props}
    />
  );
}

/** The ✦ mark. A text glyph, not an SVG — the brief is explicit about that. */
export function Mark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("shrink-0 text-teal-bright", className)}>
      ✦
    </span>
  );
}

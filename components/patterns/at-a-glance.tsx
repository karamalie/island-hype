// components/patterns/at-a-glance.tsx
//
// The label/value cells under a detail page's gallery.
//
// Cells with no value are dropped, so a package missing "best months" shows five
// cells rather than six with one blank. The grid stays even because the tracks
// are fixed, not content-sized.

import { cn } from "@/lib/utils";

export interface GlanceCell {
  label: string;
  value: string | null;
}

export function AtAGlance({
  cells,
  layout = "grid2",
  className,
}: {
  cells: GlanceCell[];
  layout?: "grid2" | "autoFit";
  className?: string;
}) {
  const present = cells.filter((c) => c.value);
  if (present.length === 0) return null;

  return (
    <dl
      className={cn("m-0 grid gap-x-8", className)}
      style={{
        gridTemplateColumns:
          layout === "grid2"
            ? "repeat(2, minmax(0, 1fr))"
            : "repeat(auto-fit, minmax(200px, 1fr))",
      }}
    >
      {present.map((c) => (
        <div key={c.label} className="border-t border-ink-200 py-3.5">
          <dt className="mb-1 font-mono text-label-sm uppercase text-meta">
            {c.label}
          </dt>
          <dd className="m-0 text-body-s text-ink-900">{c.value}</dd>
        </div>
      ))}
    </dl>
  );
}

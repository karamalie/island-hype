// components/patterns/spec-sheet.tsx
//
// The label/value rows that carry a package's facts.
//
// Two forms, and the difference matters more than it looks:
//
//   stacked — label left, value right, hairline above each row. Used in the card.
//   grid3   — labels above values in a FIXED three-track grid. Used in the wide
//             row. Never a wrapping flex row: a flex row breaks after two items
//             on one card and three on another depending on string length, and
//             the cards then read as two misaligned tables.
//
// A row whose value is null is dropped entirely, so a package with no meal plan
// shows two rows rather than a label with nothing beside it.

import { cn } from "@/lib/utils";

export interface SpecRow {
  label: string;
  value: string | null;
}

export function SpecSheet({
  rows,
  layout = "stacked",
  className,
}: {
  rows: SpecRow[];
  layout?: "stacked" | "grid3";
  className?: string;
}) {
  const present = rows.filter((r) => r.value);
  if (present.length === 0) return null;

  if (layout === "grid3") {
    return (
      <dl
        className={cn("m-0 grid gap-6", className)}
        style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
      >
        {present.map((r) => (
          <div key={r.label} className="min-w-0">
            <dt className="mb-1 font-mono text-label-sm uppercase text-meta">
              {r.label}
            </dt>
            <dd className="m-0 text-body-xs text-ink-900">{r.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl className={cn("m-0 flex flex-col", className)}>
      {present.map((r, i) => (
        <div
          key={r.label}
          className={cn(
            "flex items-baseline justify-between gap-4 border-t border-ink-200 py-[11px]",
            i === present.length - 1 && "border-b"
          )}
        >
          <dt className="shrink-0 font-mono text-label-sm uppercase text-meta">
            {r.label}
          </dt>
          <dd className="m-0 text-right text-body-xs text-ink-900">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

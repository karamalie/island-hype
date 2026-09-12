// components/patterns/season-calendar.tsx
//
// Twelve month cells with a coloured bar each.
//
// The middle band is labelled per location — "Mantas" for Baa — because the thing
// that makes a month special is different everywhere, and a generic "Good" would
// be saying nothing.
//
// Renders nothing when a location has no season rows, rather than twelve empty
// boxes implying we have no opinion about any month.

import type { SeasonState } from "@prisma/client";

const BAR: Record<SeasonState, string> = {
  BEST: "bg-teal-deep",
  HIGHLIGHT: "bg-teal-bright",
  WETTER: "bg-ink-200",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function SeasonCalendar({
  season,
  highlightLabel,
  note,
}: {
  season: { month: number; state: SeasonState }[];
  highlightLabel: string | null;
  note?: string | null;
}) {
  if (season.length === 0) return null;

  const byMonth = new Map(season.map((s) => [s.month, s.state]));
  const hasHighlight = season.some((s) => s.state === "HIGHLIGHT");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-5">
        <h2 className="m-0 text-[clamp(24px,2.6vw,32px)] font-medium leading-[1.18] tracking-[-0.015em]">
          When to come
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <LegendKey className="bg-teal-deep" label="Best" />
          {hasHighlight && (
            <LegendKey className="bg-teal-bright" label={highlightLabel ?? "Notable"} />
          )}
          <LegendKey className="bg-ink-200" label="Wetter" />
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(76px, 1fr))" }}
      >
        {MONTHS.map((label, i) => {
          const state = byMonth.get(i + 1);
          return (
            <div
              key={label}
              className="rounded-md border border-ink-200 px-2.5 py-3 text-center"
            >
              <div className="mb-2 font-mono text-label uppercase text-ink-700">
                {label}
              </div>
              <div
                className={`h-1.5 rounded-[3px] ${state ? BAR[state] : "bg-transparent"}`}
              />
            </div>
          );
        })}
      </div>

      {note && (
        <p className="m-0 mt-4 max-w-[34em] text-body-xs leading-[22px] text-meta">
          {note}
        </p>
      )}
    </div>
  );
}

function LegendKey({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-caption text-ink-700">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}

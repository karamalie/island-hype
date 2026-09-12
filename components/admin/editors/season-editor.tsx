"use client";

// components/admin/editors/season-editor.tsx
//
// The twelve-month strip on an island page.
//
// Each month is a button that cycles through the three states rather than a
// dropdown per month — twelve dropdowns is a form nobody finishes, and cycling
// means the whole year can be set in a dozen clicks.
//
// The editor shows the real coloured bars, at the real colours, in the real
// order. Someone setting this should be looking at the thing the guest will see,
// not at a table of enum names.

import { useMemo, useState } from "react";
import type { SeasonState } from "@prisma/client";
import { FormField, inputStyles } from "@/components/admin/ui/form-field";
import { PreviewNote, SavePanel } from "@/components/admin/ui/save-panel";
import { updateLocationSeason } from "@/lib/actions/editorial";
import { updateLocationSeasonLabel } from "@/lib/actions/locations";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Cycle order: unset → best → highlight → wetter → unset. */
const CYCLE: (SeasonState | null)[] = [null, "BEST", "HIGHLIGHT", "WETTER"];

const SWATCH: Record<string, string> = {
  BEST: "bg-[#007979]",
  HIGHLIGHT: "bg-[#24B1B1]",
  WETTER: "bg-[#D9D9D9]",
  none: "bg-transparent",
};

export interface SeasonEditorProps {
  locationId: string;
  locationName: string;
  initialMonths: Record<number, SeasonState>;
  initialLabel: string;
}

export function SeasonEditor({
  locationId,
  locationName,
  initialMonths,
  initialLabel,
}: SeasonEditorProps) {
  const [months, setMonths] = useState<Record<number, SeasonState | null>>(() => {
    const out: Record<number, SeasonState | null> = {};
    for (let m = 1; m <= 12; m++) out[m] = initialMonths[m] ?? null;
    return out;
  });
  const [label, setLabel] = useState(initialLabel);
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({ months: initialMonths, label: initialLabel })
  );

  const normalised = useMemo(() => {
    const out: Record<number, SeasonState> = {};
    for (let m = 1; m <= 12; m++) if (months[m]) out[m] = months[m] as SeasonState;
    return out;
  }, [months]);

  const dirty = useMemo(
    () => JSON.stringify({ months: normalised, label }) !== baseline,
    [normalised, label, baseline]
  );

  const usesHighlight = Object.values(months).includes("HIGHLIGHT");
  const anySet = Object.values(months).some(Boolean);

  function cycle(month: number) {
    const current = months[month] ?? null;
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    setMonths({ ...months, [month]: next });
  }

  return (
    <SavePanel
      title="When to come"
      help={`Colours the twelve-month strip on the ${locationName} page. Click a month to change it. Leave every month unset and the strip is hidden from the site.`}
      saveLabel="Save the year"
      dirty={dirty}
      onSave={async () => {
        const a = await updateLocationSeason(
          locationId,
          Object.entries(months).map(([m, state]) => ({ month: Number(m), state }))
        );
        if (!a.success) return a;
        const b = await updateLocationSeasonLabel(locationId, label);
        if (b.success) setBaseline(JSON.stringify({ months: normalised, label }));
        return b;
      }}
    >
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <Key className={SWATCH.BEST} label="Best — flat water, clear, peak" />
        <Key
          className={SWATCH.HIGHLIGHT}
          label={`Highlight — ${label.trim() || "name it below"}`}
        />
        <Key className={SWATCH.WETTER} label="Wetter — cheaper, choppier" />
        <span className="text-slate-400">Click again to clear a month.</span>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {MONTHS.map((name, i) => {
          const month = i + 1;
          const state = months[month];
          return (
            <button
              key={name}
              type="button"
              onClick={() => cycle(month)}
              aria-label={`${name}: ${state ? state.toLowerCase() : "not set"}. Click to change.`}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-center transition-colors",
                state ? "border-slate-300 bg-white" : "border-dashed border-slate-200 bg-slate-50",
                "hover:border-slate-400"
              )}
            >
              <span className="mb-2 block font-mono text-[11px] uppercase text-slate-600">
                {name}
              </span>
              <span
                className={cn(
                  "block h-1.5 rounded-full",
                  state ? SWATCH[state] : "bg-slate-200"
                )}
              />
            </button>
          );
        })}
      </div>

      {!anySet && (
        <p className="mb-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
          Nothing set, so the strip is hidden on the site. Start with the dry
          months — December to April is the usual answer.
        </p>
      )}

      <FormField
        label="What makes the highlight months special"
        description="Only needed if you have used the middle colour. One or two words — it becomes the label in the key on the site."
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Mantas"
          className={inputStyles}
          disabled={!usesHighlight}
        />
      </FormField>
      {usesHighlight && (
        <PreviewNote>
          the key reads <strong>{label.trim() || "Notable"}</strong> beside the
          middle colour
        </PreviewNote>
      )}
    </SavePanel>
  );
}

function Key({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}

"use client";

// components/admin/editors/stay-types-editor.tsx
//
// Which of the five kinds of night an island offers, and what they cost there.
//
// The override fields are the reason this screen exists. A guesthouse is $65 a
// night nationally and $95 on Dharavandhoo, where the divers heading for Hanifaru
// bid the rooms up. Leaving the override blank inherits the national figure, and
// the placeholder shows what that figure is, so nobody has to go and look it up.

import { useMemo, useState } from "react";
import { FormField, inputStyles, textareaStyles } from "@/components/admin/ui/form-field";
import { EmptyNote, SavePanel } from "@/components/admin/ui/save-panel";
import { updateLocationStayTypes } from "@/lib/actions/editorial";
import { cn } from "@/lib/utils";

export interface StayTypeOption {
  id: string;
  name: string;
  band: string;
  blurb: string;
  nightlyFrom: number | null;
}

export interface StayTypeSelection {
  stayTypeId: string;
  blurb: string;
  nightlyFrom: string;
}

export function StayTypesEditor({
  locationId,
  locationName,
  allStayTypes,
  initial,
}: {
  locationId: string;
  locationName: string;
  allStayTypes: StayTypeOption[];
  initial: StayTypeSelection[];
}) {
  const [rows, setRows] = useState<StayTypeSelection[]>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(rows) !== baseline, [rows, baseline]);

  function toggle(stayTypeId: string) {
    setRows((prev) =>
      prev.some((r) => r.stayTypeId === stayTypeId)
        ? prev.filter((r) => r.stayTypeId !== stayTypeId)
        : [...prev, { stayTypeId, blurb: "", nightlyFrom: "" }]
    );
  }

  function update(stayTypeId: string, patch: Partial<StayTypeSelection>) {
    setRows((prev) =>
      prev.map((r) => (r.stayTypeId === stayTypeId ? { ...r, ...patch } : r))
    );
  }

  const badPrice = rows.some(
    (r) => r.nightlyFrom.trim() !== "" && Number.isNaN(Number(r.nightlyFrom))
  );

  return (
    <SavePanel
      title="Where guests sleep here"
      help={`Tick only the kinds of night ${locationName} actually offers. The site shows the ones you tick and says nothing about the rest — a resort island listing "guesthouse" as unavailable would be worse than not mentioning it.`}
      saveLabel="Save stay types"
      dirty={dirty}
      onSave={async () => {
        const result = await updateLocationStayTypes(
          locationId,
          rows.map((r) => ({
            stayTypeId: r.stayTypeId,
            blurb: r.blurb,
            nightlyFrom: r.nightlyFrom.trim() === "" ? null : Number(r.nightlyFrom),
          }))
        );
        if (result.success) setBaseline(JSON.stringify(rows));
        return result;
      }}
    >
      {badPrice && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
          One of the prices is not a number. Enter digits only — no dollar sign, no
          commas.
        </p>
      )}

      {allStayTypes.length === 0 ? (
        <EmptyNote>No stay types exist yet.</EmptyNote>
      ) : (
        <div className="space-y-3">
          {allStayTypes.map((st) => {
            const row = rows.find((r) => r.stayTypeId === st.id);
            const on = Boolean(row);
            return (
              <div
                key={st.id}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  on ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50/60"
                )}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(st.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">
                      {st.name}
                      <span className="ml-2 font-normal text-slate-400">{st.band}</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {st.blurb}
                    </span>
                  </span>
                </label>

                {on && row && (
                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[160px_1fr]">
                    <FormField
                      label="Price here"
                      description="Blank uses the standard figure."
                    >
                      <input
                        value={row.nightlyFrom}
                        onChange={(e) =>
                          update(st.id, { nightlyFrom: e.target.value })
                        }
                        inputMode="numeric"
                        placeholder={
                          st.nightlyFrom !== null ? String(st.nightlyFrom) : "e.g. 120"
                        }
                        className={inputStyles}
                      />
                    </FormField>
                    <FormField
                      label="Different wording for this island"
                      description="Blank uses the standard description above."
                    >
                      <textarea
                        value={row.blurb}
                        onChange={(e) => update(st.id, { blurb: e.target.value })}
                        rows={2}
                        placeholder={st.blurb}
                        className={textareaStyles}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rows.length === 0 && allStayTypes.length > 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Nothing ticked, so the &ldquo;where you&rsquo;d sleep&rdquo; section is
          hidden on this island&rsquo;s page.
        </p>
      )}
    </SavePanel>
  );
}

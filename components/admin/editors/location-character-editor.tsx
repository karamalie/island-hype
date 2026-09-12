"use client";

// components/admin/editors/location-character-editor.tsx
//
// What makes one island different from another.
//
// These three fields are the whole argument of the Locations page. When they were
// empty, every island rendered the same four facts with three of them blank, and
// the only thing left to compare was the transfer time — which made six genuinely
// different places read as six rows of travel admin. The help text says that
// outright, because the person filling this in is the only one who can fix it.

import { useMemo, useState } from "react";
import { FormField, inputStyles } from "@/components/admin/ui/form-field";
import { PreviewNote, SavePanel } from "@/components/admin/ui/save-panel";
import { updateLocationCharacter } from "@/lib/actions/locations";

export interface LocationCharacterFields {
  region: string;
  knownFor: string;
  bestMonths: string;
}

export function LocationCharacterEditor({
  locationId,
  locationName,
  initial,
}: {
  locationId: string;
  locationName: string;
  initial: LocationCharacterFields;
}) {
  const [fields, setFields] = useState<LocationCharacterFields>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(fields) !== baseline, [fields, baseline]);

  const set = (patch: Partial<LocationCharacterFields>) =>
    setFields((f) => ({ ...f, ...patch }));

  const filled = [fields.region, fields.knownFor, fields.bestMonths].filter((v) =>
    v.trim()
  ).length;

  return (
    <SavePanel
      title="What makes this island different"
      help="These three lines are how a guest tells this island apart from the other five. Without them the card falls back to showing only the transfer time, which makes every island look the same."
      saveLabel="Save details"
      dirty={dirty}
      onSave={async () => {
        const result = await updateLocationCharacter(locationId, fields);
        if (result.success) setBaseline(JSON.stringify(fields));
        return result;
      }}
    >
      {filled < 3 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          {filled === 0
            ? `Nothing filled in yet, so ${locationName}'s card shows only its transfer time.`
            : `${3 - filled} of these still empty — each blank one is a row missing from the card.`}
        </p>
      )}

      <div className="space-y-5">
        <div>
          <FormField
            label="Where it is, in a few words"
            description="The small grey line above the island name. Region first, then what kind of place it is."
          >
            <input
              value={fields.region}
              onChange={(e) => set({ region: e.target.value })}
              maxLength={120}
              placeholder="Baa · UNESCO biosphere reserve"
              className={inputStyles}
            />
          </FormField>
          {fields.region.trim() && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">On the site:</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate-500">
                {fields.region}
              </span>
            </div>
          )}
        </div>

        <div>
          <FormField
            label="Known for"
            description="The one or two things people come here for. Shown in teal on the card, so make it the reason to choose this island."
          >
            <input
              value={fields.knownFor}
              onChange={(e) => set({ knownFor: e.target.value })}
              maxLength={120}
              placeholder="Hanifaru mantas, jungle island"
              className={inputStyles}
            />
          </FormField>
          {fields.knownFor.trim() ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">On the site:</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#007979]">
                {fields.knownFor}
              </span>
            </div>
          ) : (
            <PreviewNote>the teal line is left off the card</PreviewNote>
          )}
        </div>

        <FormField
          label="Best months"
          description="When to come. Shown in the at-a-glance grid and in the island rows."
        >
          <input
            value={fields.bestMonths}
            onChange={(e) => set({ bestMonths: e.target.value })}
            maxLength={80}
            placeholder="January to April"
            className={inputStyles}
          />
        </FormField>
      </div>
    </SavePanel>
  );
}

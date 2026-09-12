"use client";

// components/admin/editors/package-display-editor.tsx
//
// The copy that appears on the package card and at the top of its page.
//
// Each field carries a live preview of the thing it produces, because the labels
// alone do not tell you much: "badge" means nothing until you see it rendered as
// the little teal pill over the photograph. The previews use the same colours and
// the same mono type as the site.

import { useMemo, useState } from "react";
import { FormField, inputStyles, selectStyles, textareaStyles } from "@/components/admin/ui/form-field";
import { PreviewNote, SavePanel } from "@/components/admin/ui/save-panel";
import { updatePackageDisplay } from "@/lib/actions/packages";

const BOARD_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "ROOM_ONLY", label: "Room only" },
  { value: "BED_AND_BREAKFAST", label: "Bed and breakfast" },
  { value: "HALF_BOARD", label: "Half-board" },
  { value: "FULL_BOARD", label: "Full-board" },
  { value: "ALL_INCLUSIVE", label: "All-inclusive" },
];

export interface PackageDisplayFields {
  mealPlan: string;
  boardBasis: string;
  badge: string;
  bestMonths: string;
  longBlurb: string;
}

export function PackageDisplayEditor({
  packageId,
  initial,
}: {
  packageId: string;
  initial: PackageDisplayFields;
}) {
  const [fields, setFields] = useState<PackageDisplayFields>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const dirty = useMemo(() => JSON.stringify(fields) !== baseline, [fields, baseline]);

  const set = (patch: Partial<PackageDisplayFields>) =>
    setFields((f) => ({ ...f, ...patch }));

  const paragraphs = fields.longBlurb
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean).length;

  return (
    <SavePanel
      title="What the card says"
      help="These are the lines a guest reads before they click. Anything you leave blank is left out of the card entirely rather than shown empty."
      saveLabel="Save card details"
      dirty={dirty}
      onSave={async () => {
        const result = await updatePackageDisplay(packageId, fields);
        if (result.success) setBaseline(JSON.stringify(fields));
        return result;
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FormField
            label="Badge"
            description="The small pill on the photo. Two or three words at most."
          >
            <input
              value={fields.badge}
              onChange={(e) => set({ badge: e.target.value })}
              maxLength={40}
              placeholder="All-inclusive"
              className={inputStyles}
            />
          </FormField>
          {fields.badge.trim() ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">On the site:</span>
              <span className="inline-flex h-6 items-center rounded-md bg-[#E8F6F6] px-2.5 font-mono text-[11px] uppercase tracking-[0.06em] text-[#007979]">
                {fields.badge}
              </span>
            </div>
          ) : (
            <PreviewNote>no pill shown</PreviewNote>
          )}
        </div>

        <div>
          <FormField
            label="Meal plan"
            description="Written out as a guest would read it. This is one of the three facts on every card."
          >
            <input
              value={fields.mealPlan}
              onChange={(e) => set({ mealPlan: e.target.value })}
              maxLength={160}
              placeholder="Half-board, one à-la-carte night"
              className={inputStyles}
            />
          </FormField>
          {fields.mealPlan.trim() ? (
            <PreviewNote>
              the card shows a <strong>Meals</strong> row reading &ldquo;
              {fields.mealPlan}&rdquo;
            </PreviewNote>
          ) : (
            <PreviewNote>
              the <strong>Meals</strong> row is left off the card
            </PreviewNote>
          )}
        </div>

        <FormField
          label="Board type"
          description="Used for filtering and sorting, not shown directly. Set it to match the meal plan above."
        >
          <select
            value={fields.boardBasis}
            onChange={(e) => set({ boardBasis: e.target.value })}
            className={selectStyles}
          >
            {BOARD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Best months"
          description="Shown in the at-a-glance grid on the package page."
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

      <div className="mt-5">
        <FormField
          label="The longer description"
          description="Two or three paragraphs, on the package page under “What the days look like”. Leave a blank line between paragraphs."
        >
          <textarea
            value={fields.longBlurb}
            onChange={(e) => set({ longBlurb: e.target.value })}
            rows={8}
            placeholder={
              "The island is small enough to walk around in fifteen minutes, which is the point.\n\nBetween January and April the water is flat and visibility runs past thirty metres."
            }
            className={textareaStyles}
          />
        </FormField>
        <PreviewNote label="Will render as">
          {paragraphs === 0
            ? "nothing — the section falls back to the short description"
            : `${paragraphs} paragraph${paragraphs === 1 ? "" : "s"}`}
        </PreviewNote>
      </div>
    </SavePanel>
  );
}

"use client";

// components/admin/editors/tag-picker.tsx
//
// Which filter buttons a package appears under.
//
// The help text names the consequence people cannot see from here: the filter row
// on the packages page only appears once there are six or more live packages.
// Tagging three packages and then wondering where the filters went is a
// predictable confusion, so the panel says it up front and tells you the count.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { EmptyNote, SavePanel } from "@/components/admin/ui/save-panel";
import { updatePackageTags } from "@/lib/actions/editorial";
import { cn } from "@/lib/utils";

export interface TagPickerProps {
  packageId: string;
  allTags: { id: string; name: string }[];
  initialTagIds: string[];
  /** Live package count, so the panel can explain whether filters are showing. */
  livePackageCount: number;
}

export function TagPicker({
  packageId,
  allTags,
  initialTagIds,
  livePackageCount,
}: TagPickerProps) {
  const [selected, setSelected] = useState<string[]>(initialTagIds);
  const [baseline, setBaseline] = useState(() => JSON.stringify([...initialTagIds].sort()));
  const dirty = useMemo(
    () => JSON.stringify([...selected].sort()) !== baseline,
    [selected, baseline]
  );

  const filtersVisible = livePackageCount >= 6;

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  return (
    <SavePanel
      title="Filter categories"
      help={
        filtersVisible
          ? `These are the filter buttons above the package list. You have ${livePackageCount} live packages, so the filters are showing on the site.`
          : `These are the filter buttons above the package list. They only appear once there are six or more live packages — you have ${livePackageCount}, so nothing is showing yet. Tagging now means they work the moment you pass six.`
      }
      saveLabel="Save categories"
      dirty={dirty}
      onSave={async () => {
        const result = await updatePackageTags(packageId, selected);
        if (result.success) setBaseline(JSON.stringify([...selected].sort()));
        return result;
      }}
    >
      {allTags.length === 0 ? (
        <EmptyNote>
          No categories exist yet. They are shared across all packages, so you
          create each one once and then tick it wherever it applies — add the
          first few under{" "}
          <Link
            href="/admin/categories"
            className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            Filter categories
          </Link>
          .
        </EmptyNote>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => {
            const on = selected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                  on
                    ? "border-slate-900 bg-slate-900 font-medium text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                )}
              >
                {on && <Check className="h-3.5 w-3.5" />}
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {selected.length === 0 && allTags.length > 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Not in any category. The package still appears in the full list — it just
          will not show up when someone filters.
        </p>
      )}

      {allTags.length > 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Need a category that isn&rsquo;t here? Add, rename or reorder them under{" "}
          <Link
            href="/admin/categories"
            className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
          >
            Filter categories
          </Link>
          .
        </p>
      )}
    </SavePanel>
  );
}

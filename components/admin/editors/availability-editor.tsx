"use client";

// components/admin/editors/availability-editor.tsx
//
// Travel window, booking window and closed dates for a package.
//
// The thing that makes this usable is the live verdict at the top: it runs the
// same `lifecycleOf` the public site runs and states the result in words — "this
// package currently shows as Ended". Without it, somebody sets a travel window
// that closed last month and has no idea they have just hidden a package from
// the homepage.
//
// Everything is optional. Blank windows mean the package is always available,
// which is what all seven were before this screen existed.

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarOff, CheckCircle2, Clock } from "lucide-react";
import { FormField, inputStyles } from "@/components/admin/ui/form-field";
import { Repeatable } from "@/components/admin/ui/repeatable";
import { EmptyNote, SavePanel } from "@/components/admin/ui/save-panel";
import { updateBlackouts } from "@/lib/actions/editorial";
import { updatePackageWindows } from "@/lib/actions/packages";
import { lifecycleOf, type PackageLifecycle } from "@/lib/design/availability";

export interface BlackoutRow {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface AvailabilityEditorProps {
  packageId: string;
  initialWindows: {
    travelStart: string;
    travelEnd: string;
    bookingStart: string;
    bookingEnd: string;
  };
  initialBlackouts: BlackoutRow[];
}

const blank = (): BlackoutRow => ({ startDate: "", endDate: "", reason: "" });

const VERDICT: Record<
  PackageLifecycle,
  { label: string; note: string; tone: string; Icon: typeof CheckCircle2 }
> = {
  open: {
    label: "Open",
    note: "Showing everywhere, bookable, and counted in the package totals.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icon: CheckCircle2,
  },
  upcoming: {
    label: "Not open yet",
    note: "Listed with a “from” date instead of a booking form. Not on the homepage.",
    tone: "border-sky-200 bg-sky-50 text-sky-800",
    Icon: Clock,
  },
  ended: {
    label: "Ended",
    note: "Greyed out at the bottom of the list, booking form replaced, and off the homepage. The page still opens so old links keep working.",
    tone: "border-amber-200 bg-amber-50 text-amber-900",
    Icon: CalendarOff,
  },
};

function toDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function AvailabilityEditor({
  packageId,
  initialWindows,
  initialBlackouts,
}: AvailabilityEditorProps) {
  const [windows, setWindows] = useState(initialWindows);
  const [blackouts, setBlackouts] = useState<BlackoutRow[]>(initialBlackouts);
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({ windows: initialWindows, blackouts: initialBlackouts })
  );

  const dirty = useMemo(
    () => JSON.stringify({ windows, blackouts }) !== baseline,
    [windows, blackouts, baseline]
  );

  // The same function the public site uses, so the verdict cannot disagree with it.
  const lifecycle = useMemo(
    () =>
      lifecycleOf({
        travel: { start: toDate(windows.travelStart), end: toDate(windows.travelEnd) },
        booking: { start: toDate(windows.bookingStart), end: toDate(windows.bookingEnd) },
      }),
    [windows]
  );

  const verdict = VERDICT[lifecycle];
  const unconstrained =
    !windows.travelStart && !windows.travelEnd && !windows.bookingStart && !windows.bookingEnd;

  const badRanges = blackouts.filter((b) => {
    const s = toDate(b.startDate);
    const e = toDate(b.endDate);
    return s && e && e < s;
  }).length;

  return (
    <SavePanel
      title="Dates and availability"
      help="Leave all four dates blank and the package is always available — that is the normal case. Fill them in when a package only runs in a season, or when you stop selling it."
      saveLabel="Save dates"
      dirty={dirty}
      onSave={async () => {
        const a = await updatePackageWindows(packageId, windows);
        if (!a.success) return a;
        const b = await updateBlackouts({ packageId }, blackouts);
        if (b.success) {
          setBaseline(JSON.stringify({ windows, blackouts }));
        }
        return b;
      }}
    >
      <div className={`mb-5 flex items-start gap-2.5 rounded-lg border px-4 py-3 ${verdict.tone}`}>
        <verdict.Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="text-xs leading-5">
          <strong className="font-semibold">
            This package currently shows as: {verdict.label}
          </strong>
          <div className="mt-0.5 opacity-90">{verdict.note}</div>
          {unconstrained && (
            <div className="mt-1 opacity-75">
              No dates set, so it is open indefinitely.
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <FormField
          label="Guests can travel from"
          description="First date a guest can arrive. Blank means no earliest date."
        >
          <input
            type="date"
            value={windows.travelStart}
            onChange={(e) => setWindows({ ...windows, travelStart: e.target.value })}
            className={inputStyles}
          />
        </FormField>
        <FormField
          label="Guests can travel until"
          description="Last date a guest can arrive. Once this passes, the package shows as Ended."
        >
          <input
            type="date"
            value={windows.travelEnd}
            onChange={(e) => setWindows({ ...windows, travelEnd: e.target.value })}
            className={inputStyles}
          />
        </FormField>
        <FormField
          label="We start selling on"
          description="Before this date the package is listed but not bookable."
        >
          <input
            type="date"
            value={windows.bookingStart}
            onChange={(e) => setWindows({ ...windows, bookingStart: e.target.value })}
            className={inputStyles}
          />
        </FormField>
        <FormField
          label="We stop selling on"
          description="Use this to close bookings while the travel dates are still in the future."
        >
          <input
            type="date"
            value={windows.bookingEnd}
            onChange={(e) => setWindows({ ...windows, bookingEnd: e.target.value })}
            className={inputStyles}
          />
        </FormField>
      </div>

      <div className="mb-2 border-t border-slate-100 pt-5">
        <h4 className="text-sm font-semibold text-slate-900">Closed dates</h4>
        <p className="mb-3 mt-1 max-w-[62ch] text-xs leading-5 text-slate-500">
          Weeks you cannot take — a refurbishment, a full island, a holiday you do
          not run. A guest who picks dates that overlap one of these is told so on
          the spot, and your reason is shown to them, so keep it something you would
          say out loud.
        </p>

        {badRanges > 0 && (
          <p className="mb-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            One of these ends before it starts. Swap the dates round — rows like
            that are skipped when you save and would block nothing.
          </p>
        )}

        <Repeatable
          rows={blackouts}
          onChange={setBlackouts}
          blank={blank}
          addLabel="Add closed dates"
          describe={(b) => b.reason || `${b.startDate || "?"} to ${b.endDate || "?"}`}
          empty={
            <EmptyNote>
              No closed dates. Every date inside the travel window above is
              bookable.
            </EmptyNote>
          }
        >
          {(row, i, update) => (
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="From">
                <input
                  type="date"
                  value={row.startDate}
                  onChange={(e) => update({ startDate: e.target.value })}
                  className={inputStyles}
                />
              </FormField>
              <FormField label="Until">
                <input
                  type="date"
                  value={row.endDate}
                  onChange={(e) => update({ endDate: e.target.value })}
                  className={inputStyles}
                />
              </FormField>
              <FormField label="Reason" description="Shown to the guest.">
                <input
                  id={`blackout-reason-${i}`}
                  value={row.reason}
                  onChange={(e) => update({ reason: e.target.value })}
                  placeholder="Island closed for refurbishment"
                  className={inputStyles}
                />
              </FormField>
            </div>
          )}
        </Repeatable>
      </div>
    </SavePanel>
  );
}

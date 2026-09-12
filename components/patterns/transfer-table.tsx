// components/patterns/transfer-table.tsx
//
// The Locations page opens with this, before any photograph, and that ordering is
// the page's argument: people choose an atoll on pictures, but the thing that
// actually shapes the week is how long you travel after you land.
//
// Text-only, so it fills the page at any inventory level. Fixed four-track grid,
// and it scrolls in its own container rather than pushing the page sideways.

import type { LocationCard } from "@/lib/data/locations";
import { formatMoney } from "@/lib/design/pricing";

export function TransferTable({
  locations,
  fromPrices,
}: {
  locations: LocationCard[];
  /** Cheapest per-person price per location slug, where one exists. */
  fromPrices: Record<string, number | undefined>;
}) {
  if (locations.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-200">
      <div className="min-w-[640px]">
        <div
          className="grid gap-4 border-b border-ink-200 bg-ink-50 px-5 py-3.5"
          style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
        >
          {["Atoll", "Transfer", "Time", "Packages from"].map((h) => (
            <span key={h} className="font-mono text-label-sm uppercase text-meta">
              {h}
            </span>
          ))}
        </div>
        {locations.map((l) => {
          const from = fromPrices[l.slug];
          return (
            <div
              key={l.slug}
              className="grid gap-4 border-b border-ink-200 px-5 py-[18px]"
              style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
            >
              <span className="min-w-0 text-body-s font-medium">{l.name}</span>
              <span className="min-w-0 text-body-s text-ink-700">
                {l.transferType ? l.transfer?.split(",")[0] : "—"}
              </span>
              <span className="min-w-0 text-body-s text-ink-700">
                {l.transferMinutes !== null ? `${l.transferMinutes} min` : "—"}
              </span>
              <span className="min-w-0 text-body-s text-ink-900">
                {from !== undefined ? `${formatMoney(from, "USD")} pp` : "—"}
              </span>
            </div>
          );
        })}
        <div className="px-5 py-3.5 text-caption leading-5 text-meta">
          Seaplanes fly in daylight only. Speedboats run to a fixed schedule in the
          evening.
        </div>
      </div>
    </div>
  );
}

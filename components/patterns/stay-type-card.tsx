// components/patterns/stay-type-card.tsx
//
// One of the five kinds of night. Appears identically on Home, Accommodations and
// a location's detail page — this is the section the brief calls a "floor": it
// needs zero inventory, so a two-package catalogue still has something below the
// fold and the footer does not ride up under the results.
//
// 24px padding, because this card has no image well. One padding value per page.

import type { ResolvedStayType } from "@/lib/data/stay-types";
import { Label } from "@/components/ui";
import { formatMoney } from "@/lib/design/pricing";

export function StayTypeCard({ stayType }: { stayType: ResolvedStayType }) {
  return (
    <div className="flex min-w-0 shrink grow basis-[260px] max-w-[380px] flex-col rounded-lg border border-ink-200 bg-white p-6">
      <Label className="mb-4">{stayType.band}</Label>
      <div className="mb-2.5 text-card-title">{stayType.name}</div>
      <p className="m-0 mb-5 text-body-s text-ink-700">{stayType.blurb}</p>
      {stayType.nightlyFrom !== null && (
        <div className="mt-auto border-t border-ink-200 pt-4 text-caption text-meta">
          From {formatMoney(stayType.nightlyFrom, "USD")} a night
        </div>
      )}
    </div>
  );
}

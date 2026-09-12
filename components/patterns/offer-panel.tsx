// components/patterns/offer-panel.tsx
//
// A live offer on a package detail page.
//
// The design problem is trust. A promotional panel is the element on a travel
// page most likely to read as a trick, so this one is built to answer the
// suspicion rather than shout over it: the discount, then the conditions, then
// the date it ends, in that order and in plain words. Nothing is hidden behind an
// asterisk, because the conditions are the first thing a sceptical reader looks
// for and burying them is what makes a page feel like a sales funnel.
//
// It carries the teal accent — the one place on a detail page that does — which
// is what makes it read as an offer without a starburst or a countdown timer.
//
// No price appears here, by design. See the note at the top of lib/design/offers.ts:
// the discount is applied when the trip is quoted, and a panel that showed a
// reduced figure would be committing the business to arithmetic nobody has
// checked against the guest's actual nights and party size.

import { Badge, Label } from "@/components/ui";
import type { ResolvedOffer } from "@/lib/design/offers";
import { cn } from "@/lib/utils";

export function OfferPanel({
  offers,
  className,
}: {
  offers: ResolvedOffer[];
  className?: string;
}) {
  // The section drops entirely rather than rendering a heading over nothing —
  // the same rule the activities and FAQ sections follow.
  if (offers.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {offers.map((offer) => (
        <article
          key={offer.id}
          className="rounded-xl border border-teal-deep/25 bg-teal-tint/40 p-6"
        >
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Badge tone="offer">{offer.badge}</Badge>
            {offer.endingSoon && (
              <span className="font-mono text-label-sm uppercase text-teal-deep">
                Ends soon
              </span>
            )}
          </div>

          <div className="text-heading-s">{offer.name}</div>

          {offer.description && (
            <p className="m-0 mt-2 max-w-[46em] text-body-s text-ink-700">
              {offer.description}
            </p>
          )}

          {/* Conditions and window sit together: they are the two facts that
              decide whether this offer is any use to the reader. */}
          <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3 border-t border-teal-deep/15 pt-4">
            {offer.condition && (
              <div>
                <Label as="dt" className="mb-1">
                  Applies
                </Label>
                <dd className="m-0 text-body-s text-ink-900">{offer.condition}</dd>
              </div>
            )}
            <div>
              <Label as="dt" className="mb-1">
                Available
              </Label>
              <dd className="m-0 text-body-s text-ink-900">{offer.window}</dd>
            </div>
            {offer.code && (
              <div>
                <Label as="dt" className="mb-1">
                  Quote this code
                </Label>
                <dd className="m-0 font-mono text-body-s font-medium text-teal-deep">
                  {offer.code}
                </dd>
              </div>
            )}
          </dl>

          <p className="m-0 mt-4 text-body-xs text-meta">
            Applied to your quote when we confirm the dates — the prices on this
            page do not include it.
          </p>
        </article>
      ))}
    </div>
  );
}

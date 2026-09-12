// lib/design/offers.ts
//
// Offers, as the site presents them.
//
// Two rules run through all of it.
//
// FIRST: an offer is date-bounded, exactly like a package, and showing an expired
// one is worse than showing none. Four offers existed in the database before this
// was wired up and two of them had already lapsed, so "just render the rows" was
// never going to be right. Validity is derived here, never stored, for the same
// reason it is in availability.ts — a stored flag goes stale the moment nobody
// remembers to clear it.
//
// SECOND, and this is the important one: an offer NEVER changes a displayed
// price. It is presented as an offer and applied when the trip is quoted.
//
// That is a deliberate refusal, not an omission. FREE_NIGHTS cannot be resolved
// without knowing how many nights the guest is actually booking; PERCENTAGE and
// FIXED_AMOUNT interact with the per-person and whole-package figures in ways
// that would need the business to confirm which the discount applies to; and
// minNights/minGuests mean the discount may not apply to the trip in front of
// the visitor at all. A card that quietly showed a reduced price would be making
// a commitment nobody has checked. Since every trip here is confirmed by email
// before payment, the honest version is to show the offer, state its conditions,
// and let the quote carry the arithmetic.

import type { DiscountType, Market } from "@prisma/client";

export interface OfferInput {
  id: string;
  name: string;
  description: string | null;
  badge: string | null;
  discountType: DiscountType;
  discountValue: number;
  code: string | null;
  validFrom: Date;
  validUntil: Date;
  minNights: number | null;
  minGuests: number | null;
  market: Market | null;
  isActive: boolean;
}

/** What the site shows for one live offer. Nothing here is a price. */
export interface ResolvedOffer {
  id: string;
  /** The short strip for a card, e.g. "1 FREE NIGHT". Always uppercase. */
  badge: string;
  /** The headline, e.g. "10% off" — derived when no badge is set. */
  headline: string;
  name: string;
  description: string | null;
  /** "on stays of 5 nights or more" — null when unconditional. */
  condition: string | null;
  /** "Until 30 June" — always present; an offer without an end is not a thing. */
  window: string;
  /** Quote this to claim it. Null when there is no code. */
  code: string | null;
  /** True in the last fortnight, so the page can say so honestly. */
  endingSoon: boolean;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/**
 * Live means: switched on, and today falls inside the window.
 *
 * The comparison is day-granular at both ends, matching availability.ts — an
 * offer valid "until 30 June" is usable all day on the 30th, because that is
 * what the date reads as to both staff and guest.
 */
export function isOfferLive(offer: OfferInput, now: Date = new Date()): boolean {
  if (!offer.isActive) return false;
  const today = startOfDay(now);
  return (
    today >= startOfDay(offer.validFrom) && today <= startOfDay(offer.validUntil)
  );
}

/** The discount in words. Used as the headline, and as the badge when none is set. */
export function discountPhrase(
  type: DiscountType,
  value: number
): string {
  switch (type) {
    case "PERCENTAGE":
      // Trim a trailing .0 — "10% off", never "10.0% off".
      return `${Number(value.toFixed(2))}% off`;
    case "FIXED_AMOUNT":
      return `$${Math.round(value).toLocaleString("en-US")} off`;
    case "FREE_NIGHTS": {
      const n = Math.round(value);
      return `${n} free ${n === 1 ? "night" : "nights"}`;
    }
  }
}

/**
 * The conditions, as one clause. Returned null rather than "no conditions",
 * because a panel that prints "no conditions" invites the suspicion it is trying
 * to allay.
 */
export function offerCondition(offer: OfferInput): string | null {
  const parts: string[] = [];
  if (offer.minNights && offer.minNights > 1) {
    parts.push(`stays of ${offer.minNights} nights or more`);
  }
  if (offer.minGuests && offer.minGuests > 1) {
    parts.push(`${offer.minGuests} guests or more`);
  }
  if (parts.length === 0) return null;
  return `on ${parts.join(" and ")}`;
}

const MONTH_DAY = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
});

/** "Until 30 June" — and the year too when it is not this one. */
export function offerWindow(offer: OfferInput, now: Date = new Date()): string {
  const end = offer.validUntil;
  const sameYear = end.getFullYear() === now.getFullYear();
  const date = MONTH_DAY.format(end);
  return sameYear ? `Until ${date}` : `Until ${date} ${end.getFullYear()}`;
}

const FORTNIGHT_MS = 14 * 24 * 60 * 60 * 1000;

export function isEndingSoon(offer: OfferInput, now: Date = new Date()): boolean {
  const left = startOfDay(offer.validUntil).getTime() - startOfDay(now).getTime();
  return left >= 0 && left <= FORTNIGHT_MS;
}

/**
 * Filters to what a visitor in this market may actually see, then shapes it.
 *
 * A null market on the offer means every market, which is why the check cannot
 * be a plain equality. Ordering puts the offer ending soonest first: of two live
 * offers, the one about to lapse is the one worth acting on.
 */
export function resolveOffers(
  offers: OfferInput[] | null | undefined,
  opts: { market?: Market; now?: Date } = {}
): ResolvedOffer[] {
  const now = opts.now ?? new Date();
  const market = opts.market ?? "INTERNATIONAL";
  // Tolerating a missing list is not defensive noise here. One caller builds the
  // row for toCard by hand and casts it with `as unknown as CardRow`, which
  // silences a forgotten relation at compile time — omitting `offers` there threw
  // on every package detail page, with a 500 rather than a missing badge. A
  // catalogue with no offers is the normal case, so absence returns nothing.
  if (!offers || offers.length === 0) return [];

  return offers
    .filter((o) => isOfferLive(o, now))
    .filter((o) => o.market === null || o.market === market)
    .sort((a, b) => a.validUntil.getTime() - b.validUntil.getTime())
    .map((o) => {
      const headline = discountPhrase(o.discountType, o.discountValue);
      return {
        id: o.id,
        // The badge is staff-authored and may be anything; uppercase it so the
        // strip is consistent whether they typed "15% off" or "15% OFF".
        badge: (o.badge?.trim() || headline).toUpperCase(),
        headline,
        name: o.name,
        description: o.description?.trim() || null,
        condition: offerCondition(o),
        window: offerWindow(o, now),
        code: o.code?.trim() || null,
        endingSoon: isEndingSoon(o, now),
      };
    });
}

/** The one offer a card has room for: the soonest to end. */
export function primaryOffer(offers: ResolvedOffer[]): ResolvedOffer | null {
  return offers[0] ?? null;
}

/**
 * The offer badge to show beside a package's own badge — or null when it would
 * just repeat it.
 *
 * Both fields are free text typed by staff, and they collide in practice rather
 * than in theory: the Baros package is badged "HONEYMOON" and carries an offer
 * badged "HONEYMOON", which rendered as two chips side by side both reading
 * HONEYMOON. That looks like a bug even though both values are correct.
 *
 * The offer still shows in full in the panel; it is only the redundant chip that
 * is dropped, and only when the two are the same word.
 */
export function distinctOfferBadge(
  packageBadge: string | null | undefined,
  offer: ResolvedOffer | null | undefined
): string | null {
  if (!offer) return null;
  const pkg = packageBadge?.trim().toUpperCase();
  return pkg && pkg === offer.badge ? null : offer.badge;
}

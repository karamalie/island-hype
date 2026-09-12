// lib/design/pricing.ts
//
// Money for packages.
//
// The one thing to hold onto: `couplePrice` is the WHOLE-PACKAGE total for two,
// not a nightly rate and not a per-person figure. Confirmed with the client on
// 2026-09-12 and corroborated by the live rows — a 4-night Maafushi guesthouse
// carries couplePrice 899, which is $112 a night for two. Reading it as nightly
// would price that week at $3,596 and put it ~20x over the real market.
//
// So: total = couplePrice, and the per-person figure the designs lead with is
// couplePrice / 2. Never multiply by nights.

import type { Market } from "@prisma/client";

export type Currency = "USD" | "MVR";

export interface PricingRow {
  id: string;
  market: Market;
  /** Total for single occupancy, whole package. */
  basePrice: number;
  /** Total for two, whole package. */
  couplePrice: number;
  extraAdultPrice: number | null;
  childPrice: number | null;
  infantPrice: number | null;
  singleSupplement: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
}

export interface PackagePrice {
  /** What the card leads with. */
  perPerson: number;
  /** What the line underneath states. */
  total: number;
  /** Everyone the total covers, adults and children. */
  pax: number;
  currency: Currency;
}

export function currencyFor(market: Market): Currency {
  return market === "LOCAL" ? "MVR" : "USD";
}

/**
 * Pick the row that applies.
 *
 * A row with at least one date bound is seasonal; a row with neither is the
 * default. Seasonal rows win when they cover the travel date, which is why the
 * `packageId + market` unique constraint had to go — it allowed exactly one row
 * per market and made seasonal pricing unexpressible.
 */
export function selectPricingRow(
  rows: PricingRow[],
  market: Market,
  travelDate?: Date | null
): PricingRow | null {
  const forMarket = rows.filter((r) => r.market === market);
  if (forMarket.length === 0) return null;

  const isSeasonal = (r: PricingRow) => r.validFrom !== null || r.validUntil !== null;

  if (travelDate) {
    const t = travelDate.getTime();
    const covering = forMarket.find(
      (r) =>
        isSeasonal(r) &&
        (r.validFrom === null || r.validFrom.getTime() <= t) &&
        (r.validUntil === null || r.validUntil.getTime() >= t)
    );
    if (covering) return covering;
  }

  return forMarket.find((r) => !isSeasonal(r)) ?? forMarket[0];
}

export function computePackagePrice(
  row: PricingRow,
  opts: { adults: number; children?: number; market: Market }
): PackagePrice {
  const adults = Math.max(1, opts.adults);
  const children = Math.max(0, opts.children ?? 0);

  let total: number;
  if (adults === 1) {
    total = row.basePrice + (row.singleSupplement ?? 0);
  } else {
    total = row.couplePrice;
    if (adults > 2) {
      // A null extraAdultPrice means admin hasn't set one. Charging nothing for
      // the third guest is the safe direction to be wrong in: we confirm every
      // total with the island before anyone pays.
      total += (row.extraAdultPrice ?? 0) * (adults - 2);
    }
  }

  if (children > 0) total += (row.childPrice ?? 0) * children;

  return {
    perPerson: Math.round(total / adults),
    total: Math.round(total),
    pax: adults + children,
    currency: currencyFor(opts.market),
  };
}

export function formatMoney(value: number, currency: Currency): string {
  return new Intl.NumberFormat(currency === "MVR" ? "en-MV" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** "$4,960 total for two" — the line under the per-person figure. */
export function totalLine(price: PackagePrice): string {
  const who =
    price.pax === 1 ? "one" : price.pax === 2 ? "two" : `${price.pax} guests`;
  return `${formatMoney(price.total, price.currency)} total for ${who}`;
}

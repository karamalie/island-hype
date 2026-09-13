// lib/design/pricing.ts
//
// Money for packages.
//
// The one thing to hold onto: `basePrice` is the WHOLE-PACKAGE total, not a
// nightly rate and not a per-person figure. Confirmed with the client on
// 2026-09-12 and corroborated by the live rows — a 4-night Maafushi guesthouse
// carries 899, which is $112 a night for two. Reading it as nightly would price
// that week at $3,596 and put it ~20x over the real market.
//
// A package has ONE price. There used to be two whole-package totals, basePrice
// for single occupancy and couplePrice for two, and the site quoted only the
// couple one — leading with couplePrice / 2 as a per-person figure. Both the
// second price and the per-person display are gone: staff enter one number, and
// the site states it as the total. The optional tiers below still adjust it.
//
// Never multiply by nights.

import type { Market } from "@prisma/client";

export type Currency = "USD" | "MVR";

export interface PricingRow {
  id: string;
  market: Market;
  /** The package price, whole package, whatever the party size. */
  basePrice: number;
  extraAdultPrice: number | null;
  childPrice: number | null;
  infantPrice: number | null;
  singleSupplement: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
}

export interface PackagePrice {
  /** What the card leads with — the package price, adjustments applied. */
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

  // One price, then the optional adjustments staff choose to set. A null in any
  // of them means admin has not set one, and charging nothing is the safe
  // direction to be wrong in: every total is confirmed with the island before
  // anyone pays.
  let total = row.basePrice;

  if (adults === 1) total += row.singleSupplement ?? 0;
  else if (adults > 2) total += (row.extraAdultPrice ?? 0) * (adults - 2);

  if (children > 0) total += (row.childPrice ?? 0) * children;

  return {
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

/**
 * "$4,448 total" — the phrase used wherever the figure needs naming in words.
 *
 * It no longer says "for two". The price is the same whatever the party size,
 * so naming a party count alongside it implied a link that is not there.
 */
export function totalLine(price: PackagePrice): string {
  return `${formatMoney(price.total, price.currency)} total`;
}

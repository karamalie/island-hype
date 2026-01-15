// lib/market.ts
import { headers } from "next/headers";
import { Market as PrismaMarket } from "@prisma/client";

export type Market = PrismaMarket;

// Exchange rate - you might want to fetch this dynamically in production
const MVR_TO_USD_RATE = 15.42; // 1 USD = 15.42 MVR (approximate)

/**
 * Get the current market from request headers (set by middleware)
 */
export async function getMarket(): Promise<Market> {
  const headersList = await headers();
  const market = headersList.get("x-market") as Market;
  return market || "INTERNATIONAL";
}

/**
 * Get the appropriate currency for a market
 */
export function getCurrency(market: Market): "USD" | "MVR" {
  return market === "LOCAL" ? "MVR" : "USD";
}

/**
 * Format a price for display
 */
export function formatPrice(amount: number, market: Market): string {
  const currency = getCurrency(market);

  if (currency === "MVR") {
    return new Intl.NumberFormat("en-MV", {
      style: "currency",
      currency: "MVR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a price range (e.g., "From $299/night")
 */
export function formatPriceRange(
  amount: number,
  market: Market,
  suffix: string = "/night"
): string {
  return `From ${formatPrice(amount, market)}${suffix}`;
}

/**
 * Convert USD to MVR
 */
export function convertToMVR(usdAmount: number): number {
  return Math.round(usdAmount * MVR_TO_USD_RATE);
}

/**
 * Convert MVR to USD
 */
export function convertToUSD(mvrAmount: number): number {
  return Math.round(mvrAmount / MVR_TO_USD_RATE);
}

/**
 * Get the base URL for the current market
 */
export function getBaseUrl(market: Market): string {
  if (market === "LOCAL") {
    return (
      process.env.NEXT_PUBLIC_LOCAL_SITE_URL || "https://mv.islandhype.com"
    );
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://islandhype.com";
}

/**
 * Get the URL for switching markets
 */
export function getSwitchMarketUrl(
  currentPath: string,
  targetMarket: Market
): string {
  const baseUrl = getBaseUrl(targetMarket);
  return `${baseUrl}${currentPath}`;
}

/**
 * Check if a market is local (Maldivian)
 */
export function isLocalMarket(market: Market): boolean {
  return market === "LOCAL";
}

/**
 * Calculate total price for a package booking
 */
export function calculateTotalPrice(
  pricePerNight: number,
  nights: number,
  adults: number,
  children: number,
  pricing: {
    singlePricePerNight: number;
    couplePricePerNight: number;
    childPricePerNight?: number | null;
    extraAdultPricePerNight?: number | null;
  }
): number {
  let total = 0;

  if (adults === 1) {
    total = pricing.singlePricePerNight * nights;
  } else if (adults === 2) {
    total = pricing.couplePricePerNight * nights;
  } else {
    // Couple + extra adults
    total = pricing.couplePricePerNight * nights;
    const extraAdults = adults - 2;
    if (pricing.extraAdultPricePerNight) {
      total += pricing.extraAdultPricePerNight * extraAdults * nights;
    }
  }

  // Add children
  if (children > 0 && pricing.childPricePerNight) {
    total += pricing.childPricePerNight * children * nights;
  }

  return total;
}

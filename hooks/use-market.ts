// hooks/use-market.ts
"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { PricingMarket } from "@prisma/client";

type Market = PricingMarket;

/**
 * Get market value from cookie
 */
function getMarketFromCookie(): Market {
  if (typeof document === "undefined") return "INTERNATIONAL";

  const cookies = document.cookie.split(";");
  const marketCookie = cookies.find((c) => c.trim().startsWith("market="));

  if (marketCookie) {
    const value = marketCookie.split("=")[1]?.trim() as Market;
    if (value === "LOCAL" || value === "INTERNATIONAL") {
      return value;
    }
  }
  return "INTERNATIONAL";
}

/**
 * Hook to get the current market in client components
 * Reads from cookie set by middleware
 */
export function useMarket(): Market {
  const subscribe = useCallback((callback: () => void) => {
    // Listen for cookie changes (via storage events or custom events)
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(() => getMarketFromCookie(), []);

  const getServerSnapshot = useCallback(() => "INTERNATIONAL" as Market, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Hook to get currency based on market
 */
export function useCurrency(): "USD" | "MVR" {
  const market = useMarket();
  return market === "LOCAL" ? "MVR" : "USD";
}

/**
 * Hook to format prices based on current market
 */
export function usePriceFormatter() {
  const market = useMarket();

  return (amount: number): string => {
    const currency = market === "LOCAL" ? "MVR" : "USD";

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
  };
}

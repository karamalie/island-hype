// components/shared/price-display.tsx
"use client";

import { useMarket } from "@/hooks/use-market";
import { formatPrice } from "@/lib/market";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  localPrice: number;
  internationalPrice: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCurrency?: boolean;
  period?: string;
}

export function PriceDisplay({
  localPrice,
  internationalPrice,
  className,
  size = "md",
  showCurrency = true,
  period,
}: PriceDisplayProps) {
  const market = useMarket();

  const price = market === "LOCAL" ? localPrice : internationalPrice;
  const formattedPrice = formatPrice(price, market);

  const sizes = {
    sm: "text-lg font-semibold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold",
    xl: "text-4xl font-bold",
  };

  return (
    <div className={cn("flex items-baseline gap-1", className)}>
      <span className={sizes[size]}>{formattedPrice}</span>
      {period && (
        <span className="text-sm text-[var(--text-secondary)]">/{period}</span>
      )}
    </div>
  );
}

// components/patterns/price-block.tsx
//
// A per-person figure with the total underneath. The 600 weight here is the only
// 600 on the page — price figures are the one thing the type scale lets go heavy.
//
// Renders null when there is no price row, rather than a zero: a package without
// pricing is an admin gap, and "$0" would be a lie about it.

import { formatMoney, totalLine, type PackagePrice } from "@/lib/design/pricing";
import { cn } from "@/lib/utils";

export function PriceBlock({
  price,
  size = "md",
  className,
}: {
  price: PackagePrice | null;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  if (!price) {
    return (
      <div className={cn("text-body-xs text-meta", className)}>
        Price on request
      </div>
    );
  }

  return (
    <div className={className}>
      <div>
        <span
          className={cn(
            size === "md" && "text-price",
            size === "lg" && "text-price-lg",
            size === "xl" && "text-[32px] font-semibold leading-[38px]"
          )}
        >
          {formatMoney(price.perPerson, price.currency)}
        </span>
        <span className="text-caption text-meta"> / person</span>
      </div>
      <div className="mt-0.5 text-caption text-meta">{totalLine(price)}</div>
    </div>
  );
}

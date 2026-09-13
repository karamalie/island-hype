// components/patterns/price-block.tsx
//
// The package price. The 600 weight here is the only 600 on the page — price
// figures are the one thing the type scale lets go heavy.
//
// It used to lead with a per-person figure and state the total underneath. A
// package has one price now and it does not vary with the party size, so the
// per-person line was both redundant and misleading: dividing one fixed total
// by however many guests were selected produced a number nobody is charged.
//
// Renders null when there is no price row, rather than a zero: a package without
// pricing is an admin gap, and "$0" would be a lie about it.

import { formatMoney, type PackagePrice } from "@/lib/design/pricing";
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
          {formatMoney(price.total, price.currency)}
        </span>
        <span className="text-caption text-meta"> total</span>
      </div>
    </div>
  );
}

// components/ui/skeleton.tsx
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-800)]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };

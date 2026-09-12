// components/ui/container.tsx
//
// One width and one gutter for the whole site. The gutter is set here and only
// here, as side padding, so no page can accidentally lose it — a page body must
// never scroll sideways.

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Narrow measure for long-form prose. */
  prose?: boolean;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { className, prose = false, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("mx-auto w-full", className)}
      style={{
        maxWidth: prose ? "760px" : "var(--container-page)",
        paddingInline: "var(--gutter)",
        ...style,
      }}
      {...props}
    />
  );
});

export { Container };

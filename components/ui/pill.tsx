// components/ui/pill.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const pillVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 cursor-pointer select-none",
  {
    variants: {
      variant: {
        filled: "bg-gray-900 text-white hover:bg-gray-800",
        outline:
          "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 hover:border-gray-400 hover:text-gray-900",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        // For dark backgrounds
        "outline-light": "border border-white/30 text-white hover:bg-white/10",
      },
      size: {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-2.5 text-base",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
    },
  }
);

export interface PillProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pillVariants> {}

function Pill({ className, variant, size, ...props }: PillProps) {
  return (
    <button
      className={cn(pillVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function PillGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props}>
      {children}
    </div>
  );
}

export { Pill, PillGroup, pillVariants };

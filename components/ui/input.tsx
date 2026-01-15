// components/ui/input.tsx
import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "glass" | "outline";
  inputSize?: "sm" | "md" | "lg";
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant = "default", inputSize = "md", error, ...props },
    ref
  ) => {
    const variants = {
      default:
        "bg-[var(--color-gray-100)] border-transparent focus:bg-white focus:border-[var(--color-gray-300)]",
      glass: "glass-input",
      outline:
        "bg-transparent border-[var(--border-color)] focus:border-[var(--color-gray-400)]",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-base",
      lg: "h-14 px-5 text-lg",
    };

    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-full border transition-all duration-200 outline-none placeholder:text-[var(--color-gray-400)]",
          variants[variant],
          sizes[inputSize],
          error &&
            "border-[var(--color-error)] focus:border-[var(--color-error)]",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };

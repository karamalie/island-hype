// components/ui/input.tsx
//
// 48px, 8px radius. The focused state is a teal-bright border plus a soft ring —
// and note the error treatment elsewhere uses no red: a missing email is not an
// emergency, so it gets a grey left border rather than an alarm.

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const field = cn(
  "w-full rounded-sm border border-ink-200 bg-white px-4 text-body-s text-ink-900",
  "placeholder:text-meta",
  "transition-[border-color,box-shadow] duration-[140ms] ease-[var(--ease-standard)]",
  "focus:border-teal-bright focus:shadow-[0_0_0_3px_rgba(36,177,177,0.18)] focus:outline-none",
  "disabled:bg-ink-50 disabled:text-meta"
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(field, "h-12", className)} {...props} />;
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return <select ref={ref} className={cn(field, "h-12 cursor-pointer pr-10", className)} {...props} />;
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(field, "min-h-[120px] py-3.5 leading-6", className)} {...props} />;
  }
);

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-caption text-ink-700">
      {children}
    </label>
  );
}

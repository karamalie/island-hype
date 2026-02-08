import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  description,
  required,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {description && !error && (
        <p className="text-xs text-slate-400">{description}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Reusable input styles
export const inputStyles =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export const textareaStyles = cn(inputStyles, "min-h-[80px] resize-y");

export const selectStyles = cn(inputStyles, "appearance-none bg-no-repeat bg-right pr-8");

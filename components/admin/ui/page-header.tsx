import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between mb-6 gap-4", className)}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

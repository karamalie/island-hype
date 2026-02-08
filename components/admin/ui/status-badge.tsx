import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  // Inquiry statuses
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  NEGOTIATING: "bg-purple-50 text-purple-700 border-purple-200",
  BOOKED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  CLOSED: "bg-slate-50 text-slate-600 border-slate-200",

  // Generic statuses
  active: "bg-green-50 text-green-700 border-green-200",
  inactive: "bg-slate-50 text-slate-500 border-slate-200",
  featured: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-slate-50 text-slate-500 border-slate-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        style,
        className
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ")}
    </span>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}

export function SubmitButton({
  children,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  className,
  type = "submit",
  onClick,
}: SubmitButtonProps) {
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline:
      "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

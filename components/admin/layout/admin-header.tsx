"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, Menu, X } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
    username: string;
  };
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function AdminHeader({
  user,
  onMenuToggle,
  isSidebarOpen,
}: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Right: User menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
          </div>
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600",
                  "hover:bg-slate-50 hover:text-red-600 transition-colors"
                )}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}

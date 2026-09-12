"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Building2,
  Activity,
  Filter,
  Tag,
  MessageSquare,
  Settings,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  { type: "divider" as const, label: "Content" },
  {
    label: "Packages",
    href: "/admin/packages",
    icon: Package,
  },
  {
    label: "Locations",
    href: "/admin/locations",
    icon: MapPin,
  },
  {
    label: "Accommodations",
    href: "/admin/accommodations",
    icon: Building2,
  },
  {
    label: "Activities",
    href: "/admin/activities",
    icon: Activity,
  },
  {
    label: "Offers",
    href: "/admin/offers",
    icon: Tag,
  },
  {
    label: "Filter categories",
    href: "/admin/categories",
    icon: Filter,
  },
  { type: "divider" as const, label: "Management" },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: MessageSquare,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-30 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-100">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white">
          <Waves className="w-4 h-4" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-900">Island Hype</span>
          <span className="block text-[10px] text-slate-400 -mt-0.5 uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {navItems.map((item, i) => {
            if ("type" in item && item.type === "divider") {
              return (
                <li key={i} className="pt-4 pb-1.5 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </span>
                </li>
              );
            }

            const navItem = item as {
              label: string;
              href: string;
              icon: React.ComponentType<{ className?: string }>;
            };
            const Icon = navItem.icon;
            const active = isActive(navItem.href);

            return (
              <li key={navItem.href}>
                <Link
                  href={navItem.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {navItem.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

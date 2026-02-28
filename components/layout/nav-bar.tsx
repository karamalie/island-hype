// components/layout/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "overlay" | "solid";
  showLogo?: boolean;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/packages", label: "Packages" },
  { href: "/locations", label: "Locations" },
  { href: "/accommodations", label: "Accommodations" },
  { href: "/guide", label: "Guide" },
  { href: "/contact", label: "Contact" },
];

export function Navbar({ variant = "solid", showLogo = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isOverlay = variant === "overlay";

  const navShellClass = isOverlay
    ? "glass rounded-full px-2 py-2"
    : "bg-white/95 rounded-full px-2 py-2 border border-gray-200 shadow-md backdrop-blur-sm";

  const desktopInactiveLinkClass = isOverlay
    ? "text-white hover:bg-white/20"
    : "text-gray-700 hover:bg-gray-100";

  const bookNowClass = isOverlay
    ? "text-white gap-2"
    : "text-gray-900 gap-2 border-gray-300 bg-white hover:bg-gray-100";

  const logoClass = isOverlay
    ? "text-white hover:text-white/80"
    : "text-gray-900 hover:text-gray-700";

  const mobileMenuButtonClass = isOverlay
    ? "glass text-white hover:bg-white/20"
    : "bg-white text-gray-900 border border-gray-200 shadow-md hover:bg-gray-100";

  const mobilePanelClass = isOverlay
    ? "glass-dark rounded-xl p-5 shadow-2xl border border-white/10"
    : "bg-white rounded-xl p-5 shadow-2xl border border-gray-200";

  const mobileInactiveLinkClass = isOverlay
    ? "text-white hover:bg-white/15 active:bg-white/20"
    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200";

  const mobileActiveLinkClass = isOverlay
    ? "bg-white text-black shadow-sm"
    : "bg-gray-900 text-white shadow-sm";

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Logo - Only show if specified */}
      {showLogo && (
        <div className="absolute top-6 left-8 z-40">
          <Link href="/">
            <h1 className={cn("text-2xl font-display italic transition-colors", logoClass)}>
              Island Hype
            </h1>
          </Link>
        </div>
      )}

      {/* Desktop Navigation - Hidden on mobile, visible on md+ (768px+) */}
      <nav className="hidden md:block absolute top-6 left-1/2 -translate-x-1/2 z-40">
        <div className={cn("flex items-center gap-1", navShellClass)}>
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);

            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={active ? (isOverlay ? "white" : "dark") : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    !active && desktopInactiveLinkClass
                  )}
                >
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Book Now Button - Desktop - Hidden on mobile, flex on md+ (768px+) */}
      <div className="hidden md:flex absolute top-6 right-8 z-40 items-center gap-2">
        <Link href="/packages">
          <Button variant={isOverlay ? "glass" : "outline"} className={bookNowClass}>
            Book Now
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7V17"
              />
            </svg>
          </Button>
        </Link>
      </div>

      {/* Mobile Menu Button - Visible on mobile, hidden on md+ (768px+) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "md:hidden absolute top-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all active:scale-95",
          mobileMenuButtonClass
        )}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Overlay - Visible on mobile, hidden on md+ (768px+) */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Content */}
          <div className="md:hidden fixed top-20 left-4 right-4 z-50 rounded-full">
            <div className="max-w-md mx-auto">
                <div className={mobilePanelClass}>
                  {/* Navigation Links */}
                  <div className="flex flex-col gap-2.5">
                  {NAV_LINKS.map((link) => {
                    const active = isActive(link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                      >
                        <button
                          className={cn(
                            "w-full text-left px-6 py-3.5 h-12 rounded-full text-base font-medium transition-all",
                            active
                              ? mobileActiveLinkClass
                              : mobileInactiveLinkClass
                          )}
                        >
                          {link.label}
                        </button>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className={cn("my-4 h-px", isOverlay ? "bg-white/10" : "bg-gray-200")} />

                {/* Book Now Button */}
                <Link href="/packages" onClick={() => setIsOpen(false)}>
                  <button
                    className={cn(
                      "w-full px-6 py-3.5 h-12 rounded-full text-base font-medium shadow-sm transition-all flex items-center justify-center gap-2",
                      isOverlay
                        ? "bg-white text-black hover:bg-white/90 active:bg-white/80"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950"
                    )}
                  >
                    Book Now
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 17L17 7M17 7H7M17 7V17"
                      />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

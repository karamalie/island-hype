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
  { href: "/contact", label: "Contact" },
];

export function Navbar({ variant = "overlay", showLogo = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
            <h1 className="text-2xl font-display italic text-white hover:text-white/80 transition-colors">
              Island Hype
            </h1>
          </Link>
        </div>
      )}

      {/* Desktop Navigation - Hidden on mobile, visible on md+ (768px+) */}
      <nav className="hidden md:block absolute top-6 left-1/2 -translate-x-1/2 z-40">
        <div className="glass rounded-full px-2 py-2 flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);

            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={active ? "white" : "ghost"}
                  size="sm"
                  className={cn(
                    "rounded-full",
                    !active && "text-white hover:bg-white/20"
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
          <Button variant="glass" className="text-white gap-2">
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
        className="md:hidden absolute top-6 right-6 z-50 glass p-4 rounded-full text-white shadow-lg transition-all hover:bg-white/20 active:scale-95"
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
              <div className="glass-dark rounded-xl p-5 shadow-2xl border border-white/10 ">
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
                              ? "bg-white text-black shadow-sm"
                              : "text-white hover:bg-white/15 active:bg-white/20"
                          )}
                        >
                          {link.label}
                        </button>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="my-4 h-px bg-white/10" />

                {/* Book Now Button */}
                <Link href="/packages" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-white text-black px-6 py-3.5 h-12 rounded-full text-base font-medium shadow-sm hover:bg-white/90 active:bg-white/80 transition-all flex items-center justify-center gap-2">
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

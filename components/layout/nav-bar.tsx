"use client";

// components/layout/nav-bar.tsx
//
// Three forms of one nav, chosen by what is behind it:
//
//   glass  — over a photograph (Home and the three page heads)
//   solid  — over white (the detail pages, the guide, contact)
//
// Two things the previous nav got wrong and this one cannot:
//
//   1. Text on glass is full-opacity white. Never white/70. Contrast comes from
//      the blur and the scrim, not from dimming the type — dimmed white on a
//      bright reef photograph is unreadable however much blur sits under it.
//   2. The scrim is not this component's job to remember. It ships inside
//      PageHead, so a nav can never end up over an unscrimmed image.
//
// The label is "Stays" while the route stays /accommodations: the word people
// recognise is not always the word the URL was built with.

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

export type NavSurface = "glass" | "solid";
export type NavKey = "home" | "packages" | "locations" | "stays" | "guide";

export interface NavCta {
  label: string;
  href: string;
  /** The ↗ glyph, teal, on the page-head CTAs. */
  arrow?: boolean;
}

export interface NavBarProps {
  surface: NavSurface;
  active?: NavKey;
  cta?: NavCta;
}

const ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "packages", label: "Packages", href: "/packages" },
  { key: "locations", label: "Locations", href: "/locations" },
  { key: "stays", label: "Stays", href: "/accommodations" },
  { key: "guide", label: "Guide", href: "/guide" },
];

export function NavBar({ surface, active, cta }: NavBarProps) {
  const [open, setOpen] = useState(false);
  const onImage = surface === "glass";

  return (
    <div
      className={cn(
        "relative flex flex-wrap items-center justify-between gap-6 px-[var(--gutter)] py-6",
        !onImage && "border-b border-ink-200 bg-white"
      )}
    >
      {/* On a photograph the gold sits in a white pill; on the solid white nav it
          needs no ground. Either way it is the same gold asset. */}
      <Logo
        form="horizontal"
        ground={onImage ? "photo" : "white"}
        width={onImage ? 208 : 216}
        priority
      />

      {/* Desktop pill */}
      <nav
        aria-label="Main"
        className={cn(
          "hidden items-center gap-1 rounded-full p-1.5 md:flex",
          onImage ? "glass-light" : "border border-ink-200 bg-ink-50"
        )}
      >
        {ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-4 text-body-xs transition-colors duration-[140ms]",
                isActive && onImage && "bg-white font-medium text-ink-900",
                isActive && !onImage && "bg-ink-900 font-medium text-white",
                !isActive && onImage && "text-white hover:bg-white/15",
                !isActive && !onImage && "text-ink-700 hover:bg-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {cta && (
          <Link
            href={cta.href}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-[22px] text-body-xs font-medium transition-colors duration-[220ms]",
              onImage
                ? "bg-white text-ink-900 hover:bg-white/90"
                : "bg-ink-900 text-white hover:bg-ink-800"
            )}
          >
            {cta.label}
            {cta.arrow && (
              <span aria-hidden="true" className={onImage ? "text-teal-deep" : "text-teal-bright"}>
                ↗
              </span>
            )}
          </Link>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className={cn(
            "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full md:hidden",
            onImage ? "glass-light text-white" : "border border-ink-200 bg-white text-ink-900"
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel — glass-dark is the only other place glass appears. */}
      {open && (
        <nav
          aria-label="Main"
          className={cn(
            "absolute inset-x-[var(--gutter)] top-full z-50 flex flex-col rounded-xl p-2 md:hidden",
            onImage ? "glass-dark" : "border border-ink-200 bg-white shadow-overlay"
          )}
        >
          {ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={item.key === active ? "page" : undefined}
              className={cn(
                "rounded-md px-4 py-3 text-body-s",
                item.key === active
                  ? onImage
                    ? "bg-white/15 font-medium text-white"
                    : "bg-ink-50 font-medium text-ink-900"
                  : onImage
                    ? "text-white"
                    : "text-ink-700"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

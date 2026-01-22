// components/packages/package-filters.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FilterOptions } from "@/lib/data/packages";

interface PackageFiltersProps {
  filterOptions: FilterOptions;
}

const DURATION_OPTIONS = [
  { label: "2-3 nights", value: "2-3" },
  { label: "4-5 nights", value: "4-5" },
  { label: "6-7 nights", value: "6-7" },
  { label: "8+ nights", value: "8" },
];

export function PackageFilters({ filterOptions }: PackageFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);

  // Get current filters from URL
  const currentExperience = searchParams.get("experience") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentAccommodationType = searchParams.get("accommodationType") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentDuration = searchParams.get("duration") || "";

  // Update URL with new filters
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to first page when filtering
    params.delete("page");

    startTransition(() => {
      router.push(`/packages?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/packages");
    });
  };

  const hasActiveFilters =
    currentExperience ||
    currentLocation ||
    currentAccommodationType ||
    currentSearch ||
    currentDuration;

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="glass rounded-2xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 shadow-sm">
        {/* Search */}
        <div className="md:col-span-4">
          <label className="text-sm font-semibold mb-2 block text-gray-900">
            Search Packages
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Beach getaway, diving adventures..."
              value={currentSearch}
              onChange={(e) => updateFilters("search", e.target.value)}
              className="pl-10 text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Experience Type */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold mb-2 block text-gray-900">
            Experience
          </label>
          <select
            value={currentExperience}
            onChange={(e) => updateFilters("experience", e.target.value)}
            className="w-full h-10 px-3 rounded-full border border-gray-300 bg-white text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-gray-400"
          >
            <option value="">All Types</option>
            {filterOptions.experiences.map((exp) => (
              <option key={exp.id} value={exp.slug}>
                {exp.icon} {exp.name} ({exp._count.packages})
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold mb-2 block text-gray-900">
            Location
          </label>
          <select
            value={currentLocation}
            onChange={(e) => updateFilters("location", e.target.value)}
            className="w-full h-10 px-3 rounded-full border border-gray-300 bg-white text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-gray-400"
          >
            <option value="">All Locations</option>
            {filterOptions.locations.map((loc) => (
              <option key={loc.id} value={loc.slug}>
                {loc.name} ({loc._count.packages})
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div className="md:col-span-2">
          <label className="text-sm font-semibold mb-2 block text-gray-900">
            Duration
          </label>
          <select
            value={currentDuration}
            onChange={(e) => updateFilters("duration", e.target.value)}
            className="w-full h-10 px-3 rounded-full border border-gray-300 bg-white text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all hover:border-gray-400"
          >
            <option value="">Any Duration</option>
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* More Filters Button */}
        <div className="md:col-span-2 flex items-end">
          <Button
            variant="outline"
            className="w-full gap-2 h-10 text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? "Less" : "More"}
          </Button>
        </div>
      </div>

      {/* Advanced Filters (Collapsible) */}
      {showFilters && (
        <div className="glass rounded-2xl p-6 space-y-6 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Accommodation Type */}
            <div>
              <label className="text-sm font-semibold mb-3 block text-gray-900">
                Accommodation Type
              </label>
              <div className="space-y-2">
                {filterOptions.accommodationTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      updateFilters(
                        "accommodationType",
                        currentAccommodationType === type ? "" : type
                      )
                    }
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-full border transition-all text-sm font-medium",
                      currentAccommodationType === type
                        ? "bg-gray-900 text-white border-gray-900 shadow-md"
                        : "bg-white text-gray-900 border-gray-300 hover:border-gray-900 hover:shadow-sm"
                    )}
                  >
                    {type.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-semibold mb-3 block text-gray-900">
                Price Range
              </label>
              <div className="space-y-3">
                <Input
                  type="number"
                  placeholder="Min price"
                  onChange={(e) => updateFilters("minPrice", e.target.value)}
                  className="h-10 text-gray-900 placeholder:text-gray-400"
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  onChange={(e) => updateFilters("maxPrice", e.target.value)}
                  className="h-10 text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="text-sm font-semibold mb-3 block text-gray-900">
                Quick Filters
              </label>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => updateFilters("featured", "true")}
                >
                  Featured Packages
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-gray-900 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => updateFilters("offers", "true")}
                >
                  Special Offers
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">
            Active filters:
          </span>
          {currentExperience && (
            <Badge
              variant="outline"
              className="gap-2 cursor-pointer text-gray-900 border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => updateFilters("experience", "")}
            >
              {
                filterOptions.experiences.find(
                  (e) => e.slug === currentExperience
                )?.name
              }
              <X className="w-3 h-3" />
            </Badge>
          )}
          {currentLocation && (
            <Badge
              variant="outline"
              className="gap-2 cursor-pointer text-gray-900 border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => updateFilters("location", "")}
            >
              {
                filterOptions.locations.find((l) => l.slug === currentLocation)
                  ?.name
              }
              <X className="w-3 h-3" />
            </Badge>
          )}
          {currentAccommodationType && (
            <Badge
              variant="outline"
              className="gap-2 cursor-pointer text-gray-900 border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => updateFilters("accommodationType", "")}
            >
              {currentAccommodationType.replace("_", " ")}
              <X className="w-3 h-3" />
            </Badge>
          )}
          {currentDuration && (
            <Badge
              variant="outline"
              className="gap-2 cursor-pointer text-gray-900 border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => updateFilters("duration", "")}
            >
              {DURATION_OPTIONS.find((d) => d.value === currentDuration)?.label}
              <X className="w-3 h-3" />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm h-7 text-gray-900 hover:bg-gray-100"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Loading Indicator */}
      {isPending && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-600 animate-pulse font-medium">
            Updating results...
          </span>
        </div>
      )}
    </div>
  );
}

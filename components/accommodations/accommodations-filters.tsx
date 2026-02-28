// components/accommodations/accommodation-filters.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface AccommodationFiltersProps {
  atolls: string[];
  currentType?: string;
  currentLocation?: string;
}

export function AccommodationFilters({
  atolls,
  currentType,
  currentLocation,
}: AccommodationFiltersProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Type Filters */}
      <div className="flex gap-2">
        <Link
          href="/accommodations"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !currentType
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
          }`}
        >
          All Types
        </Link>
        {["RESORT", "GUESTHOUSE"].map((type) => {
          const params = new URLSearchParams();
          params.set("type", type);
          if (currentLocation) {
            params.set("location", currentLocation);
          }

          return (
            <Link
              key={type}
              href={`/accommodations?${params.toString()}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                currentType === type
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {type.toLowerCase()}
            </Link>
          );
        })}
      </div>

      {/* Location Filter */}
      <div className="relative">
        <select
          value={currentLocation || ""}
          onChange={(e) => {
            const params = new URLSearchParams();
            if (currentType) {
              params.set("type", currentType);
            }
            if (e.target.value) {
              params.set("location", e.target.value);
            }
            const query = params.toString();
            router.push(query ? `/accommodations?${query}` : "/accommodations");
          }}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none pr-10"
        >
          <option value="">All Locations</option>
          {atolls.map((atoll) => (
            <option key={atoll} value={atoll}>
              {atoll}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

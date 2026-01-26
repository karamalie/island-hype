// components/locations/location-filters.tsx
"use client";

import Link from "next/link";

interface LocationFiltersProps {
  atolls: string[];
  transferTypes: string[];
  currentAtoll?: string;
  currentTransferType?: string;
}

export function LocationFilters({
  atolls,
  transferTypes,
  currentAtoll,
  currentTransferType,
}: LocationFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Atoll Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Filter by Atoll
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/locations"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !currentAtoll
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            All Atolls
          </Link>
          {atolls.slice(0, 8).map((atoll) => (
            <Link
              key={atoll}
              href={`/locations?atoll=${atoll}${
                currentTransferType
                  ? `&transferType=${currentTransferType}`
                  : ""
              }`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentAtoll === atoll
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
              }`}
            >
              {atoll}
            </Link>
          ))}
        </div>
      </div>

      {/* Transfer Type Filter */}
      {transferTypes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Filter by Transfer
          </h3>
          <div className="flex flex-wrap gap-2">
            {transferTypes.map((type) => {
              const params = new URLSearchParams();
              params.set("transferType", type);
              if (currentAtoll) {
                params.set("atoll", currentAtoll);
              }

              return (
                <Link
                  key={type}
                  href={`/locations?${params.toString()}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                    currentTransferType === type
                      ? "bg-teal-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  {type.toLowerCase().replace("_", " ")}
                </Link>
              );
            })}
            {currentTransferType && (
              <Link
                href={`/locations${currentAtoll ? `?atoll=${currentAtoll}` : ""}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
              >
                Clear
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

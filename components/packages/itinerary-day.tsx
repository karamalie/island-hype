// components/packages/itinerary-day.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItineraryDayProps {
  day: {
    id: string;
    dayNumber: number;
    title: string;
    description: string;
  };
}

export function ItineraryDay({ day }: ItineraryDayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-sm font-bold text-teal-700">
              {day.dayNumber}
            </span>
          </div>
          <span className="font-semibold text-gray-900 text-left">
            Day {day.dayNumber}: {day.title}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <p className="text-gray-600 leading-relaxed pl-14">
            {day.description}
          </p>
        </div>
      )}
    </div>
  );
}

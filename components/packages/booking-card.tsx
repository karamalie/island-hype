"use client";

import { useState } from "react";
import { Calendar, Users, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BookingCardProps {
  price: number;
  currency: string;

  minNights: number;
  maxGuests?: number | null;
  packageSlug: string;
}

export function BookingCard({
  price,
  currency,

  minNights,
  maxGuests,
  packageSlug,
}: BookingCardProps) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(currency === "MVR" ? "en-MV" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  // Calculate total (placeholder - can be enhanced)
  const total = price * 1.0; // Add any additional calculations here

  const handleBookNow = () => {
    // TODO: Implement booking flow
    alert("Booking functionality coming soon!");
  };

  return (
    <Card className="border border-gray-200 rounded-2xl p-6 shadow-lg">
      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          <span className="text-gray-600">/ Person</span>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Check In */}
        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Check In
          </label>
          <div className="relative">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Check Out */}
        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Check Out
          </label>
          <div className="relative">
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Guest Count */}
        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Guest
          </label>
          <div className="relative">
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="w-full h-12 px-4 pr-10 rounded-xl border border-gray-300 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {Array.from({ length: maxGuests || 8 }, (_, i) => i + 1).map(
                (num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "Guest" : "Guests"}
                  </option>
                )
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-200" />

      {/* Total */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-gray-600 font-medium">Total</span>
        <span className="text-2xl font-bold text-gray-900">
          {formatPrice(total)}
        </span>
      </div>

      {/* Book Now Button */}
      <Button
        onClick={handleBookNow}
        className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-base font-semibold"
      >
        Book Now
      </Button>

      {/* Additional Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Minimum {minNights} nights stay required
      </p>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { submitBookingForm } from "@/lib/actions/contact";
import { CheckCircle, AlertCircle } from "lucide-react";

interface BookingFormProps {
  packageId: string;
  packageName: string;
}

export function BookingForm({ packageId, packageName }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("packageId", packageId);
    formData.set("packageName", packageName);

    const result = await submitBookingForm(formData);

    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8 px-6">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Inquiry Submitted!
        </h3>
        <p className="text-sm text-gray-600">
          We&apos;ll get back to you within 24 hours with a personalized quote.
        </p>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 px-6 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
      >
        Book This Package
      </button>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">
        Book: {packageName}
      </h3>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Name *
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Full name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Phone
          </label>
          <input
            name="phone"
            type="tel"
            placeholder="Phone"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Nationality
          </label>
          <input
            name="nationality"
            type="text"
            placeholder="Nationality"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Check-in
          </label>
          <input name="checkIn" type="date" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Check-out
          </label>
          <input name="checkOut" type="date" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Adults
          </label>
          <input
            name="adults"
            type="number"
            min="1"
            defaultValue="2"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Children
          </label>
          <input
            name="children"
            type="number"
            min="0"
            defaultValue="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Infants
          </label>
          <input
            name="infants"
            type="number"
            min="0"
            defaultValue="0"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Message *
        </label>
        <textarea
          name="message"
          required
          rows={3}
          placeholder="Tell us about your trip preferences..."
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Special Requests
        </label>
        <textarea
          name="specialRequests"
          rows={2}
          placeholder="Dietary needs, celebrations, etc."
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Arrival Flight
          </label>
          <input
            name="arrivalFlight"
            type="text"
            placeholder="e.g. SQ 432"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Departure Flight
          </label>
          <input
            name="departureFlight"
            type="text"
            placeholder="e.g. SQ 433"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 px-6 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting..." : "Submit Booking Inquiry"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

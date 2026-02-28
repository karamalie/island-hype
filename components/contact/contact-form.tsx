"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/actions/contact";
import { CheckCircle, AlertCircle } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await submitContactForm(formData);

    setLoading(false);
    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.error || "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 px-6 bg-maldives-soft rounded-2xl border border-cyan-200">
        <CheckCircle className="w-12 h-12 text-[var(--maldives-lagoon-600)] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-maldives-ink mb-2">
          Message Sent!
        </h3>
        <p className="text-gray-700">
          Thank you for reaching out. We&apos;ll get back to you within 24
          hours.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-cyan-100 bg-white text-sm text-[var(--maldives-ink-900)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--maldives-lagoon-600)]/20 focus:border-[var(--maldives-lagoon-600)] transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Your full name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="+960 xxx xxxx"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell us about your dream Maldives trip..."
          className={`${inputClass} resize-y`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[var(--maldives-ink-900)] text-white text-sm font-medium hover:bg-[#09101d] disabled:opacity-50 disabled:cursor-not-allowed btn-interactive btn-shimmer"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

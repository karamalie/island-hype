"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { exportInquiriesToCSV, type InquiryFilters as InquiryFiltersType } from "@/lib/actions/inquiries";
type InquiryFilters = InquiryFiltersType;

const inputClass =
  "px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

export function InquiryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [exporting, setExporting] = useState(false);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/inquiries?${params.toString()}`);
  }

  function handleSearch() {
    updateFilter("search", search);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportInquiriesToCSV({
        status: (searchParams.get("status") || undefined) as InquiryFilters["status"],
        market: (searchParams.get("market") || undefined) as InquiryFilters["market"],
        search: searchParams.get("search") || undefined,
      });
      if (typeof csv === "string") {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inquiries-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch {
      // silent fail
    }
    setExporting(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get("status") || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
        className={inputClass}
      >
        <option value="">All Statuses</option>
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="NEGOTIATING">Negotiating</option>
        <option value="BOOKED">Booked</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="CLOSED">Closed</option>
      </select>

      <select
        value={searchParams.get("market") || ""}
        onChange={(e) => updateFilter("market", e.target.value)}
        className={inputClass}
      >
        <option value="">All Markets</option>
        <option value="LOCAL">Local</option>
        <option value="INTERNATIONAL">International</option>
      </select>

      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search name or email..."
          className={`${inputClass} w-56`}
        />
        <button
          onClick={handleSearch}
          className="px-3 py-2 rounded-lg bg-slate-100 text-sm text-slate-700 hover:bg-slate-200 transition-colors"
        >
          Search
        </button>
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="ml-auto px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
      >
        {exporting ? "Exporting..." : "Export CSV"}
      </button>
    </div>
  );
}

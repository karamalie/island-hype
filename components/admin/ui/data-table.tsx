"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Plus,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  /**
   * What to show when there is nothing in the table at all. Two nothings are
   * possible here and they need different answers: a search that matched
   * nothing is handled automatically (it offers to clear the search), while an
   * empty table needs to tell the person what this screen is for and give them
   * the button that starts it. The old default was the string "No data found",
   * which reads like an error and tells a non-technical person nothing.
   */
  empty?: {
    title: string;
    body: string;
    action?: { label: string; href: string };
  };
  /** @deprecated Pass `empty` instead — a bare sentence has nowhere to go next. */
  emptyMessage?: string;
  pageSize?: number;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchKeys = [],
  onRowClick,
  actions,
  empty,
  emptyMessage,
  pageSize = 20,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search) return data;
    const lower = search.toLowerCase();
    return data.filter((row) => {
      const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
      return keys.some((key) => {
        const value = row[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(lower);
      });
    });
  }, [data, search, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div>
      {/* Search */}
      {searchKeys.length > 0 && (
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider",
                      col.sortable && "cursor-pointer select-none hover:text-slate-700",
                      col.className
                    )}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && (
                        <span className="text-slate-300">
                          {sortKey === col.key && sortDir === "asc" ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                          ) : sortKey === col.key && sortDir === "desc" ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                          ) : (
                            <ChevronsUpDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-6 py-14"
                  >
                    {data.length > 0 ? (
                      /* There ARE rows; the search excluded them. Say so, and
                         give back the way out — otherwise a typo in the search
                         box looks like the records have gone. */
                      <TableEmpty
                        icon={<SearchX className="h-5 w-5 text-slate-400" />}
                        title={`Nothing matches “${search}”.`}
                        body={`All ${data.length} ${
                          data.length === 1 ? "row is" : "rows are"
                        } still here — clear the search to see them.`}
                        onClear={() => {
                          setSearch("");
                          setPage(0);
                        }}
                      />
                    ) : (
                      <TableEmpty
                        icon={<Plus className="h-5 w-5 text-slate-400" />}
                        title={empty?.title ?? emptyMessage ?? "Nothing here yet."}
                        body={
                          empty?.body ??
                          "Anything you add will appear in this list."
                        }
                        action={empty?.action}
                      />
                    )}
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-slate-50"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn("px-4 py-3 text-slate-700", col.className)}
                      >
                        {col.render
                          ? col.render(row)
                          : (row[col.key] as React.ReactNode) ?? "—"}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-right">{actions(row)}</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Showing {page * pageSize + 1}–
              {Math.min((page + 1) * pageSize, sorted.length)} of{" "}
              {sorted.length}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The empty block inside the table. Deliberately generous with space: a thin
 * grey line of text in a bordered table reads as a rendering glitch, whereas a
 * centred block with a next action reads as a state someone designed.
 */
function TableEmpty({
  icon,
  title,
  body,
  action,
  onClear,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; href: string };
  onClear?: () => void;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <span className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        {icon}
      </span>
      <p className="m-0 text-sm font-medium text-slate-900">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[46ch] text-sm leading-6 text-slate-500">
        {body}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          {action.label}
        </Link>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
        >
          Clear the search
        </button>
      )}
    </div>
  );
}

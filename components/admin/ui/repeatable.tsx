"use client";

// components/admin/ui/repeatable.tsx
//
// A list of rows someone can add to, remove from and reorder.
//
// Two decisions aimed squarely at non-technical use:
//
// Order is changed with up/down buttons rather than drag-and-drop. Dragging is
// nicer when it works and miserable when it doesn't — on a trackpad, on a touch
// screen, or for anyone who can't hold a precise drag. Buttons always work and
// are reachable from the keyboard.
//
// Removing a row asks first. These lists are short and hand-written, so an
// accidental delete means retyping a paragraph someone composed carefully.

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { ConfirmModal } from "./modal";
import { cn } from "@/lib/utils";

export interface RepeatableProps<T> {
  rows: T[];
  onChange: (rows: T[]) => void;
  /** A blank row, for the add button. */
  blank: () => T;
  /** Names one row for the delete confirmation, e.g. the question text. */
  describe?: (row: T, index: number) => string;
  addLabel: string;
  /** Shown in place of the rows when the list is empty. */
  empty: React.ReactNode;
  children: (row: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode;
  /** Hide the add button once the list reaches this length. */
  max?: number;
}

export function Repeatable<T>({
  rows,
  onChange,
  blank,
  describe,
  addLabel,
  empty,
  children,
  max,
}: RepeatableProps<T>) {
  const [pendingRemove, setPendingRemove] = useState<number | null>(null);

  function update(index: number, patch: Partial<T>) {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
    setPendingRemove(null);
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 && empty}

      {rows.map((row, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1">
              <IconButton
                label="Move up"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton
                label="Move down"
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </IconButton>
              <IconButton label="Remove" danger onClick={() => setPendingRemove(i)}>
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </div>
          </div>

          <div className="space-y-3">
            {children(row, i, (patch) => update(i, patch))}
          </div>
        </div>
      ))}

      {(max === undefined || rows.length < max) && (
        <button
          type="button"
          onClick={() => onChange([...rows, blank()])}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      )}

      <ConfirmModal
        open={pendingRemove !== null}
        onClose={() => setPendingRemove(null)}
        onConfirm={() => pendingRemove !== null && remove(pendingRemove)}
        title="Remove this?"
        description={
          pendingRemove !== null && describe
            ? `"${describe(rows[pendingRemove], pendingRemove)}" will be removed when you save. Nothing changes on the site until you press Save.`
            : "This row will be removed when you save. Nothing changes on the site until you press Save."
        }
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-30",
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
      )}
    >
      {children}
    </button>
  );
}

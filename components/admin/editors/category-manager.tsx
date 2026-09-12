"use client";

// components/admin/editors/category-manager.tsx
//
// The filter categories, as a list staff own rather than a fixture.
//
// This one does NOT use SavePanel, and that is a considered exception. SavePanel
// exists for a block of fields that save together; here each row is its own
// record and each action is immediate and independently reversible — renaming
// "Diving" has nothing to do with renaming "Family". Batching them behind one
// Save button would mean a failure on row three leaves rows one and two in an
// unclear state.
//
// So instead: every action says what it did, and the two that a person cannot
// simply undo by retyping — delete, and reordering — are the ones that get a
// confirmation or an explicit save.

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/admin/ui/modal";
import { inputStyles } from "@/components/admin/ui/form-field";
import { createTag, deleteTag, renameTag, reorderTags } from "@/lib/actions/tags";
import { cn } from "@/lib/utils";

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  /** Every package carrying this category, live or not. */
  packageCount: number;
  /** Only the live ones — this is what decides whether the site shows it. */
  livePackageCount: number;
}

export function CategoryManager({
  initial,
  livePackageCount,
}: {
  initial: CategoryRow[];
  /** The filter bar only appears at six or more, which staff cannot see here. */
  livePackageCount: number;
}) {
  const [rows, setRows] = useState(initial);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [confirming, setConfirming] = useState<CategoryRow | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtersVisible = livePackageCount >= 6;

  function run(fn: () => Promise<{ success: boolean; error?: string }>, ok: string) {
    startTransition(async () => {
      const r = await fn();
      if (r.success) toast.success(ok);
      else toast.error(r.error ?? "That didn't work. Try again.");
      setBusyId(null);
    });
  }

  async function add() {
    const name = newName.trim();
    if (!name) return;
    const r = await createTag(name);
    if (!r.success || !r.id) {
      toast.error(r.error ?? "That didn't save.");
      return;
    }
    setRows((p) => [
      ...p,
      { id: r.id!, name, slug: "", packageCount: 0, livePackageCount: 0 },
    ]);
    setNewName("");
    toast.success(`“${name}” added`);
  }

  async function saveRename(id: string) {
    const name = draftName.trim();
    const previous = rows.find((r) => r.id === id)?.name ?? "";
    if (!name || name === previous) {
      setEditingId(null);
      return;
    }
    setBusyId(id);
    const r = await renameTag(id, name);
    setBusyId(null);
    if (!r.success) {
      toast.error(r.error ?? "That didn't save.");
      return;
    }
    setRows((p) => p.map((x) => (x.id === id ? { ...x, name } : x)));
    setEditingId(null);
    toast.success(`Renamed to “${name}”`);
  }

  function move(index: number, dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    [next[index], next[to]] = [next[to], next[index]];
    setRows(next);
    setOrderDirty(true);
  }

  function saveOrder() {
    run(() => reorderTags(rows.map((r) => r.id)), "Order saved");
    setOrderDirty(false);
  }

  async function doDelete() {
    const target = confirming;
    if (!target) return;
    setConfirming(null);
    setBusyId(target.id);
    const r = await deleteTag(target.id);
    setBusyId(null);
    if (!r.success) {
      toast.error(r.error ?? "That didn't delete.");
      return;
    }
    setRows((p) => p.filter((x) => x.id !== target.id));
    setOrderDirty(false);
    toast.success(`“${target.name}” deleted`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="m-0 text-base font-semibold text-slate-900">
          Add a category
        </h3>
        <p className="mt-1 max-w-[62ch] text-xs leading-5 text-slate-500">
          {filtersVisible
            ? `These are the filter buttons above the package list on the site. You have ${livePackageCount} live packages, so the filters are showing.`
            : `These are the filter buttons above the package list. They only appear once there are six or more live packages — you have ${livePackageCount}, so nothing is showing on the site yet.`}{" "}
          Keep the name short: it has to fit on a button.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void add();
              }
            }}
            placeholder="e.g. Sandbank"
            maxLength={60}
            className={cn(inputStyles, "w-full sm:w-72")}
          />
          <button
            type="button"
            onClick={() => void add()}
            disabled={!newName.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Plus className="h-4 w-4" />
            Add category
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="m-0 text-base font-semibold text-slate-900">
              Your categories
            </h3>
            <p className="mt-1 max-w-[62ch] text-xs leading-5 text-slate-500">
              Top to bottom here is left to right on the site. Renaming changes
              the button label only — any link someone has already shared keeps
              working.
            </p>
          </div>
          {orderDirty && (
            <button
              type="button"
              onClick={saveOrder}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save new order
            </button>
          )}
        </div>

        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No categories yet. Add one above — they are shared across all
            packages, so you create each one once and then tick it on whichever
            packages it applies to.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((row, i) => {
              const editing = editingId === row.id;
              const busy = busyId === row.id;
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex shrink-0 flex-col gap-0.5">
                    <IconBtn
                      label={`Move ${row.name} earlier`}
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn
                      label={`Move ${row.name} later`}
                      disabled={i === rows.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconBtn>
                  </div>

                  {editing ? (
                    <>
                      <input
                        autoFocus
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void saveRename(row.id);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        maxLength={60}
                        className={cn(inputStyles, "w-full sm:w-64")}
                      />
                      <button
                        type="button"
                        onClick={() => void saveRename(row.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {row.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {statusLine(row, filtersVisible)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(row.id);
                          setDraftName(row.name);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirming(row)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ConfirmModal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={() => void doDelete()}
        variant="danger"
        title={`Delete “${confirming?.name}”?`}
        description={
          confirming
            ? confirming.packageCount === 0
              ? "It is not used on any package, so nothing else changes. This cannot be undone."
              : `This removes the filter button and takes the category off ${
                  confirming.packageCount === 1
                    ? "1 package"
                    : `${confirming.packageCount} packages`
                }. Those packages stay published and stay in the full list — they just will not appear under this filter any more. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete category"
      />
    </div>
  );
}

/**
 * What this category is doing on the public site, in one line.
 *
 * Worth being precise here rather than just printing a count. The filter bar
 * only lists a category that a LIVE package uses, so a brand new one — or one
 * whose only packages have been deactivated — is genuinely invisible on the
 * site. Someone who adds "Sandbank", looks at the site, and sees nothing will
 * otherwise reasonably conclude it did not save.
 */
function statusLine(row: CategoryRow, filtersVisible: boolean): string {
  if (row.packageCount === 0) {
    return "Not on any package yet, so it isn't showing on the site — tick it on a package to make the button appear";
  }
  const on =
    row.packageCount === 1 ? "On 1 package" : `On ${row.packageCount} packages`;
  if (row.livePackageCount === 0) {
    return `${on}, but none of them are live — so the button isn't showing on the site`;
  }
  if (!filtersVisible) {
    return `${on} — the filter bar itself is hidden until there are six live packages`;
  }
  return `${on}, and showing on the site`;
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded border border-slate-200 p-1 text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

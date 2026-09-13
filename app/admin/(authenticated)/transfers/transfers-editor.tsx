"use client";

// One page rather than a list plus a detail form.
//
// The list is short and global — five or six ways of reaching an island — and
// each entry is three blocks of prose. Making someone click into a row, edit,
// save and come back to compare the wording against the next one is worse than
// showing them all open. The rows collapse so the page still scans.

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/ui/page-header";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import { ConfirmModal } from "@/components/admin/ui/modal";
import { runAction } from "@/lib/admin/run-action";
import { saveTransferOption, deleteTransferOption } from "@/lib/actions/transfers";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

export interface TransferRow {
  id: string | null;
  name: string;
  details: string;
  conditions: string;
  policy: string;
  sortOrder: number;
  isActive: boolean;
  packageCount: number;
}

export function TransfersEditor({ options }: { options: TransferRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<TransferRow[]>(options);
  const [open, setOpen] = useState<number | null>(options.length === 0 ? null : 0);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);

  function update(i: number, patch: Partial<TransferRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        id: null,
        name: "",
        details: "",
        conditions: "",
        policy: "",
        sortOrder: prev.length,
        isActive: true,
        packageCount: 0,
      },
    ]);
    setOpen(rows.length);
  }

  async function save(i: number) {
    const r = rows[i];
    setSavingIndex(i);
    const result = await runAction(() =>
      saveTransferOption(r.id, {
        name: r.name,
        details: r.details || null,
        conditions: r.conditions || null,
        policy: r.policy || null,
        sortOrder: r.sortOrder,
        isActive: r.isActive,
      })
    );
    setSavingIndex(null);
    if (result.success) {
      if (!r.id && "id" in result) update(i, { id: (result as { id: string }).id });
      toast.success(`${r.name || "Transfer"} saved`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to save");
    }
  }

  async function remove(i: number) {
    const r = rows[i];
    if (!r.id) {
      setRows((prev) => prev.filter((_, idx) => idx !== i));
      return;
    }
    const result = await runAction(() => deleteTransferOption(r.id!));
    if (result.success) {
      setRows((prev) => prev.filter((_, idx) => idx !== i));
      toast.success("Transfer option deleted");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  return (
    <div>
      <PageHeader
        title="Transfers"
        description="How guests reach the islands. Each package picks one of these, and the wording below is what appears on that package."
      />

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={r.id ?? `new-${i}`} className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center gap-3 p-4">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                {open === i ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
                <span className="font-medium text-slate-900">
                  {r.name || <span className="text-slate-400">Untitled transfer</span>}
                </span>
                {!r.isActive && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    Not offered
                  </span>
                )}
                {r.packageCount > 0 && (
                  <span className="text-xs text-slate-400">
                    {r.packageCount} {r.packageCount === 1 ? "package" : "packages"}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(i)}
                className="px-2 text-slate-400 hover:text-red-500"
                aria-label="Delete transfer option"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {open === i && (
              <div className="space-y-4 border-t border-slate-100 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
                    <input
                      value={r.name}
                      onChange={(e) => update(i, { name: e.target.value })}
                      placeholder="Speedboat, shared"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Order</label>
                    <input
                      type="number"
                      value={r.sortOrder}
                      onChange={(e) => update(i, { sortOrder: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Details</label>
                  <textarea
                    rows={3}
                    value={r.details}
                    onChange={(e) => update(i, { details: e.target.value })}
                    placeholder="What it is, how long it takes, when it runs."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Conditions</label>
                  <textarea
                    rows={3}
                    value={r.conditions}
                    onChange={(e) => update(i, { conditions: e.target.value })}
                    placeholder="Luggage limits, timing rules, what happens if a flight is late."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Policy</label>
                  <textarea
                    rows={3}
                    value={r.policy}
                    onChange={(e) => update(i, { policy: e.target.value })}
                    placeholder="Cancellation and change policy for the transfer itself."
                    className={inputClass}
                  />
                </div>

                <Toggle
                  checked={r.isActive}
                  onChange={(v) => update(i, { isActive: v })}
                  label="Offered on new packages"
                />

                <SubmitButton type="button" loading={savingIndex === i} onClick={() => save(i)}>
                  Save
                </SubmitButton>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-4 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" /> Add transfer option
        </button>
      </div>

      <ConfirmModal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          if (confirming !== null) remove(confirming);
          setConfirming(null);
        }}
        title="Delete this transfer option?"
        /* Said plainly, because the consequence is on other records. */
        description={
          confirming !== null && rows[confirming]?.packageCount
            ? `${rows[confirming].packageCount} package${rows[confirming].packageCount === 1 ? "" : "s"} use this. They will keep working but will no longer show a transfer until you give them another one. To stop offering it without affecting them, switch off "Offered on new packages" instead.`
            : "This cannot be undone."
        }
        confirmLabel="Delete"
      />
    </div>
  );
}

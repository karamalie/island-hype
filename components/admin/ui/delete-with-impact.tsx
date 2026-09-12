"use client";

// components/admin/ui/delete-with-impact.tsx
//
// The delete button, and the modal that tells you what you are about to destroy.
//
// It replaces `confirm("Delete this location?")` — a native browser dialog that
// named nothing, listed nothing, and was followed by a foreign-key failure
// anyway. Deleting an island takes its packages, its places to stay and its
// activities with it, and nobody should discover that afterwards.
//
// Three things it does that a plain confirm cannot:
//
//   It counts first. The impact is fetched when the button is pressed, so the
//   modal lists real records — "3 packages: Baros Romantic Escape, …" — rather
//   than a generic warning.
//
//   It separates destroyed from detached. An enquiry outlives the package it was
//   made against, and an activity coming off a package does not delete the
//   package. Lumping those in with the real losses would overstate the damage and
//   train people to ignore the dialog.
//
//   It asks for the name in writing when something substantial goes. Not
//   ceremony: the whole point is to make the pause long enough to read the list.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "./modal";
import { inputStyles } from "./form-field";
import type { DeleteImpact } from "@/lib/actions/delete-impact";
import { cn } from "@/lib/utils";

export interface DeleteWithImpactProps {
  /** Plain-language noun for the thing: "island", "package", "place to stay". */
  noun: string;
  /** Fetches the blast radius. Called when the button is pressed. */
  getImpact: () => Promise<DeleteImpact | { error: string }>;
  /** Performs the delete. */
  onDelete: () => Promise<{ success: boolean; error?: string }>;
  /** Where to go afterwards. */
  redirectTo: string;
  label?: string;
  className?: string;
}

export function DeleteWithImpact({
  noun,
  getImpact,
  onDelete,
  redirectTo,
  label,
  className,
}: DeleteWithImpactProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [impact, setImpact] = useState<DeleteImpact | null>(null);
  const [typed, setTyped] = useState("");

  async function begin() {
    setLoading(true);
    const result = await getImpact();
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setImpact(result);
    setTyped("");
    setOpen(true);
  }

  async function confirm() {
    if (!impact) return;
    setDeleting(true);
    const result = await onDelete();
    setDeleting(false);
    if (!result.success) {
      toast.error(result.error ?? "That didn't delete.");
      return;
    }
    setOpen(false);
    toast.success(`“${impact.name}” deleted`);
    router.push(redirectTo);
  }

  const destroyed = impact?.lines.filter((l) => l.destroyed) ?? [];
  const kept = impact?.lines.filter((l) => !l.destroyed) ?? [];
  const nameOk =
    !impact?.requiresTypedName ||
    typed.trim().toLowerCase() === impact.name.trim().toLowerCase();

  return (
    <>
      <button
        type="button"
        onClick={begin}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-60",
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {label ?? `Delete this ${noun}`}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} size="md">
        {impact && (
          <div>
            <div className="flex gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </span>
              <div className="min-w-0">
                <h2 className="m-0 text-base font-semibold text-slate-900">
                  Delete “{impact.name}”?
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {destroyed.length > 0
                    ? `This cannot be undone, and it does not only remove the ${noun}.`
                    : "This cannot be undone."}
                </p>
              </div>
            </div>

            {destroyed.length > 0 && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50/60 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-red-700">
                  Deleted along with it
                </p>
                <ul className="mt-2 space-y-1.5">
                  {destroyed.map((l) => (
                    <li key={l.label} className="text-sm text-slate-700">
                      <span className="font-medium text-slate-900">{l.label}</span>
                      {l.examples.length > 0 && (
                        <span className="text-slate-500">
                          {" — "}
                          {l.examples.join(", ")}
                          {l.examples.length < 3 ? "" : "…"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {kept.length > 0 && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kept
                </p>
                <ul className="mt-2 space-y-1.5">
                  {kept.map((l) => (
                    <li key={l.label} className="text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{l.label}</span>
                      {" — kept, but no longer linked to this "}
                      {noun}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {impact.requiresTypedName && (
              <div className="mt-5">
                <label
                  htmlFor="confirm-name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Type <span className="font-semibold">{impact.name}</span> to
                  confirm
                </label>
                <input
                  id="confirm-name"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  className={cn(inputStyles, "mt-1.5")}
                />
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={!nameOk || deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-200"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {destroyed.length > 0
                  ? `Delete ${noun} and everything listed`
                  : `Delete ${noun}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

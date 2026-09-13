"use client";

// components/admin/ui/form-draft.tsx
//
// The two controls that go with lib/admin/use-form-draft.ts: the banner that
// offers a recovered draft, and the button that clears the form.
//
// Both are written for someone who is not a developer and is mid-task. The
// banner says when the draft was made and what is not in it, because "restore?"
// with no detail is a question nobody can answer confidently. The clear button
// asks first, since one stray click should not undo twenty minutes of typing.

import { useState } from "react";
import { AlertCircle, RotateCcw, Trash2 } from "lucide-react";
import { Modal } from "./modal";
import { timeAgo } from "@/lib/admin/use-form-draft";

export function DraftBanner({
  savedAt,
  onRestore,
  onDiscard,
}: {
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-900">
          You have unsaved work from {timeAgo(savedAt)}
        </p>
        <p className="mt-0.5 text-xs leading-5 text-amber-800">
          This page was closed before it was saved. You can put back what was
          typed — {/* Said plainly here rather than discovered later. */}
          any photo that was chosen will need picking again.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-amber-600 px-3 text-xs font-medium text-white transition-colors hover:bg-amber-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Put it back
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-amber-300 bg-white px-3 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-100"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

export function ClearFormButton({
  isEdit,
  disabled,
  onClear,
}: {
  /** Decides what clearing MEANS, and so what the button says. */
  isEdit: boolean;
  disabled?: boolean;
  onClear: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  // On a new record, clearing empties the form. On an existing one it puts back
  // what is stored — a blanked edit form one click away from Save is a trap, and
  // "undo my changes" is what someone actually wants there anyway.
  const label = isEdit ? "Undo changes" : "Clear form";
  const question = isEdit
    ? "Put back the saved details?"
    : "Clear everything on this form?";
  const detail = isEdit
    ? "Every change you have made since opening this page will be dropped, and the fields will go back to what is currently live on the site. Nothing that is already saved will be deleted."
    : "Everything typed into this form will be removed, including the saved copy that would otherwise be offered back to you. This cannot be undone.";

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setConfirming(true)}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isEdit ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        {label}
      </button>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title={question}
        size="sm"
      >
        <p className="text-sm leading-6 text-slate-600">{detail}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={() => {
              onClear();
              setConfirming(false);
            }}
            className="inline-flex h-10 cursor-pointer items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            {label}
          </button>
        </div>
      </Modal>
    </>
  );
}

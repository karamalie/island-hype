"use client";

// components/admin/ui/save-panel.tsx
//
// Every editable block on a detail page is wrapped in one of these, so saving
// behaves identically everywhere. That consistency is the point: the person using
// this is not a developer, and a screen where some sections save with the page and
// others have their own button is a screen where work gets lost.
//
// What it guarantees:
//   - the Save button is disabled until something actually changes
//   - the result is stated in words next to the button, not only as a toast that
//     may have already faded
//   - a failed save says so and leaves the edits on screen to retry
//   - navigating away with unsaved changes prompts first
//
// The `help` line is not decoration. It says what the field does on the public
// site, which is the question someone editing it is actually asking.

import { useEffect, useState } from "react";
import { AlertCircle, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { SubmitButton } from "./submit-button";
import { cn } from "@/lib/utils";

export interface SavePanelProps {
  title: string;
  /** What this controls on the public site, in plain language. */
  help?: string;
  /** Shown when there is nothing to edit yet. */
  emptyNote?: string;
  saveLabel?: string;
  /** True when the form differs from what is stored. */
  dirty: boolean;
  onSave: () => Promise<{ success: boolean; error?: string }>;
  /** Called after a successful save so the parent can reset its baseline. */
  onSaved?: () => void;
  children: React.ReactNode;
  /** Right-aligned control in the header, e.g. an "Add row" button. */
  action?: React.ReactNode;
  className?: string;
}

export function SavePanel({
  title,
  help,
  saveLabel = "Save",
  dirty,
  onSave,
  onSaved,
  children,
  action,
  className,
}: SavePanelProps) {
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [savedOnce, setSavedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The confirmation is derived rather than stored, so it cannot describe a stale
  // state: the moment someone edits again, `dirty` goes true and the tick is gone
  // without any effect having to chase it.
  const showSaved = savedOnce && !dirty && state === "idle";

  useUnsavedWarning(dirty);

  async function handleSave() {
    setState("saving");
    setError(null);
    try {
      const result = await onSave();
      if (result.success) {
        setState("idle");
        setSavedOnce(true);
        setError(null);
        toast.success(`${title} saved`);
        onSaved?.();
      } else {
        setState("error");
        setError(result.error ?? "That didn't save. Try again.");
        toast.error(result.error ?? `${title} didn't save`);
      }
    } catch {
      setState("error");
      setError("Something went wrong saving that. Your changes are still here — try again.");
      toast.error(`${title} didn't save`);
    }
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-6",
        state === "error" && "border-red-200",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {help && (
            <p className="mt-1 flex max-w-[62ch] items-start gap-1.5 text-xs leading-5 text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>{help}</span>
            </p>
          )}
        </div>
        {action}
      </div>

      {children}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <SubmitButton
          type="button"
          loading={state === "saving"}
          disabled={!dirty}
          onClick={handleSave}
        >
          {saveLabel}
        </SubmitButton>

        {!dirty && !showSaved && (
          <span className="text-xs text-slate-400">No changes to save</span>
        )}
        {dirty && state === "idle" && (
          <span className="text-xs font-medium text-amber-600">
            Unsaved changes
          </span>
        )}
        {showSaved && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <Check className="h-3.5 w-3.5" />
            Saved — it&rsquo;s live on the site
          </span>
        )}
        {state === "error" && error && (
          <span className="flex items-start gap-1.5 text-xs text-red-600">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </span>
        )}
      </div>
    </section>
  );
}

/** Browser prompt before leaving with unsaved edits. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Browsers ignore custom text now, but the assignment is still required
      // for the prompt to show at all.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/** Tells the person what a value will look like on the site. */
export function PreviewNote({
  label = "On the site",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <p className="mt-1.5 text-xs text-slate-400">
      <span className="font-medium text-slate-500">{label}:</span> {children}
    </p>
  );
}

/** An empty-state line that explains the consequence of leaving it empty. */
export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
      {children}
    </p>
  );
}

"use client";

// lib/admin/use-form-draft.ts
//
// Keeps a local copy of what someone has typed, so a reload cannot take it.
//
// Error handling (lib/admin/run-action.ts) already stops a failed save from
// forcing a reload, which was the common way work got lost. This covers what
// that cannot: a closed tab, a crashed browser, a mis-clicked refresh, or a
// person who reloads because they were told to after a deploy.
//
// TWO DELIBERATE LIMITS.
//
// New records only. On an existing record the database is the truth, and a draft
// found three days later would silently overwrite whatever a colleague has
// changed since. That is a worse bug than the one this fixes, so `enabled` is
// meant to be passed `!isEdit`.
//
// A draft is never applied on its own. It is offered, and someone chooses — a
// form that quietly fills itself in is a form nobody trusts. Until that choice
// is made, autosave holds off, so looking at a restored draft and deciding
// against it does not overwrite the thing being offered.
//
// Files are not saved. A selected photograph cannot go in localStorage at any
// useful size, so the text and the dropdowns come back and the image has to be
// picked again. The banner says so rather than letting it be discovered.

import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "island-hype:draft:";

/** Long enough to outlast a crash and a coffee; short enough to not go stale. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const DEBOUNCE_MS = 700;

interface Stored<T> {
  values: T;
  savedAt: number;
}

export interface FormDraft<T> {
  /** A draft waiting on a decision. Non-null means show the banner. */
  pending: { values: T; savedAt: number } | null;
  restore: () => void;
  discard: () => void;
  /** Drop the draft without touching the form. Call after a successful save. */
  clear: () => void;
}

export function useFormDraft<T extends object>({
  key,
  enabled,
  values,
  baseline,
  onRestore,
}: {
  /** Form kind, e.g. "accommodation". Namespaced and versioned internally. */
  key: string;
  enabled: boolean;
  values: T;
  /**
   * What the form looks like untouched. A draft is only worth keeping when the
   * form differs from this.
   *
   * Checking "is anything non-empty" instead does not work, and failed in
   * exactly one way worth recording: the type dropdown defaults to "RESORT", a
   * perfectly non-empty string, so an untouched form looked full. Clearing the
   * form wrote the draft straight back, and merely opening "new" and walking
   * away left a draft to be offered later.
   */
  baseline: T;
  onRestore: (values: T) => void;
}): FormDraft<T> {
  const [pending, setPending] = useState<Stored<T> | null>(null);
  const [decided, setDecided] = useState(false);
  const storageKey = PREFIX + key;

  // Held in a ref so the debounce effect does not re-run whenever the parent
  // re-creates the callback, which it does on every render.
  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  useEffect(() => {
    if (!enabled) return;
    const found = read<T>(storageKey);
    if (!found) return;
    if (Date.now() - found.savedAt > MAX_AGE_MS) {
      remove(storageKey);
      return;
    }
    setPending(found);
  }, [enabled, storageKey]);

  // Serialised rather than compared by reference: `values` is rebuilt on every
  // render, so depending on the object itself would write on every keystroke's
  // render rather than on an actual change.
  const serialised = JSON.stringify(values);
  const untouched = serialised === JSON.stringify(baseline);

  useEffect(() => {
    if (!enabled) return;
    // Never write over a draft that is still being offered.
    if (pending && !decided) return;
    // An untouched form is not a draft, and clearing one has to actually clear
    // it rather than have the debounce write it back a moment later.
    if (untouched) {
      remove(storageKey);
      return;
    }
    const timer = setTimeout(() => {
      write(storageKey, { values, savedAt: Date.now() });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialised, untouched, enabled, storageKey, pending, decided]);

  const restore = useCallback(() => {
    if (!pending) return;
    onRestoreRef.current(pending.values);
    setDecided(true);
    setPending(null);
  }, [pending]);

  const discard = useCallback(() => {
    remove(storageKey);
    setDecided(true);
    setPending(null);
  }, [storageKey]);

  const clear = useCallback(() => {
    remove(storageKey);
    setDecided(true);
    setPending(null);
  }, [storageKey]);

  return { pending, restore, discard, clear };
}

// localStorage throws in a private window and when site data is blocked, and a
// form that cannot save a draft must still work perfectly. Every access is
// guarded and every failure is silent.

function read<T>(key: string): Stored<T> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored<T>;
    return parsed && typeof parsed.savedAt === "number" && parsed.values
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: Stored<T>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota, private mode, blocked storage — the form still works */
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* as above */
  }
}

/** "4 minutes ago", for the banner. */
export function timeAgo(at: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (seconds < 60) return "moments ago";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

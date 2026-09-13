"use client";

// lib/admin/run-action.ts
//
// Calls a server action and turns a THROWN failure into a returned one.
//
// Every admin form was written as if a server action could only fail by
// returning { success: false }:
//
//     setLoading(true);
//     const result = await createAccommodation(formData);
//     setLoading(false);                 // never runs if the action throws
//     if (result.success) { ... } else { toast.error(...) }
//
// Plenty of real failures throw instead: a body over the size limit, a dropped
// connection, a deploy that landed while the page was open and invalidated the
// action id. When that happened the promise rejected, setLoading(false) never
// ran, the submit button span forever, and no message appeared anywhere. The
// only way out of a permanently-spinning button is to reload the page — and THAT
// is what threw away everything the person had typed. The form state itself had
// survived the failure perfectly well.
//
// So this never rejects. Whatever happens, the caller gets an object, the code
// after the await runs, the button is released and the person is told something
// they can act on.

import { toast } from "sonner";

/**
 * A deploy replaces every Server Action id, so a tab opened before it holds ids
 * the server no longer knows. Nothing about that is recoverable by retrying, and
 * the page is broken for saving until it is reloaded — so it is worth
 * interrupting for, once, with the only button that helps.
 *
 * This is not hypothetical: seven deploys went out in one afternoon while a
 * colleague had a package open, and the production log shows him pressing Save
 * ten times against the same dead action id because the message said "try
 * again".
 */
export function isStaleDeployment(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return /failed to find server action|unrecognizedaction/i.test(message);
}

let reloadPrompted = false;

/** Shown once per page load, however many saves fail after it. */
function promptReload() {
  if (reloadPrompted) return;
  reloadPrompted = true;
  toast.error("The site was updated while this page was open", {
    description:
      "Saving will keep failing until the page is reloaded. Copy anything you have not saved first.",
    duration: Infinity,
    action: { label: "Reload", onClick: () => window.location.reload() },
  });
}

/** What the actions return. `data` rides along on the ones that create a row. */
type ActionResult = { success: boolean; error?: string };

export async function runAction<T extends ActionResult>(
  call: () => Promise<T>,
  fallback = "Something went wrong. Nothing was saved."
): Promise<T | { success: false; error: string }> {
  try {
    return await call();
  } catch (err) {
    if (isStaleDeployment(err)) promptReload();
    return { success: false, error: explainActionError(err, fallback) };
  }
}

/**
 * Plain language for the failures staff will actually meet. The raw messages are
 * written for the developer who configured the limit, not for the person who
 * just lost ten minutes of typing: "Body exceeded 55 MB limit" reads as a bug
 * rather than as "your photo is too big".
 */
export function explainActionError(
  err: unknown,
  fallback = "Something went wrong. Nothing was saved."
): string {
  const message = err instanceof Error ? err.message : String(err ?? "");

  if (/body exceeded|413|too large|payload/i.test(message)) {
    return "That file was too large for the server to accept. Try a smaller photo — nothing else on the form has been lost.";
  }

  // Next invalidates action ids on every deploy, so a tab left open across a
  // release hits this on its next save.
  if (/failed to find server action|unrecognizedaction/i.test(message)) {
    return "The site was updated while this page was open. Reload the page, then save again.";
  }

  if (/failed to fetch|networkerror|load failed|err_network|connection/i.test(message)) {
    return "Could not reach the server. Check your connection and try again — nothing on the form has been lost.";
  }

  if (/unexpected end of form|aborted/i.test(message)) {
    return "The upload was cut off before it finished. Try again, and check the file is not larger than 50 MB.";
  }

  return fallback;
}

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

/** What the actions return. `data` rides along on the ones that create a row. */
type ActionResult = { success: boolean; error?: string };

export async function runAction<T extends ActionResult>(
  call: () => Promise<T>,
  fallback = "Something went wrong. Nothing was saved."
): Promise<T | { success: false; error: string }> {
  try {
    return await call();
  } catch (err) {
    return { success: false, error: explain(err, fallback) };
  }
}

/**
 * Plain language for the failures staff will actually meet. The raw messages are
 * written for the developer who configured the limit, not for the person who
 * just lost ten minutes of typing: "Body exceeded 55 MB limit" reads as a bug
 * rather than as "your photo is too big".
 */
function explain(err: unknown, fallback: string): string {
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

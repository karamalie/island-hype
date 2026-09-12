"use client";

// app/admin/(authenticated)/error.tsx
//
// What staff see when an admin page throws.
//
// This sits inside the authenticated layout, so the sidebar survives and the
// person can navigate away instead of being stranded. That is the main point of
// putting it here rather than one level up.
//
// The copy is written for someone who is not a developer and who has, quite
// possibly, just lost work. So it answers the three questions they will actually
// have, in order: did I break something, did my edits save, and what do I do
// now. It does not show a stack trace — that is in the server log, where it is
// useful — but it does show the digest, because that is the one string that lets
// a developer find the failure from a message saying "the packages page broke".

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div className="min-w-0">
            <h1 className="m-0 text-base font-semibold text-slate-900">
              This page couldn&rsquo;t load
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              You didn&rsquo;t break anything, and nothing on the public site has
              changed because of this. Loading the page failed — usually a brief
              connection problem with the database.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              <strong className="font-medium text-slate-900">
                Anything you had saved is still saved.
              </strong>{" "}
              Anything you had typed but not yet saved is gone, so if you were
              part-way through an edit you will need to enter it again.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Try loading it again
              </button>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to the dashboard
              </Link>
            </div>

            <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              If it keeps happening, send this to whoever maintains the site — it
              tells them exactly which failure to look for:
              <br />
              <span className="mt-1 inline-block font-mono text-slate-700">
                {error.digest ?? (error.message.slice(0, 200) || "no reference given")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

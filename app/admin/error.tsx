"use client";

// app/admin/error.tsx
//
// The outer admin boundary. It catches what the inner one cannot: a failure in
// the authenticated layout itself, and anything thrown by the login page.
//
// The layout's own work is reading the session, so the realistic failure here is
// a session-cookie problem — most often SESSION_SECRET missing or changed on the
// server, which makes every existing cookie undecryptable. Signing in again is
// the fix a person can apply themselves, so that is the action offered, and the
// sidebar is deliberately absent because the layout that renders it is what
// failed.

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AdminShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin shell error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-6">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div className="min-w-0">
            <h1 className="m-0 text-base font-semibold text-slate-900">
              The admin panel couldn&rsquo;t start
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is usually a sign-in problem rather than a fault with your
              content. Signing in again clears it in most cases. The public site
              is unaffected and stays online.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Try again
              </button>
              <Link
                href="/admin/login"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
              >
                Sign in again
              </Link>
            </div>

            <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
              Reference for whoever maintains the site:
              <br />
              <span className="mt-1 inline-block font-mono text-slate-700">
                {error.digest ?? (error.message.slice(0, 200) || "none given")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

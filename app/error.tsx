"use client";

// app/error.tsx
//
// What a visitor sees when a page throws.
//
// Without this file they get Next's own screen: the words "Application error: a
// server-side exception has occurred", a hex digest, and no way onward — on a
// site whose whole job is to get someone to enquire about a holiday.
//
// So this keeps the nav and the footer, which means every route out of here
// still works, and says the one useful thing: the trip pages are fine, try
// again, and here is how to reach a person if it keeps happening.

import { useEffect } from "react";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { NavBar } from "@/components/layout/nav-bar";

// This page has no data dependencies, on purpose, and that constraint is worth
// stating because breaking it fails silently.
//
// An error boundary is a client component, so it cannot import <Footer /> — the
// footer is an async server component that awaits getContactDetails(). Importing
// it here does not error at build time; it just makes the whole boundary render
// nothing, which is how this page shipped blank the first time.
//
// The deeper reason is the same either way: this renders when something has
// already failed, and the database is the likeliest candidate. An error page
// that queries for its own contact address can fail to render at all. So the
// address is a literal. Changing it in admin will not change it here, which is
// the right way round — better slightly stale than a blank screen.
const SUPPORT_EMAIL = "info@islandhypemaldives.com";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The server log holds the stack; the browser only ever sees the digest, so
    // record it here to tie a reported "it broke" back to a specific failure.
    console.error("Page error", error.digest ?? "", error.message);
  }, [error]);

  return (
    <>
      <NavBar surface="solid" cta={{ label: "Book now", href: "/packages" }} />

      <main>
        <Container className="py-[clamp(64px,12vh,140px)]">
          <div className="max-w-[560px]">
            <p className="mb-4 font-mono text-label-sm uppercase tracking-[0.08em] text-meta">
              Something went wrong
            </p>
            <h1 className="m-0 mb-4 text-display-l text-ink-900">
              This page didn&rsquo;t load.
            </h1>
            <p className="m-0 mb-8 text-body-l text-ink-700">
              It&rsquo;s our end, not yours, and nothing you did caused it.
              Trying again usually works — the packages and islands themselves
              are unaffected.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={reset}>Try again</Button>
              <Link href="/packages">
                <Button variant="outline">Browse packages</Button>
              </Link>
            </div>

            <p className="mt-10 text-body-s text-meta">
              Still stuck? Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-ink-900 underline decoration-ink-200 underline-offset-4 hover:decoration-ink-900"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              and we&rsquo;ll answer directly.
              {error.digest && (
                <>
                  {" "}
                  Quote reference{" "}
                  <span className="font-mono text-ink-700">{error.digest}</span>{" "}
                  and we can find what failed.
                </>
              )}
            </p>
          </div>
        </Container>
      </main>

      {/* A minimal footer rather than <Footer />. See the note at the top. */}
      <footer className="border-t border-ink-200 bg-white">
        <Container className="flex flex-wrap items-center gap-x-6 gap-y-2 py-8 text-body-s text-meta">
          <span>&copy; {new Date().getFullYear()} Island Hype</span>
          <Link href="/" className="hover:text-ink-900">
            Home
          </Link>
          <Link href="/packages" className="hover:text-ink-900">
            Packages
          </Link>
          <Link href="/locations" className="hover:text-ink-900">
            Locations
          </Link>
          <Link href="/contact" className="hover:text-ink-900">
            Contact
          </Link>
        </Container>
      </footer>
    </>
  );
}

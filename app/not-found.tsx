// app/not-found.tsx
//
// A 404 with a way out.
//
// This fires on a mistyped URL, but more usefully on a package or island that
// has been unpublished since someone saved the link or since Google crawled it.
// That is the likely case for a travel site, so the page says so rather than
// implying the visitor got it wrong — and then offers the two lists that would
// contain whatever they were looking for.

import type { Metadata } from "next";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { Footer } from "@/components/layout/footer";
import { NavBar } from "@/components/layout/nav-bar";

// The robots line is not redundant, though it looks it. Next emits its own
// `noindex` for a not-found render, and the root layout sets `index: true` for
// the whole site — so leaving this out puts two CONTRADICTING robots tags in the
// document. Restating it here overrides the root's value, and the two tags that
// remain at least agree with each other.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <NavBar surface="solid" cta={{ label: "Book now", href: "/packages" }} />

      <main>
        <Container className="py-[clamp(64px,12vh,140px)]">
          <div className="max-w-[560px]">
            <p className="mb-4 font-mono text-label-sm uppercase tracking-[0.08em] text-meta">
              Not found
            </p>
            <h1 className="m-0 mb-4 text-display-l text-ink-900">
              That page isn&rsquo;t here.
            </h1>
            <p className="m-0 mb-8 text-body-l text-ink-700">
              Either the address is slightly off, or a trip that used to live at
              this link has come off the site. Everything currently bookable is
              on these two pages.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/packages">
                <Button>See all packages</Button>
              </Link>
              <Link href="/locations">
                <Button variant="outline">Browse the islands</Button>
              </Link>
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}

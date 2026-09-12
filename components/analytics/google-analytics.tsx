"use client";

// components/analytics/google-analytics.tsx
//
// GA4, with three conditions on when it actually loads.
//
// NOT IN THE ADMIN PANEL. Staff spend hours in /admin editing packages; counting
// that as site traffic would corrupt every number the business looks at — session
// counts, engagement time, the lot. The panel is also private, so page paths like
// /admin/packages/<id> have no business being sent to Google.
//
// NOT IN DEVELOPMENT. Local page loads would land in the same property as real
// visitors. Set NEXT_PUBLIC_GA_DEBUG=1 to override when verifying the tag itself.
//
// The measurement ID is hardcoded as the default rather than required from the
// environment, deliberately. It is not a secret — it ships in the HTML of every
// page and is visible to anyone who views source — and `.env*` is gitignored, so
// an env-only ID would silently produce a site with no analytics the first time
// someone forgot to set it on the server. NEXT_PUBLIC_GA_ID still overrides it,
// which is what a second property (staging, a different client) would use.
//
// Route changes are tracked manually. The App Router does a client-side
// navigation between pages, which fires no page load, so gtag's automatic
// page_view would only ever record the first page of a visit.

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-EFRGYH61EE";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const enabled =
    !isAdmin &&
    Boolean(GA_ID) &&
    (process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_GA_DEBUG === "1");

  useEffect(() => {
    if (!enabled || typeof window.gtag !== "function") return;
    const qs = searchParams?.toString();
    window.gtag("event", "page_view", {
      page_path: qs ? `${pathname}?${qs}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [enabled, pathname, searchParams]);

  if (!enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // send_page_view is off because the effect above sends them, including
          // on client-side route changes, which the automatic one misses.
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}

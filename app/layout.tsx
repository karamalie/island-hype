import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Lora } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

/** Empty unless a CDN is configured. See lib/design/optimized-image.ts. */
const CDN = process.env.NEXT_PUBLIC_CDN_URL ?? "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The display face. Lora — chosen by the client from the comparison page, and
 * the sturdiest option of everything measured.
 *
 * The logo is an elegant serif while the headings were a neo-grotesque sans, so
 * nothing on the page echoed the mark. Two earlier attempts failed on the same
 * axis, and the reason is worth keeping because it is not a matter of taste: the
 * hero sets white type over a photograph, and a high-contrast serif's hairline
 * is the first thing to disappear there. Measured at 64px, thinnest stroke and
 * stem-to-hairline contrast:
 *
 *   Bodoni Moda      0.46px   15.0x   sub-pixel — cannot render solidly
 *   Fraunces         0.91px    7.0x   still thin, despite its reputation
 *   Literata         1.83px    3.8x
 *   Source Serif 4   1.83px    3.0x
 *   Newsreader       2.29px    3.2x
 *   Spectral         2.74px    2.7x
 *   Lora             3.20px    2.3x   <- this one
 *
 * At 3.20px Lora's thinnest stroke is seven times Bodoni's, which is why it
 * holds up white-on-photograph at weight 400 without needing the weight raised.
 *
 * No `axes` here, unlike the previous two: Lora ships weight and italic only and
 * has no optical-size axis — requesting opsz is a 400 from Google Fonts and
 * would fail the build.
 */
const displaySerif = Lora({
  variable: "--font-display-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Island Hype - Maldives Travel Packages",
    template: "%s | Island Hype",
  },
  description:
    "Discover handpicked Maldives resort and guesthouse packages. From luxury water villas to authentic local experiences. Book your dream island getaway today.",
  keywords: [
    "Maldives",
    "travel",
    "resort",
    "guesthouse",
    "honeymoon",
    "diving",
    "snorkeling",
    "beach vacation",
    "water villa",
    "island holiday",
  ],
  authors: [{ name: "Island Hype" }],
  creator: "Island Hype",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Island Hype",
    title: "Island Hype — Stay somewhere worth the hype",
    description:
      "Discover handpicked Maldives resort and guesthouse packages. Book your dream island getaway today.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Island Hype — Stay somewhere worth the hype",
    description: "Discover handpicked Maldives resort and guesthouse packages.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /**
     * The font variable classes go on <html>, not <body>, and that is a fix
     * rather than a preference.
     *
     * next/font exposes each family as a custom property on whatever element
     * carries its className. globals.css then builds the theme tokens on top:
     * `--font-sans: var(--font-geist-sans), ui-sans-serif, ...`, emitted by
     * Tailwind's @theme onto `:root`.
     *
     * With the classes on <body> those two never met. --font-geist-sans was
     * defined on body while --font-sans was declared on :root, so at :root the
     * inner var() had nothing to resolve — and a custom property whose value
     * references an undefined variable is invalid at computed-value time, which
     * for a custom property means it computes to EMPTY. Every descendant then
     * inherited that emptiness, `font-family: var(--font-sans)` was dropped as
     * invalid, and the whole site rendered in the browser's default sans while
     * still downloading Geist, Geist Mono and the display serif and using none
     * of them.
     *
     * On <html> the variables and the tokens that consume them sit on the same
     * element, so they resolve.
     */
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySerif.variable}`}
    >
      <body className="antialiased">
        {/*
          If the CDN stops answering — an unpaid invoice, an outage, a DNS
          mistake — every photograph on the site is pointed at a host that no
          longer serves them, and there is no server round trip left in which to
          notice. So the browser is told how to recover.

          One delegated listener rather than an onError on each image: these are
          server components, and giving PhotoFrame an event handler would turn it
          and everything containing it into client components for a case that
          should never happen. Error events do not bubble, hence the capture
          phase.

          The srcset and any <picture> sources have to go before the src is
          rewritten. A browser that has already chosen a CDN candidate will
          simply re-choose another CDN candidate otherwise, and inside a
          <picture> a failed <source> never falls through to the <img> at all.

          Rewriting to a same-origin path means the second attempt goes to the
          server that was always able to serve it. If that fails too the prefix
          no longer matches, so nothing loops.
        */}
        {CDN && (
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(c){addEventListener('error',function(e){var t=e.target;" +
                "if(!t||t.tagName!=='IMG')return;var s=t.currentSrc||t.src;" +
                "if(!s||s.lastIndexOf(c,0)!==0)return;var p=t.parentNode;" +
                "if(p&&p.tagName==='PICTURE'){var q=p.getElementsByTagName('source');" +
                "while(q.length)p.removeChild(q[0]);}" +
                "t.removeAttribute('srcset');t.removeAttribute('sizes');" +
                "t.src=s.slice(c.length);},true);})(" +
                JSON.stringify(CDN) +
                ");",
            }}
          />
        )}
        {children}
        {/* Suspense because GoogleAnalytics reads useSearchParams, which opts
            its subtree into client-side rendering — without a boundary here
            that would apply to the whole app and de-opt every static page. */}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
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
    title: "Island Hype - Maldives Travel Packages",
    description:
      "Discover handpicked Maldives resort and guesthouse packages. Book your dream island getaway today.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Island Hype - Maldives Travel Packages",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
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

// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

// middleware.ts (in project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const response = NextResponse.next();

  // Detect market based on subdomain or domain
  let market: "LOCAL" | "INTERNATIONAL" = "INTERNATIONAL";

  // Check for local market indicators
  if (
    hostname.startsWith("mv.") || // mv.islandhype.com
    hostname.endsWith(".mv") || // islandhype.mv
    hostname.includes("localhost:3001") // Local dev for local market
  ) {
    market = "LOCAL";
  }

  // Set market in request header for server components
  response.headers.set("x-market", market);

  // Set a cookie for client components (accessible via document.cookie or useCookies)
  response.cookies.set("market", market, {
    httpOnly: false, // Accessible from JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};

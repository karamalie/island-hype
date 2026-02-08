// middleware.ts (in project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth/session";

const sessionOptions = {
  password:
    process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "island-hype-admin-session",
};

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // --- Market Detection ---
  let market: "LOCAL" | "INTERNATIONAL" = "INTERNATIONAL";

  if (
    hostname.startsWith("mv.") ||
    hostname.endsWith(".mv") ||
    hostname.includes("localhost:3001")
  ) {
    market = "LOCAL";
  }

  response.headers.set("x-market", market);
  response.cookies.set("market", market, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  // --- Admin Route Protection ---
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = await getIronSession<SessionData>(
      request,
      response,
      sessionOptions
    );

    if (!session.isLoggedIn) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};

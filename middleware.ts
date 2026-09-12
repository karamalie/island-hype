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

  // The Maldivian market is chosen by hostname alone.
  //
  // There used to be a third condition here, `hostname.includes("localhost:3001")`,
  // and it was a live hazard: 3001 is the port the PRODUCTION app listens on
  // behind nginx, not a development port. Any request that reached the app with
  // its internal host — a health check, a direct curl to 127.0.0.1:3001, a proxy
  // missing `proxy_set_header Host` — would have switched the whole response to
  // MVR pricing for an international visitor. It never fired in practice because
  // nginx does forward the real Host, but that is one config line away from
  // being wrong, and the failure is silently mispriced trips.
  if (hostname.startsWith("mv.") || hostname.endsWith(".mv")) {
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
      // Built from the forwarded headers, not from request.url.
      //
      // Behind nginx the app is reached on 127.0.0.1:3001, and in standalone
      // mode `request.url` carries that internal origin — so this redirect was
      // sending anyone who opened /admin to https://localhost:3001/admin/login,
      // which resolves nowhere. The Host header is correct (nginx sets it), so
      // the public origin is rebuilt from that.
      const forwardedHost =
        request.headers.get("x-forwarded-host") ?? request.headers.get("host");
      const forwardedProto =
        request.headers.get("x-forwarded-proto") ??
        request.nextUrl.protocol.replace(":", "");
      const origin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : request.nextUrl.origin;

      return NextResponse.redirect(new URL("/admin/login", origin));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};

import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  username: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
}

const defaultSession: SessionData = {
  userId: "",
  username: "",
  name: "",
  email: "",
  isLoggedIn: false,
};

/**
 * How long a signed-in admin stays signed in.
 *
 * It was eight hours, which meant staff logging in each morning and again after
 * lunch. Sixty days now — these are a handful of known people maintaining a
 * catalogue, not a banking console.
 *
 * ONE NUMBER, AND IT HAS TO BE. There are two independent limits here and only
 * one of them used to be visible: the cookie's max-age, and iron-session's own
 * `ttl`, which seals an expiry INTO the encrypted payload and defaults to
 * fourteen days when unset. Raising max-age alone would have kept the cookie in
 * the browser for sixty days while the server rejected its contents on day
 * fourteen — a logout with no apparent cause, two weeks after the change that
 * caused it.
 *
 * So `ttl` is set and `maxAge` is deliberately NOT: iron-session derives the
 * cookie's max-age from ttl (ttl - 60s, the margin covering clock skew between
 * the browser and the server). The two cannot drift apart because there is only
 * one of them.
 */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 60; // 60 days

const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "island-hype-admin-session",
  ttl: SESSION_TTL_SECONDS,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // No maxAge: see the note above. iron-session sets it from ttl.
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );

  if (!session.isLoggedIn) {
    session.userId = defaultSession.userId;
    session.username = defaultSession.username;
    session.name = defaultSession.name;
    session.email = defaultSession.email;
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}

export { sessionOptions };

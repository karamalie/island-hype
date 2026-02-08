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

const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "island-hype-admin-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
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

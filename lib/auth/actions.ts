"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSession } from "./session";
import { findUserByUsername } from "./config";

export async function login(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const user = findUserByUsername(username);
  if (!user) {
    return { error: "Invalid username or password." };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return { error: "Invalid username or password." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.name = user.name;
  session.email = user.email;
  session.isLoggedIn = true;
  await session.save();

  redirect("/admin/dashboard");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}

export async function getSessionUser() {
  const session = await getSession();
  if (!session.isLoggedIn) return null;
  return {
    userId: session.userId,
    username: session.username,
    name: session.name,
    email: session.email,
  };
}

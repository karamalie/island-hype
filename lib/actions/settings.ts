"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getSetting(key: string) {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value || "";
}

export async function updateSetting(key: string, value: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save setting" };
  }
}

export async function getNotificationEmails(): Promise<string[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "notification_emails" },
    });
    if (!setting?.value) return [];
    return setting.value
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

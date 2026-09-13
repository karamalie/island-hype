"use server";

// lib/actions/transfers.ts
//
// How guests reach an island, written once and chosen per package.
//
// One global list rather than a set per location. The same shared speedboat is
// described identically on every package that uses it, and the wording — the
// conditions especially, which is where the luggage limits and the late-flight
// rules live — is the kind of text that goes stale in three places at once when
// it is kept in three places.
//
// Deleting is a soft retire by default: Package.transferOptionId is SetNull, so
// a hard delete would quietly strip the transfer from every package that used
// it. `isActive` takes it out of the dropdown for new packages while leaving the
// ones already sold intact.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getTransferOptions() {
  return prisma.transferOption.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { packages: true } } },
  });
}

/** Only what a package should be allowed to pick going forward. */
export async function getActiveTransferOptions() {
  return prisma.transferOption.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}

export interface TransferInput {
  name: string;
  details: string | null;
  conditions: string | null;
  policy: string | null;
  sortOrder: number;
  isActive: boolean;
}

export async function saveTransferOption(id: string | null, data: TransferInput) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  if (!data.name.trim()) return { success: false, error: "Give the transfer a name." };

  try {
    const row = id
      ? await prisma.transferOption.update({ where: { id }, data })
      : await prisma.transferOption.create({ data });
    revalidatePath("/admin/transfers");
    revalidatePath("/packages");
    return { success: true, id: row.id };
  } catch {
    return { success: false, error: "Failed to save the transfer option." };
  }
}

/**
 * Hard delete, and it says what it will cost before doing it — the caller shows
 * the package count. Packages keep existing; they simply lose their transfer.
 */
export async function deleteTransferOption(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.transferOption.delete({ where: { id } });
    revalidatePath("/admin/transfers");
    revalidatePath("/packages");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete the transfer option." };
  }
}

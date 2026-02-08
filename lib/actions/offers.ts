"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import type { DiscountType, Market } from "@prisma/client";

export async function getOffers() {
  return prisma.offer.findMany({
    orderBy: { createdAt: "desc" },
    include: { package: { select: { id: true, name: true } } },
  });
}

export async function getOffer(id: string) {
  return prisma.offer.findUnique({
    where: { id },
    include: { package: { select: { id: true, name: true } } },
  });
}

export async function createOffer(formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const description = (formData.get("description") as string) || null;
  const badge = (formData.get("badge") as string) || null;
  const discountType = formData.get("discountType") as DiscountType;
  const discountValue = parseFloat(formData.get("discountValue") as string);
  const code = (formData.get("code") as string) || null;
  const validFrom = new Date(formData.get("validFrom") as string);
  const validUntil = new Date(formData.get("validUntil") as string);
  const minNights = formData.get("minNights")
    ? parseInt(formData.get("minNights") as string)
    : null;
  const minGuests = formData.get("minGuests")
    ? parseInt(formData.get("minGuests") as string)
    : null;
  const marketStr = formData.get("market") as string;
  const market = marketStr ? (marketStr as Market) : null;
  const packageId = formData.get("packageId") as string;
  const isActive = formData.get("isActive") === "true";

  if (!name || !discountType || !discountValue || !packageId) {
    return { success: false, error: "Required fields are missing" };
  }

  try {
    const offer = await prisma.offer.create({
      data: {
        name,
        slug,
        description,
        badge,
        discountType,
        discountValue,
        code,
        validFrom,
        validUntil,
        minNights,
        minGuests,
        market,
        packageId,
        isActive,
      },
    });
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true, data: offer };
  } catch {
    return { success: false, error: "Failed to create offer" };
  }
}

export async function updateOffer(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const description = (formData.get("description") as string) || null;
  const badge = (formData.get("badge") as string) || null;
  const discountType = formData.get("discountType") as DiscountType;
  const discountValue = parseFloat(formData.get("discountValue") as string);
  const code = (formData.get("code") as string) || null;
  const validFrom = new Date(formData.get("validFrom") as string);
  const validUntil = new Date(formData.get("validUntil") as string);
  const minNights = formData.get("minNights")
    ? parseInt(formData.get("minNights") as string)
    : null;
  const minGuests = formData.get("minGuests")
    ? parseInt(formData.get("minGuests") as string)
    : null;
  const marketStr = formData.get("market") as string;
  const market = marketStr ? (marketStr as Market) : null;
  const packageId = formData.get("packageId") as string;
  const isActive = formData.get("isActive") === "true";

  try {
    await prisma.offer.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        badge,
        discountType,
        discountValue,
        code,
        validFrom,
        validUntil,
        minNights,
        minGuests,
        market,
        packageId,
        isActive,
      },
    });
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update offer" };
  }
}

export async function deleteOffer(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.offer.delete({ where: { id } });
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete offer" };
  }
}

export async function toggleOfferActive(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) return { success: false, error: "Not found" };
    await prisma.offer.update({
      where: { id },
      data: { isActive: !offer.isActive },
    });
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/lib/storage";
import { getStoragePath } from "@/lib/image-urls";
import type { TransferType } from "@prisma/client";

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { accommodations: true, packages: true } },
    },
  });
}

export async function getLocation(id: string) {
  return prisma.location.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createLocation(formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const description = formData.get("description") as string;
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const atoll = formData.get("atoll") as string;
  const island = (formData.get("island") as string) || null;
  const latitude = formData.get("latitude")
    ? parseFloat(formData.get("latitude") as string)
    : null;
  const longitude = formData.get("longitude")
    ? parseFloat(formData.get("longitude") as string)
    : null;
  const transferType = (formData.get("transferType") as TransferType) || null;
  const transferTime = formData.get("transferTime")
    ? parseInt(formData.get("transferTime") as string)
    : null;
  const transferInfo = (formData.get("transferInfo") as string) || null;
  const isFeatured = formData.get("isFeatured") === "true";
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!name || !description || !atoll) {
    return { success: false, error: "Name, description, and atoll are required" };
  }

  // Handle cover image upload
  const coverFile = formData.get("coverImage") as File | null;
  let coverImage: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const uploadResult = await uploadImage(coverFile, { bucket: "locations" });
    if (uploadResult.error) return { success: false, error: uploadResult.error };
    coverImage = uploadResult.path;
  }

  try {
    const location = await prisma.location.create({
      data: {
        name, slug, description, shortDesc, atoll, island,
        latitude, longitude, transferType, transferTime, transferInfo,
        isFeatured, isActive, sortOrder, coverImage,
      },
    });
    revalidatePath("/admin/locations");
    revalidatePath("/");
    return { success: true, data: location };
  } catch {
    return { success: false, error: "Failed to create location" };
  }
}

export async function updateLocation(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const description = formData.get("description") as string;
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const atoll = formData.get("atoll") as string;
  const island = (formData.get("island") as string) || null;
  const latitude = formData.get("latitude")
    ? parseFloat(formData.get("latitude") as string)
    : null;
  const longitude = formData.get("longitude")
    ? parseFloat(formData.get("longitude") as string)
    : null;
  const transferType = (formData.get("transferType") as TransferType) || null;
  const transferTime = formData.get("transferTime")
    ? parseInt(formData.get("transferTime") as string)
    : null;
  const transferInfo = (formData.get("transferInfo") as string) || null;
  const isFeatured = formData.get("isFeatured") === "true";
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  try {
    await prisma.location.update({
      where: { id },
      data: {
        name, slug, description, shortDesc, atoll, island,
        latitude, longitude, transferType, transferTime, transferInfo,
        isFeatured, isActive, sortOrder,
      },
    });
    revalidatePath("/admin/locations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update location" };
  }
}

export async function deleteLocation(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.location.delete({ where: { id } });
    revalidatePath("/admin/locations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete location" };
  }
}

export async function toggleLocationActive(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const loc = await prisma.location.findUnique({ where: { id } });
    if (!loc) return { success: false, error: "Not found" };
    await prisma.location.update({
      where: { id },
      data: { isActive: !loc.isActive },
    });
    revalidatePath("/admin/locations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function toggleLocationFeatured(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const loc = await prisma.location.findUnique({ where: { id } });
    if (!loc) return { success: false, error: "Not found" };
    await prisma.location.update({
      where: { id },
      data: { isFeatured: !loc.isFeatured },
    });
    revalidatePath("/admin/locations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle featured" };
  }
}

export async function uploadLocationImage(locationId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, { bucket: "locations", folder: locationId });
    if (result.error) return { success: false, error: result.error };

    await prisma.locationImage.create({
      data: { url: result.path, alt: file.name, locationId },
    });
    revalidatePath(`/admin/locations/${locationId}`);
    return { success: true, url: result.url, id: result.path };
  } catch {
    return { success: false, error: "Failed to upload image" };
  }
}

export async function deleteLocationImage(imageId: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const image = await prisma.locationImage.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, error: "Image not found" };

    await deleteImage("locations", image.url);

    await prisma.locationImage.delete({ where: { id: imageId } });
    revalidatePath(`/admin/locations/${image.locationId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete image" };
  }
}

export async function setCoverImage(locationId: string, imageUrl: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.location.update({
      where: { id: locationId },
      data: { coverImage: getStoragePath(imageUrl, "locations") },
    });
    revalidatePath(`/admin/locations/${locationId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to set cover image" };
  }
}

export async function uploadLocationCoverImage(locationId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, { bucket: "locations" });
    if (result.error) return { success: false, error: result.error };

    await prisma.location.update({
      where: { id: locationId },
      data: { coverImage: result.path },
    });
    revalidatePath(`/admin/locations/${locationId}`);
    revalidatePath("/");
    return { success: true, url: result.url };
  } catch {
    return { success: false, error: "Failed to upload cover image" };
  }
}

/**
 * The label for the middle band of the season strip — "Mantas" for Baa, "Whale
 * sharks" for Dhigurah. It saves with the calendar rather than with the general
 * details form, because on its own it means nothing.
 */
export async function updateLocationSeasonLabel(locationId: string, label: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.location.update({
      where: { id: locationId },
      data: { seasonHighlightLabel: label.trim() || null },
    });
    revalidatePath(`/admin/locations/${locationId}`);
    revalidatePath("/locations");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save the season label" };
  }
}

/** The display fields on an island: region, what it is known for, best months. */
export async function updateLocationCharacter(
  locationId: string,
  data: { region: string; knownFor: string; bestMonths: string }
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.location.update({
      where: { id: locationId },
      data: {
        region: data.region.trim() || null,
        knownFor: data.knownFor.trim() || null,
        bestMonths: data.bestMonths.trim() || null,
      },
    });
    revalidatePath(`/admin/locations/${locationId}`);
    revalidatePath("/locations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save those details" };
  }
}

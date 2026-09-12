"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/lib/storage";
import { getStoragePath } from "@/lib/image-urls";
import type { AccommodationType } from "@prisma/client";

export async function getAccommodations() {
  return prisma.accommodation.findMany({
    orderBy: { sortOrder: "asc" },
    include: { location: { select: { id: true, name: true } } },
  });
}

export async function getAccommodation(id: string) {
  return prisma.accommodation.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      location: { select: { id: true, name: true } },
    },
  });
}

export async function createAccommodation(formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const type = formData.get("type") as AccommodationType;
  const starRating = formData.get("starRating")
    ? parseInt(formData.get("starRating") as string)
    : null;
  const locationId = formData.get("locationId") as string;
  const houseReef = ((formData.get("houseReef") as string) || "").trim() || null;
  const suits = ((formData.get("suits") as string) || "").trim() || null;
  const boardOptions = ((formData.get("boardOptions") as string) || "").trim() || null;
  const absentNote = ((formData.get("absentNote") as string) || "").trim() || null;
  const contactEmail = (formData.get("contactEmail") as string) || null;
  const contactPhone = (formData.get("contactPhone") as string) || null;
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!name || !description || !type || !locationId) {
    return { success: false, error: "Name, description, type, and location are required" };
  }

  // Handle cover image upload
  const coverFile = formData.get("coverImage") as File | null;
  let coverImage: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const uploadResult = await uploadImage(coverFile, { bucket: "accommodations" });
    if (uploadResult.error) return { success: false, error: uploadResult.error };
    coverImage = uploadResult.path;
  }

  try {
    const accommodation = await prisma.accommodation.create({
      data: {
        name, slug, shortDesc, description, type, starRating,
        locationId, houseReef, suits, boardOptions, absentNote,
        contactEmail, contactPhone,
        isActive, sortOrder, coverImage,
      },
    });
    revalidatePath("/admin/accommodations");
    revalidatePath("/");
    return { success: true, data: accommodation };
  } catch {
    return { success: false, error: "Failed to create accommodation" };
  }
}

export async function updateAccommodation(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const type = formData.get("type") as AccommodationType;
  const starRating = formData.get("starRating")
    ? parseInt(formData.get("starRating") as string)
    : null;
  const locationId = formData.get("locationId") as string;
  const houseReef = ((formData.get("houseReef") as string) || "").trim() || null;
  const suits = ((formData.get("suits") as string) || "").trim() || null;
  const boardOptions = ((formData.get("boardOptions") as string) || "").trim() || null;
  const absentNote = ((formData.get("absentNote") as string) || "").trim() || null;
  const contactEmail = (formData.get("contactEmail") as string) || null;
  const contactPhone = (formData.get("contactPhone") as string) || null;
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  try {
    await prisma.accommodation.update({
      where: { id },
      data: {
        name, slug, shortDesc, description, type, starRating,
        locationId, houseReef, suits, boardOptions, absentNote,
        contactEmail, contactPhone,
        isActive, sortOrder,
      },
    });
    revalidatePath("/admin/accommodations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update accommodation" };
  }
}

export async function deleteAccommodation(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.accommodation.delete({ where: { id } });
    revalidatePath("/admin/accommodations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete accommodation" };
  }
}

export async function toggleAccommodationActive(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const acc = await prisma.accommodation.findUnique({ where: { id } });
    if (!acc) return { success: false, error: "Not found" };
    await prisma.accommodation.update({
      where: { id },
      data: { isActive: !acc.isActive },
    });
    revalidatePath("/admin/accommodations");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function uploadAccommodationImage(
  accommodationId: string,
  formData: FormData
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, {
      bucket: "accommodations",
      folder: accommodationId,
    });
    if (result.error) return { success: false, error: result.error };

    await prisma.accommodationImage.create({
      data: { url: result.path, alt: file.name, accommodationId },
    });
    revalidatePath(`/admin/accommodations/${accommodationId}`);
    return { success: true, url: result.url, id: result.path };
  } catch {
    return { success: false, error: "Failed to upload image" };
  }
}

export async function deleteAccommodationImage(imageId: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const image = await prisma.accommodationImage.findUnique({
      where: { id: imageId },
    });
    if (!image) return { success: false, error: "Image not found" };

    await deleteImage("accommodations", image.url);

    await prisma.accommodationImage.delete({ where: { id: imageId } });
    revalidatePath(`/admin/accommodations/${image.accommodationId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete image" };
  }
}

export async function uploadAccommodationCoverImage(accommodationId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, { bucket: "accommodations" });
    if (result.error) return { success: false, error: result.error };

    await prisma.accommodation.update({
      where: { id: accommodationId },
      data: { coverImage: result.path },
    });
    revalidatePath(`/admin/accommodations/${accommodationId}`);
    revalidatePath("/");
    return { success: true, url: result.url };
  } catch {
    return { success: false, error: "Failed to upload cover image" };
  }
}

export async function setAccommodationCoverImage(
  accommodationId: string,
  imageUrl: string
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.accommodation.update({
      where: { id: accommodationId },
      data: { coverImage: getStoragePath(imageUrl, "accommodations") },
    });
    revalidatePath(`/admin/accommodations/${accommodationId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to set cover image" };
  }
}

/**
 * Replaces the old flat `roomTypes` JSON array. The designs need a real row per
 * room: price, size, sleeps and how you get into the water.
 */
export async function updateAccommodationRooms(
  accommodationId: string,
  rooms: Array<{
    name: string;
    blurb?: string | null;
    nightlyFrom?: number | null;
    size?: string | null;
    sleeps?: string | null;
    access?: string | null;
  }>
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction([
      prisma.roomType.deleteMany({ where: { accommodationId } }),
      prisma.roomType.createMany({
        data: rooms
          .filter((r) => r.name.trim())
          .map((r, i) => ({
            accommodationId,
            name: r.name.trim(),
            blurb: r.blurb?.trim() || null,
            nightlyFrom: r.nightlyFrom ?? null,
            size: r.size?.trim() || null,
            sleeps: r.sleeps?.trim() || null,
            access: r.access?.trim() || null,
            sortOrder: i,
          })),
      }),
    ]);
    revalidatePath(`/admin/accommodations/${accommodationId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update rooms" };
  }
}

/**
 * Replaces the old flat `amenities` JSON array. Grouped, because the design shows
 * two labelled columns rather than one undifferentiated list.
 */
export async function updateAccommodationFacilities(
  accommodationId: string,
  facilities: Array<{ group: string; item: string }>
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction([
      prisma.facility.deleteMany({ where: { accommodationId } }),
      prisma.facility.createMany({
        data: facilities
          .filter((f) => f.group.trim() && f.item.trim())
          .map((f, i) => ({
            accommodationId,
            group: f.group.trim(),
            item: f.item.trim(),
            sortOrder: i,
          })),
      }),
    ]);
    revalidatePath(`/admin/accommodations/${accommodationId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update facilities" };
  }
}

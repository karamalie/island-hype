"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/lib/storage";
import { getStoragePath } from "@/lib/image-urls";
import type { ActivityCategory } from "@prisma/client";

export async function getActivities() {
  return prisma.activity.findMany({
    orderBy: { sortOrder: "asc" },
    include: { location: { select: { id: true, name: true } } },
  });
}

export async function getActivity(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      location: { select: { id: true, name: true } },
    },
  });
}

export async function createActivity(formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const category = formData.get("category") as ActivityCategory;
  const duration = formData.get("duration")
    ? parseInt(formData.get("duration") as string)
    : null;
  const locationId = formData.get("locationId") as string;
  const localPrice = formData.get("localPrice")
    ? parseFloat(formData.get("localPrice") as string)
    : null;
  const internationalPrice = formData.get("internationalPrice")
    ? parseFloat(formData.get("internationalPrice") as string)
    : null;
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!name || !description || !category || !locationId) {
    return {
      success: false,
      error: "Name, description, category, and location are required",
    };
  }

  // Handle cover image upload
  const coverFile = formData.get("coverImage") as File | null;
  let coverImage: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const uploadResult = await uploadImage(coverFile, { bucket: "activities" });
    if (uploadResult.error) return { success: false, error: uploadResult.error };
    coverImage = uploadResult.path;
  }

  try {
    const activity = await prisma.activity.create({
      data: {
        name,
        slug,
        shortDesc,
        description,
        category,
        duration,
        locationId,
        localPrice,
        internationalPrice,
        isActive,
        sortOrder,
        coverImage,
      },
    });
    revalidatePath("/admin/activities");
    revalidatePath("/");
    return { success: true, data: activity };
  } catch {
    return { success: false, error: "Failed to create activity" };
  }
}

export async function updateActivity(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const category = formData.get("category") as ActivityCategory;
  const duration = formData.get("duration")
    ? parseInt(formData.get("duration") as string)
    : null;
  const locationId = formData.get("locationId") as string;
  const localPrice = formData.get("localPrice")
    ? parseFloat(formData.get("localPrice") as string)
    : null;
  const internationalPrice = formData.get("internationalPrice")
    ? parseFloat(formData.get("internationalPrice") as string)
    : null;
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  try {
    await prisma.activity.update({
      where: { id },
      data: {
        name,
        slug,
        shortDesc,
        description,
        category,
        duration,
        locationId,
        localPrice,
        internationalPrice,
        isActive,
        sortOrder,
      },
    });
    revalidatePath("/admin/activities");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update activity" };
  }
}

export async function deleteActivity(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.activity.delete({ where: { id } });
    revalidatePath("/admin/activities");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete activity" };
  }
}

export async function toggleActivityActive(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const activity = await prisma.activity.findUnique({ where: { id } });
    if (!activity) return { success: false, error: "Not found" };
    await prisma.activity.update({
      where: { id },
      data: { isActive: !activity.isActive },
    });
    revalidatePath("/admin/activities");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function uploadActivityImage(
  activityId: string,
  formData: FormData
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, {
      bucket: "activities",
      folder: activityId,
    });
    if (result.error) return { success: false, error: result.error };

    await prisma.activityImage.create({
      data: { url: result.path, alt: file.name, activityId },
    });
    revalidatePath(`/admin/activities/${activityId}`);
    return { success: true, url: result.url, id: result.path };
  } catch {
    return { success: false, error: "Failed to upload image" };
  }
}

export async function uploadActivityCoverImage(activityId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, { bucket: "activities" });
    if (result.error) return { success: false, error: result.error };

    await prisma.activity.update({
      where: { id: activityId },
      data: { coverImage: result.path },
    });
    revalidatePath(`/admin/activities/${activityId}`);
    revalidatePath("/");
    return { success: true, url: result.url };
  } catch {
    return { success: false, error: "Failed to upload cover image" };
  }
}

export async function setActivityCoverImage(activityId: string, imageUrl: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.activity.update({
      where: { id: activityId },
      data: { coverImage: getStoragePath(imageUrl, "activities") },
    });
    revalidatePath(`/admin/activities/${activityId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to set cover image" };
  }
}

export async function deleteActivityImage(imageId: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const image = await prisma.activityImage.findUnique({
      where: { id: imageId },
    });
    if (!image) return { success: false, error: "Image not found" };

    await deleteImage("activities", image.url);

    await prisma.activityImage.delete({ where: { id: imageId } });
    revalidatePath(`/admin/activities/${image.activityId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete image" };
  }
}

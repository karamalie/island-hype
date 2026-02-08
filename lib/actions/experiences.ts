"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/lib/storage";

export async function getExperiences() {
  return prisma.experience.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { packages: true, locations: true } } },
  });
}

export async function getExperience(id: string) {
  return prisma.experience.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createExperience(formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const icon = (formData.get("icon") as string) || null;
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!name || !description) {
    return { success: false, error: "Name and description are required" };
  }

  try {
    const experience = await prisma.experience.create({
      data: { name, slug, shortDesc, description, icon, isActive, sortOrder },
    });
    revalidatePath("/admin/experiences");
    revalidatePath("/");
    return { success: true, data: experience };
  } catch {
    return { success: false, error: "Failed to create experience" };
  }
}

export async function updateExperience(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const icon = (formData.get("icon") as string) || null;
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  try {
    await prisma.experience.update({
      where: { id },
      data: { name, slug, shortDesc, description, icon, isActive, sortOrder },
    });
    revalidatePath("/admin/experiences");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update experience" };
  }
}

export async function deleteExperience(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.experience.delete({ where: { id } });
    revalidatePath("/admin/experiences");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete experience" };
  }
}

export async function toggleExperienceActive(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const experience = await prisma.experience.findUnique({ where: { id } });
    if (!experience) return { success: false, error: "Not found" };
    await prisma.experience.update({
      where: { id },
      data: { isActive: !experience.isActive },
    });
    revalidatePath("/admin/experiences");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function uploadExperienceImage(
  experienceId: string,
  formData: FormData
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, {
      bucket: "experiences",
      folder: experienceId,
    });
    if (result.error) return { success: false, error: result.error };

    await prisma.experienceImage.create({
      data: {
        url: result.url,
        alt: file.name,
        experienceId,
      },
    });
    revalidatePath(`/admin/experiences/${experienceId}`);
    return { success: true, url: result.url };
  } catch {
    return { success: false, error: "Failed to upload image" };
  }
}

export async function deleteExperienceImage(imageId: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const image = await prisma.experienceImage.findUnique({
      where: { id: imageId },
    });
    if (!image) return { success: false, error: "Image not found" };

    const urlParts = image.url.split("/experiences/");
    if (urlParts[1]) {
      await deleteImage("experiences", urlParts[1]);
    }

    await prisma.experienceImage.delete({ where: { id: imageId } });
    revalidatePath(`/admin/experiences/${image.experienceId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete image" };
  }
}

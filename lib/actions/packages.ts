"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/utils";
import { uploadImage, deleteImage } from "@/lib/storage";
import { getStoragePath } from "@/lib/image-urls";
import type { Market, InclusionCategory } from "@prisma/client";

export async function getPackages() {
  return prisma.package.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      location: { select: { id: true, name: true } },
      accommodation: { select: { id: true, name: true } },
      pricing: true,
      _count: { select: { inquiries: true } },
    },
  });
}

export async function getPackage(id: string) {
  return prisma.package.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      pricing: true,
      inclusions: { orderBy: { sortOrder: "asc" } },
      itinerary: { orderBy: { dayNumber: "asc" } },
      experiences: { include: { experience: { select: { id: true, name: true } } } },
      activities: { include: { activity: { select: { id: true, name: true } } } },
      location: { select: { id: true, name: true } },
      accommodation: { select: { id: true, name: true } },
    },
  });
}

export async function createPackage(formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const highlightsStr = (formData.get("highlights") as string) || "";
  const highlights = highlightsStr.split("\n").map((s) => s.trim()).filter(Boolean);
  const locationId = formData.get("locationId") as string;
  const accommodationId = formData.get("accommodationId") as string;
  const minNights = parseInt((formData.get("minNights") as string) || "1");
  const maxNights = formData.get("maxNights")
    ? parseInt(formData.get("maxNights") as string)
    : null;
  const maxGuests = formData.get("maxGuests")
    ? parseInt(formData.get("maxGuests") as string)
    : null;
  const isFeatured = formData.get("isFeatured") === "true";
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!name || !description || !locationId || !accommodationId) {
    return { success: false, error: "Name, description, location, and accommodation are required" };
  }

  // Handle cover image upload
  const coverFile = formData.get("coverImage") as File | null;
  let coverImage: string | null = null;
  if (coverFile && coverFile.size > 0) {
    const uploadResult = await uploadImage(coverFile, { bucket: "packages" });
    if (uploadResult.error) return { success: false, error: uploadResult.error };
    coverImage = uploadResult.path;
  }

  try {
    const pkg = await prisma.package.create({
      data: {
        name, slug, shortDesc, description, highlights,
        locationId, accommodationId, minNights, maxNights, maxGuests,
        isFeatured, isActive, sortOrder, coverImage,
      },
    });
    revalidatePath("/admin/packages");
    revalidatePath("/");
    return { success: true, data: pkg };
  } catch {
    return { success: false, error: "Failed to create package" };
  }
}

export async function updatePackage(id: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || generateSlug(name);
  const shortDesc = (formData.get("shortDesc") as string) || null;
  const description = formData.get("description") as string;
  const highlightsStr = (formData.get("highlights") as string) || "";
  const highlights = highlightsStr.split("\n").map((s) => s.trim()).filter(Boolean);
  const locationId = formData.get("locationId") as string;
  const accommodationId = formData.get("accommodationId") as string;
  const minNights = parseInt((formData.get("minNights") as string) || "1");
  const maxNights = formData.get("maxNights")
    ? parseInt(formData.get("maxNights") as string)
    : null;
  const maxGuests = formData.get("maxGuests")
    ? parseInt(formData.get("maxGuests") as string)
    : null;
  const bookingWindowStart = formData.get("bookingWindowStart")
    ? new Date(formData.get("bookingWindowStart") as string)
    : null;
  const bookingWindowEnd = formData.get("bookingWindowEnd")
    ? new Date(formData.get("bookingWindowEnd") as string)
    : null;
  const travelWindowStart = formData.get("travelWindowStart")
    ? new Date(formData.get("travelWindowStart") as string)
    : null;
  const travelWindowEnd = formData.get("travelWindowEnd")
    ? new Date(formData.get("travelWindowEnd") as string)
    : null;
  const terms = (formData.get("terms") as string) || null;
  const cancellationPolicy = (formData.get("cancellationPolicy") as string) || null;
  const bookingInfo = (formData.get("bookingInfo") as string) || null;
  const isFeatured = formData.get("isFeatured") === "true";
  const isActive = formData.get("isActive") === "true";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  try {
    await prisma.package.update({
      where: { id },
      data: {
        name, slug, shortDesc, description, highlights,
        locationId, accommodationId, minNights, maxNights, maxGuests,
        bookingWindowStart, bookingWindowEnd, travelWindowStart, travelWindowEnd,
        terms, cancellationPolicy, bookingInfo,
        isFeatured, isActive, sortOrder,
      },
    });
    revalidatePath("/admin/packages");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update package" };
  }
}

export async function deletePackage(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.package.delete({ where: { id } });
    revalidatePath("/admin/packages");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete package" };
  }
}

export async function togglePackageActive(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) return { success: false, error: "Not found" };
    await prisma.package.update({ where: { id }, data: { isActive: !pkg.isActive } });
    revalidatePath("/admin/packages");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function togglePackageFeatured(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const pkg = await prisma.package.findUnique({ where: { id } });
    if (!pkg) return { success: false, error: "Not found" };
    await prisma.package.update({ where: { id }, data: { isFeatured: !pkg.isFeatured } });
    revalidatePath("/admin/packages");
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle featured" };
  }
}

export async function duplicatePackage(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        pricing: true,
        inclusions: true,
        itinerary: true,
        experiences: true,
        activities: true,
      },
    });
    if (!pkg) return { success: false, error: "Not found" };

    const newPkg = await prisma.package.create({
      data: {
        name: `${pkg.name} (Copy)`,
        slug: `${pkg.slug}-copy-${Date.now()}`,
        shortDesc: pkg.shortDesc,
        description: pkg.description,
        highlights: pkg.highlights,
        locationId: pkg.locationId,
        accommodationId: pkg.accommodationId,
        minNights: pkg.minNights,
        maxNights: pkg.maxNights,
        maxGuests: pkg.maxGuests,
        terms: pkg.terms,
        cancellationPolicy: pkg.cancellationPolicy,
        bookingInfo: pkg.bookingInfo,
        isActive: false,
        isFeatured: false,
        pricing: {
          create: pkg.pricing.map((p) => ({
            market: p.market,
            basePrice: p.basePrice,
            couplePrice: p.couplePrice,
            extraAdultPrice: p.extraAdultPrice,
            childPrice: p.childPrice,
            infantPrice: p.infantPrice,
            singleSupplement: p.singleSupplement,
            childAgeMin: p.childAgeMin,
            childAgeMax: p.childAgeMax,
            validFrom: p.validFrom,
            validUntil: p.validUntil,
            notes: p.notes,
          })),
        },
        inclusions: {
          create: pkg.inclusions.map((i) => ({
            category: i.category,
            item: i.item,
            details: i.details,
            sortOrder: i.sortOrder,
          })),
        },
        itinerary: {
          create: pkg.itinerary.map((it) => ({
            dayNumber: it.dayNumber,
            title: it.title,
            description: it.description,
          })),
        },
        experiences: {
          create: pkg.experiences.map((e) => ({
            experienceId: e.experienceId,
          })),
        },
        activities: {
          create: pkg.activities.map((a) => ({
            activityId: a.activityId,
            isIncluded: a.isIncluded,
          })),
        },
      },
    });

    revalidatePath("/admin/packages");
    return { success: true, data: newPkg };
  } catch {
    return { success: false, error: "Failed to duplicate package" };
  }
}

export async function updatePackagePricing(
  packageId: string,
  market: Market,
  data: {
    basePrice: number;
    couplePrice: number;
    extraAdultPrice?: number | null;
    childPrice?: number | null;
    infantPrice?: number | null;
    singleSupplement?: number | null;
    childAgeMin?: number;
    childAgeMax?: number;
    validFrom?: string | null;
    validUntil?: string | null;
    notes?: string | null;
  }
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.packagePricing.upsert({
      where: { packageId_market: { packageId, market } },
      create: {
        packageId,
        market,
        basePrice: data.basePrice,
        couplePrice: data.couplePrice,
        extraAdultPrice: data.extraAdultPrice ?? null,
        childPrice: data.childPrice ?? null,
        infantPrice: data.infantPrice ?? null,
        singleSupplement: data.singleSupplement ?? null,
        childAgeMin: data.childAgeMin ?? 2,
        childAgeMax: data.childAgeMax ?? 11,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes ?? null,
      },
      update: {
        basePrice: data.basePrice,
        couplePrice: data.couplePrice,
        extraAdultPrice: data.extraAdultPrice ?? null,
        childPrice: data.childPrice ?? null,
        infantPrice: data.infantPrice ?? null,
        singleSupplement: data.singleSupplement ?? null,
        childAgeMin: data.childAgeMin ?? 2,
        childAgeMax: data.childAgeMax ?? 11,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes ?? null,
      },
    });
    revalidatePath(`/admin/packages/${packageId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update pricing" };
  }
}

export async function updatePackageInclusions(
  packageId: string,
  inclusions: Array<{
    category: InclusionCategory;
    item: string;
    details?: string | null;
    sortOrder: number;
  }>
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction([
      prisma.packageInclusion.deleteMany({ where: { packageId } }),
      prisma.packageInclusion.createMany({
        data: inclusions.map((i) => ({
          packageId,
          category: i.category,
          item: i.item,
          details: i.details ?? null,
          sortOrder: i.sortOrder,
        })),
      }),
    ]);
    revalidatePath(`/admin/packages/${packageId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update inclusions" };
  }
}

export async function updatePackageItinerary(
  packageId: string,
  days: Array<{ dayNumber: number; title: string; description: string }>
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction([
      prisma.packageItinerary.deleteMany({ where: { packageId } }),
      prisma.packageItinerary.createMany({
        data: days.map((d) => ({
          packageId,
          dayNumber: d.dayNumber,
          title: d.title,
          description: d.description,
        })),
      }),
    ]);
    revalidatePath(`/admin/packages/${packageId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update itinerary" };
  }
}

export async function updatePackageExperiences(
  packageId: string,
  experienceIds: string[]
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction([
      prisma.packageExperience.deleteMany({ where: { packageId } }),
      prisma.packageExperience.createMany({
        data: experienceIds.map((experienceId) => ({ packageId, experienceId })),
      }),
    ]);
    revalidatePath(`/admin/packages/${packageId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update experiences" };
  }
}

export async function updatePackageActivities(
  packageId: string,
  activities: Array<{ activityId: string; isIncluded: boolean }>
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction([
      prisma.packageActivity.deleteMany({ where: { packageId } }),
      prisma.packageActivity.createMany({
        data: activities.map((a) => ({
          packageId,
          activityId: a.activityId,
          isIncluded: a.isIncluded,
        })),
      }),
    ]);
    revalidatePath(`/admin/packages/${packageId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update activities" };
  }
}

export async function uploadPackageImage(packageId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, { bucket: "packages", folder: packageId });
    if (result.error) return { success: false, error: result.error };

    await prisma.packageImage.create({
      data: { url: result.path, alt: file.name, packageId },
    });
    revalidatePath(`/admin/packages/${packageId}`);
    return { success: true, url: result.url, id: result.path };
  } catch {
    return { success: false, error: "Failed to upload image" };
  }
}

export async function deletePackageImage(imageId: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const image = await prisma.packageImage.findUnique({ where: { id: imageId } });
    if (!image) return { success: false, error: "Image not found" };

    await deleteImage("packages", image.url);

    await prisma.packageImage.delete({ where: { id: imageId } });
    revalidatePath(`/admin/packages/${image.packageId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete image" };
  }
}

export async function uploadPackageCoverImage(packageId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  try {
    const result = await uploadImage(file, { bucket: "packages" });
    if (result.error) return { success: false, error: result.error };

    await prisma.package.update({
      where: { id: packageId },
      data: { coverImage: result.path },
    });
    revalidatePath(`/admin/packages/${packageId}`);
    revalidatePath("/");
    return { success: true, url: result.url };
  } catch {
    return { success: false, error: "Failed to upload cover image" };
  }
}

export async function setPackageCoverImage(packageId: string, imageUrl: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.package.update({
      where: { id: packageId },
      data: { coverImage: getStoragePath(imageUrl, "packages") },
    });
    revalidatePath(`/admin/packages/${packageId}`);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to set cover image" };
  }
}

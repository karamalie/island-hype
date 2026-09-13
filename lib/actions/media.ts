"use server";

// lib/actions/media.ts
//
// Records an image that has ALREADY been stored, against the thing it belongs to.
//
// The upload itself no longer happens in a server action. It goes to
// app/api/admin/media, which is the only way to report upload progress and the
// only way to avoid buffering a large file in memory. By the time these run, the
// bytes are on disk and all that is left is the row.
//
// One generic pair rather than eight near-identical functions. The four image
// tables have the same shape — url, alt, sortOrder, and the owner's id — so the
// only thing that varies is which table, and a switch says that more clearly
// than four copies of the same twelve lines.

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type MediaKind = "location" | "accommodation" | "activity" | "package";

/** Where each kind lives, so the switches below stay honest about all four. */
const PLURAL: Record<MediaKind, string> = {
  location: "locations",
  accommodation: "accommodations",
  activity: "activities",
  package: "packages",
};

function refresh(kind: MediaKind, id: string) {
  revalidatePath(`/admin/${PLURAL[kind]}/${id}`);
  revalidatePath(`/${PLURAL[kind]}`);
  revalidatePath("/");
}

/**
 * Add a gallery row. `storagePath` is what the upload route returned — a path
 * relative to the bucket, never a full URL and never the original filename.
 *
 * `alt` defaults to null rather than to the filename. The old upload path stored
 * file.name, which is how "IMG_4821.JPG" ended up being read aloud to anyone
 * using a screen reader; an empty alt at least lets the gallery fall back to the
 * place's own name.
 */
export async function attachImage(
  kind: MediaKind,
  entityId: string,
  storagePath: string,
  alt?: string
) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const data = { url: storagePath, alt: alt?.trim() || null, sortOrder: 0 };
    let id: string;

    switch (kind) {
      case "location":
        id = (await prisma.locationImage.create({ data: { ...data, locationId: entityId } })).id;
        break;
      case "accommodation":
        id = (await prisma.accommodationImage.create({ data: { ...data, accommodationId: entityId } })).id;
        break;
      case "activity":
        id = (await prisma.activityImage.create({ data: { ...data, activityId: entityId } })).id;
        break;
      case "package":
        id = (await prisma.packageImage.create({ data: { ...data, packageId: entityId } })).id;
        break;
    }

    refresh(kind, entityId);
    return { success: true, id };
  } catch {
    return { success: false, error: "The photo was uploaded but could not be attached. Try again." };
  }
}

/** Point the record's cover at an image already in the media tree. */
export async function setCoverPath(kind: MediaKind, entityId: string, storagePath: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const data = { coverImage: storagePath };
    switch (kind) {
      case "location":
        await prisma.location.update({ where: { id: entityId }, data });
        break;
      case "accommodation":
        await prisma.accommodation.update({ where: { id: entityId }, data });
        break;
      case "activity":
        await prisma.activity.update({ where: { id: entityId }, data });
        break;
      case "package":
        await prisma.package.update({ where: { id: entityId }, data });
        break;
    }
    refresh(kind, entityId);
    return { success: true };
  } catch {
    return { success: false, error: "The photo was uploaded but could not be set as the cover. Try again." };
  }
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAccommodation } from "@/lib/actions/accommodations";
import { getImageUrl } from "@/lib/image-urls";
import { AccommodationForm } from "./accommodation-form";

export default async function EditAccommodationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accommodation = await getAccommodation(id);
  if (!accommodation) notFound();

  const [locations, roomRows, facilityRows] = await Promise.all([
    prisma.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.roomType.findMany({ where: { accommodationId: id }, orderBy: { sortOrder: "asc" } }),
    prisma.facility.findMany({ where: { accommodationId: id }, orderBy: { sortOrder: "asc" } }),
  ]);

  // The form edits strings; nulls become empty inputs and blanks become nulls again.
  const rooms = roomRows.map((r) => ({
    name: r.name,
    blurb: r.blurb ?? "",
    nightlyFrom: r.nightlyFrom !== null ? String(r.nightlyFrom) : "",
    size: r.size ?? "",
    sleeps: r.sleeps ?? "",
    access: r.access ?? "",
  }));
  const facilities = facilityRows.map((f) => ({ group: f.group, item: f.item }));

  // Resolve coverImage to full URL (seeded data stores bare filenames)
  const resolvedAccommodation = {
    ...accommodation,
    coverImage: accommodation.coverImage
      ? getImageUrl("accommodations", accommodation.coverImage)
      : null,
  };

  // Resolve gallery image paths to full URLs
  const resolvedImages = accommodation.images.map((img) => ({
    ...img,
    url: getImageUrl("accommodations", img.url),
  }));

  return (
    <AccommodationForm
      accommodation={resolvedAccommodation}
      images={resolvedImages}
      locations={locations}
      rooms={rooms}
      facilities={facilities}
    />
  );
}

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

  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Resolve coverImage to full URL (seeded data stores bare filenames)
  const resolvedAccommodation = {
    ...accommodation,
    // JSON columns -> string[] for the form
    roomTypes: Array.isArray(accommodation.roomTypes)
      ? (accommodation.roomTypes as string[])
      : [],
    amenities: Array.isArray(accommodation.amenities)
      ? (accommodation.amenities as string[])
      : [],
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
    />
  );
}

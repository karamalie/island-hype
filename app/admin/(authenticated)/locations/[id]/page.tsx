import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocation } from "@/lib/actions/locations";
import { getImageUrl } from "@/lib/image-urls";
import { LocationForm } from "./location-form";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getLocation(id);
  if (!location) notFound();

  // Resolve coverImage to full URL (seeded data stores bare filenames)
  const resolvedLocation = {
    ...location,
    coverImage: location.coverImage
      ? getImageUrl("locations", location.coverImage)
      : null,
  };

  // Resolve gallery image paths to full URLs
  const resolvedImages = location.images.map((img) => ({
    ...img,
    url: getImageUrl("locations", img.url),
  }));

  return (
    <LocationForm
      location={resolvedLocation}
      images={resolvedImages}
    />
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAccommodation } from "@/lib/actions/accommodations";
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

  return (
    <AccommodationForm
      accommodation={accommodation}
      images={accommodation.images}
      locations={locations}
    />
  );
}

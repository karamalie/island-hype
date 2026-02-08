import { prisma } from "@/lib/prisma";
import { AccommodationForm } from "../[id]/accommodation-form";

export default async function NewAccommodationPage() {
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <AccommodationForm locations={locations} />;
}

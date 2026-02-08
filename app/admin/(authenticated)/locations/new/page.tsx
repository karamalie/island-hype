import { prisma } from "@/lib/prisma";
import { LocationForm } from "../[id]/location-form";

export default async function NewLocationPage() {
  const allExperiences = await prisma.experience.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <LocationForm allExperiences={allExperiences} />;
}

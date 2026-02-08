import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocation } from "@/lib/actions/locations";
import { LocationForm } from "./location-form";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getLocation(id);
  if (!location) notFound();

  const allExperiences = await prisma.experience.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const linkedExperienceIds = location.experiences.map((e) => e.experience.id);

  return (
    <LocationForm
      location={location}
      images={location.images}
      allExperiences={allExperiences}
      linkedExperienceIds={linkedExperienceIds}
    />
  );
}

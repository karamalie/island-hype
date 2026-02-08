import { notFound } from "next/navigation";
import { getExperience } from "@/lib/actions/experiences";
import { ExperienceForm } from "./experience-form";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = await getExperience(id);
  if (!experience) notFound();

  return (
    <ExperienceForm
      experience={experience}
      images={experience.images}
    />
  );
}

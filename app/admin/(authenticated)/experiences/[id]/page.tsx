import { notFound } from "next/navigation";
import { getExperience } from "@/lib/actions/experiences";
import { getImageUrl } from "@/lib/image-urls";
import { ExperienceForm } from "./experience-form";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = await getExperience(id);
  if (!experience) notFound();

  // Resolve coverImage to full URL (seeded data stores bare filenames)
  const resolvedExperience = {
    ...experience,
    coverImage: experience.coverImage
      ? getImageUrl("experiences", experience.coverImage)
      : null,
  };

  // Resolve gallery image paths to full URLs
  const resolvedImages = experience.images.map((img) => ({
    ...img,
    url: getImageUrl("experiences", img.url),
  }));

  return (
    <ExperienceForm
      experience={resolvedExperience}
      images={resolvedImages}
    />
  );
}

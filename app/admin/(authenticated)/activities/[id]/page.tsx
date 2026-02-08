import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActivity } from "@/lib/actions/activities";
import { getImageUrl } from "@/lib/image-urls";
import { ActivityForm } from "./activity-form";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) notFound();

  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Resolve coverImage to full URL (seeded data stores bare filenames)
  const resolvedActivity = {
    ...activity,
    coverImage: activity.coverImage
      ? getImageUrl("activities", activity.coverImage)
      : null,
  };

  // Resolve gallery image paths to full URLs
  const resolvedImages = activity.images.map((img) => ({
    ...img,
    url: getImageUrl("activities", img.url),
  }));

  return (
    <ActivityForm
      activity={resolvedActivity}
      images={resolvedImages}
      locations={locations}
    />
  );
}

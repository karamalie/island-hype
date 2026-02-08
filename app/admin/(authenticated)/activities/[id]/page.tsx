import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getActivity } from "@/lib/actions/activities";
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

  return (
    <ActivityForm
      activity={activity}
      images={activity.images}
      locations={locations}
    />
  );
}

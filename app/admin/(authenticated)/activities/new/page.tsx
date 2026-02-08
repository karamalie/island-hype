import { prisma } from "@/lib/prisma";
import { ActivityForm } from "../[id]/activity-form";

export default async function NewActivityPage() {
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <ActivityForm locations={locations} />;
}

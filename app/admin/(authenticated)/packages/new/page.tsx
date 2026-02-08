import { prisma } from "@/lib/prisma";
import { PackageForm } from "../[id]/package-form";

export default async function NewPackagePage() {
  const [locations, accommodations] = await Promise.all([
    prisma.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.accommodation.findMany({
      select: { id: true, name: true, locationId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return <PackageForm locations={locations} accommodations={accommodations} />;
}

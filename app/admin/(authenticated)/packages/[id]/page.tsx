import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPackage } from "@/lib/actions/packages";
import { getImageUrl } from "@/lib/image-urls";
import { PackageForm } from "./package-form";

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getPackage(id);
  if (!pkg) notFound();

  const [locations, accommodations, allExperiences, allActivities] = await Promise.all([
    prisma.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.accommodation.findMany({
      select: { id: true, name: true, locationId: true },
      orderBy: { name: "asc" },
    }),
    prisma.experience.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.activity.findMany({
      select: { id: true, name: true, locationId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Resolve paths to full URLs (DB stores relative paths only)
  const resolvedPkg = {
    ...pkg,
    coverImage: pkg.coverImage
      ? getImageUrl("packages", pkg.coverImage)
      : null,
    images: pkg.images.map((img) => ({
      ...img,
      url: getImageUrl("packages", img.url),
    })),
  };

  return (
    <PackageForm
      pkg={resolvedPkg}
      locations={locations}
      accommodations={accommodations}
      allExperiences={allExperiences}
      allActivities={allActivities}
    />
  );
}

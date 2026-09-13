import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPackage } from "@/lib/actions/packages";
import { getActiveTransferOptions } from "@/lib/actions/transfers";
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

  const [
    locations,
    accommodations,
    allActivities,
    allTags,
    tagRows,
    faqRows,
    blackoutRows,
    livePackageCount,
    transferOptions,
  ] = await Promise.all([
    prisma.location.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.accommodation.findMany({
      select: { id: true, name: true, locationId: true },
      orderBy: { name: "asc" },
    }),
    prisma.activity.findMany({
      select: { id: true, name: true, locationId: true },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
    prisma.packageTag.findMany({ where: { packageId: id }, select: { tagId: true } }),
    prisma.faqItem.findMany({ where: { packageId: id }, orderBy: { sortOrder: "asc" } }),
    prisma.blackoutRange.findMany({ where: { packageId: id }, orderBy: { startDate: "asc" } }),
    prisma.package.count({ where: { isActive: true } }),
    getActiveTransferOptions(),
  ]);

  /** yyyy-mm-dd for a date input; empty string for null. */
  const dateInput = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

  // Resolve paths to full URLs (DB stores relative paths only)
  const resolvedPkg = {
    ...pkg,
    // JSON column -> string[] for the form
    highlights: Array.isArray(pkg.highlights)
      ? (pkg.highlights as string[])
      : [],
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
      allActivities={allActivities}
      display={{
        mealPlan: pkg.mealPlan ?? "",
        boardBasis: pkg.boardBasis ?? "",
        badge: pkg.badge ?? "",
        bestMonths: pkg.bestMonths ?? "",
        longBlurb: pkg.longBlurb ?? "",
      }}
      blackouts={blackoutRows.map((b) => ({
        startDate: dateInput(b.startDate),
        endDate: dateInput(b.endDate),
        reason: b.reason ?? "",
      }))}
      allTags={allTags}
      transferOptions={transferOptions}
      tagIds={tagRows.map((t) => t.tagId)}
      faqs={faqRows.map((f) => ({ question: f.question, answer: f.answer }))}
      livePackageCount={livePackageCount}
    />
  );
}

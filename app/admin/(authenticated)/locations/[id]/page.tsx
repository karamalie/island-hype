import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocation } from "@/lib/actions/locations";
import { getImageUrl } from "@/lib/image-urls";
import { LocationForm } from "./location-form";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getLocation(id);
  if (!location) notFound();

  const [seasonRows, stayTypeRows, linkedStayTypes, faqRows] = await Promise.all([
    prisma.seasonMonth.findMany({ where: { locationId: id }, orderBy: { month: "asc" } }),
    prisma.stayType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.locationStayType.findMany({
      where: { locationId: id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.faqItem.findMany({ where: { locationId: id }, orderBy: { sortOrder: "asc" } }),
  ]);

  const season: Record<number, (typeof seasonRows)[number]["state"]> = {};
  for (const r of seasonRows) season[r.month] = r.state;

  // Resolve coverImage to full URL (seeded data stores bare filenames)
  const resolvedLocation = {
    ...location,
    coverImage: location.coverImage
      ? getImageUrl("locations", location.coverImage)
      : null,
  };

  // Resolve gallery image paths to full URLs
  const resolvedImages = location.images.map((img) => ({
    ...img,
    url: getImageUrl("locations", img.url),
  }));

  return (
    <LocationForm
      location={resolvedLocation}
      images={resolvedImages}
      character={{
        region: location.region ?? "",
        knownFor: location.knownFor ?? "",
        bestMonths: location.bestMonths ?? "",
      }}
      season={season}
      seasonLabel={location.seasonHighlightLabel ?? ""}
      allStayTypes={stayTypeRows.map((s) => ({
        id: s.id,
        name: s.name,
        band: s.band,
        blurb: s.blurb,
        nightlyFrom: s.nightlyFrom,
      }))}
      stayTypes={linkedStayTypes.map((l) => ({
        stayTypeId: l.stayTypeId,
        blurb: l.blurb ?? "",
        nightlyFrom: l.nightlyFrom !== null ? String(l.nightlyFrom) : "",
      }))}
      faqs={faqRows.map((f) => ({ question: f.question, answer: f.answer }))}
    />
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOffer } from "@/lib/actions/offers";
import { OfferForm } from "./offer-form";

export default async function EditOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await getOffer(id);
  if (!offer) notFound();

  const packages = await prisma.package.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <OfferForm offer={offer} packages={packages} />;
}

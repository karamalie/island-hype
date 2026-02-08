import { prisma } from "@/lib/prisma";
import { OfferForm } from "../[id]/offer-form";

export default async function NewOfferPage() {
  const packages = await prisma.package.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <OfferForm packages={packages} />;
}

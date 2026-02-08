import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InquiryDetail } from "./inquiry-detail";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { package: { select: { id: true, name: true, slug: true } } },
  });

  if (!inquiry) notFound();

  return <InquiryDetail inquiry={JSON.parse(JSON.stringify(inquiry))} />;
}

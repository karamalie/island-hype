import type { Metadata } from "next";
import { getLegalPage } from "@/lib/data/legal";
import { LegalPageBody } from "../legal-page-body";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Privacy" };

export default async function PrivacyPage() {
  const page = await getLegalPage("privacy");
  return <LegalPageBody title={page.title} body={page.body} />;
}

import type { Metadata } from "next";
import { getLegalPage } from "@/lib/data/legal";
import { LegalPageBody } from "../legal-page-body";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Terms and conditions" };

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  return <LegalPageBody title={page.title} body={page.body} />;
}

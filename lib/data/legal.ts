// lib/data/legal.ts
//
// Terms and privacy copy, stored in SiteSetting so staff can paste in whatever
// their lawyer gives them without a deploy.
//
// The fallback is honest about being a placeholder rather than inventing legal
// text — a made-up privacy policy is worse than an obviously unfinished one,
// because it reads as binding.

import { prisma } from "@/lib/prisma";

export interface LegalPage {
  title: string;
  body: string | null;
}

export async function getLegalPage(key: "terms" | "privacy"): Promise<LegalPage> {
  const title = key === "terms" ? "Terms and conditions" : "Privacy";
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: `legal_${key}` } });
    return { title, body: row?.value?.trim() || null };
  } catch {
    return { title, body: null };
  }
}

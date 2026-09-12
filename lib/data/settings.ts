// lib/data/settings.ts
//
// Editorial facts that belong to the business rather than to a package: the
// WhatsApp number, the phone, the opening hours. They live in SiteSetting so
// staff can change them without a deploy.
//
// The defaults below are the prototype's placeholders and MUST be replaced with
// real values before launch — a wrong phone number on a contact page is worse
// than no phone number.

import { prisma } from "@/lib/prisma";

export interface ContactDetails {
  whatsapp: string;
  phone: string;
  hours: { day: string; value: string; closed?: boolean }[];
  timezoneNote: string;
  place: string;
}

const DEFAULTS: ContactDetails = {
  whatsapp: "+9603300000",
  phone: "+960 330 0000",
  hours: [
    { day: "Sun – Thu", value: "09:00 – 18:00" },
    { day: "Saturday", value: "10:00 – 14:00" },
    { day: "Friday", value: "Closed", closed: true },
  ],
  timezoneNote:
    "Maldives time, GMT+5. Enquiries sent overnight are answered first thing.",
  place: "Male', Maldives",
};

export async function getContactDetails(): Promise<ContactDetails> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ["contact_whatsapp", "contact_phone", "contact_place"] } },
    });
    const get = (key: string) => rows.find((r) => r.key === key)?.value?.trim() || null;

    return {
      ...DEFAULTS,
      whatsapp: get("contact_whatsapp") ?? DEFAULTS.whatsapp,
      phone: get("contact_phone") ?? DEFAULTS.phone,
      place: get("contact_place") ?? DEFAULTS.place,
    };
  } catch {
    return DEFAULTS;
  }
}

export function whatsappHref(number: string, message?: string): string {
  const digits = number.replace(/[^\d]/g, "");
  const q = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${q}`;
}

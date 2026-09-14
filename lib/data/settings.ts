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
  email: string;
  /** Also the WhatsApp number — it is the same line. */
  phone: string;
  instagram: string;
  hours: { day: string; value: string; closed?: boolean }[];
  timezoneNote: string;
  place: string;
}

// The three real channels, confirmed by the client 2026-09-12. Note the phone is
// a +971 UAE number while the business is described as Male'-based — the opening
// hours below still say Maldives time (GMT+5), and UAE is GMT+4. Worth confirming
// which applies before launch.
const DEFAULTS: ContactDetails = {
  // Where the contact form addresses its mail, and the reply-from shown to a
  // guest. Overridable in admin via the contact_email setting.
  email: "sales@islandhype.com",
  phone: "+971 50 350 7644",
  instagram: "islandhypemaldives",
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
      where: {
        key: {
          in: [
            "contact_email",
            "contact_phone",
            "contact_instagram",
            "contact_place",
          ],
        },
      },
    });
    const get = (key: string) => rows.find((r) => r.key === key)?.value?.trim() || null;

    return {
      ...DEFAULTS,
      email: get("contact_email") ?? DEFAULTS.email,
      phone: get("contact_phone") ?? DEFAULTS.phone,
      instagram: get("contact_instagram") ?? DEFAULTS.instagram,
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

export function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export function instagramHref(handle: string): string {
  return `https://instagram.com/${handle.replace(/^@/, "")}`;
}

/** "@islandhypemaldives" — displayed with the @, stored without. */
export function instagramHandle(handle: string): string {
  return handle.startsWith("@") ? handle : `@${handle}`;
}

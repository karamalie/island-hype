"use server";

// lib/actions/enquiry.ts
//
// The one place a guest's dates reach us.
//
// The date rule is `checkDates` from lib/design/availability, and it runs twice:
// in the rail as the guest types, for feedback, and again here, because a client
// can always be persuaded to lie. Same function both times, so the two can never
// drift apart.

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { checkDates } from "@/lib/design/availability";
import type { Market } from "@prisma/client";

export interface EnquiryResult {
  success: boolean;
  error?: string;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export async function submitDateEnquiry(formData: FormData): Promise<EnquiryResult> {
  const packageId = (formData.get("packageId") as string) || null;
  const name = ((formData.get("name") as string) || "").trim();
  const email = ((formData.get("email") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim();
  const arrivalRaw = (formData.get("arrival") as string) || "";
  const nights = Number(formData.get("nights") || 0);
  const adults = Number(formData.get("adults") || 2);
  const children = Number(formData.get("children") || 0);

  if (!email) return { success: false, error: "We need an email address to reply to." };
  if (!name) return { success: false, error: "Tell us who you are and we'll get back to you." };

  const pkg = packageId
    ? await prisma.package.findUnique({
        where: { id: packageId },
        include: { blackouts: true },
      })
    : null;

  let checkIn: Date | null = null;
  let checkOut: Date | null = null;

  if (arrivalRaw && nights > 0) {
    const arrival = new Date(arrivalRaw);
    if (Number.isNaN(arrival.getTime())) {
      return { success: false, error: "That arrival date didn't parse. Try dd/mm/yyyy." };
    }

    if (pkg) {
      const verdict = checkDates({
        arrival,
        nights,
        travel: { start: pkg.travelWindowStart, end: pkg.travelWindowEnd },
        booking: { start: pkg.bookingWindowStart, end: pkg.bookingWindowEnd },
        blackouts: pkg.blackouts.map((b) => ({
          startDate: b.startDate,
          endDate: b.endDate,
          reason: b.reason,
        })),
      });
      if (!verdict.ok) return { success: false, error: verdict.message };
    }

    checkIn = arrival;
    checkOut = addDays(arrival, nights);
  }

  const cookieStore = await cookies();
  const market = ((cookieStore.get("market")?.value as Market) || "INTERNATIONAL") as Market;

  try {
    await prisma.inquiry.create({
      data: {
        name,
        email,
        packageId: pkg?.id ?? null,
        packageName: pkg?.name ?? null,
        checkIn,
        checkOut,
        adults,
        children,
        message: message || "Sent from the booking rail — no message.",
        market,
      },
    });

    // No notification email. The site used to send one through Resend and the
    // key was never set, so lib/email/send.ts threw at import and took the
    // enquiry down with it — the row below never got written. Enquiries are read
    // in admin under Inquiries; the guest has already sent the same details
    // themselves by WhatsApp or email, which is what actually reaches a person.

    return { success: true };
  } catch {
    return { success: false, error: "Something went wrong on our end. Try WhatsApp instead?" };
  }
}


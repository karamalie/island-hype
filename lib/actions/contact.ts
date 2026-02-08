"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { contactFormSchema } from "@/lib/schemas/inquiry";
import { sendEmail, buildInquiryNotificationEmail } from "@/lib/email/send";
import type { Market } from "@prisma/client";

export async function submitContactForm(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    message: formData.get("message") as string,
  };

  const parsed = contactFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message || "Invalid form data",
    };
  }

  const cookieStore = await cookies();
  const market = (cookieStore.get("market")?.value as Market) || "INTERNATIONAL";

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        market,
        status: "NEW",
      },
    });

    // Send email notification
    const notificationEmails = await getNotificationEmails();
    if (notificationEmails.length > 0) {
      const html = buildInquiryNotificationEmail({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message,
        market,
        adults: 2,
        children: 0,
        infants: 0,
      });
      await sendEmail({
        to: notificationEmails,
        subject: `New Contact Inquiry from ${parsed.data.name}`,
        html,
      });
    }

    return { success: true, data: { id: inquiry.id } };
  } catch {
    return { success: false, error: "Failed to submit. Please try again." };
  }
}

export async function submitBookingForm(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || undefined,
    nationality: (formData.get("nationality") as string) || undefined,
    packageId: formData.get("packageId") as string,
    packageName: formData.get("packageName") as string,
    checkIn: (formData.get("checkIn") as string) || undefined,
    checkOut: (formData.get("checkOut") as string) || undefined,
    adults: parseInt((formData.get("adults") as string) || "2"),
    children: parseInt((formData.get("children") as string) || "0"),
    infants: parseInt((formData.get("infants") as string) || "0"),
    message: formData.get("message") as string,
    specialRequests: (formData.get("specialRequests") as string) || undefined,
    arrivalFlight: (formData.get("arrivalFlight") as string) || undefined,
    departureFlight: (formData.get("departureFlight") as string) || undefined,
  };

  if (!raw.name || !raw.email || !raw.message) {
    return { success: false, error: "Name, email, and message are required." };
  }

  const cookieStore = await cookies();
  const market = (cookieStore.get("market")?.value as Market) || "INTERNATIONAL";

  try {
    const inquiry = await prisma.inquiry.create({
      data: {
        name: raw.name,
        email: raw.email,
        phone: raw.phone || null,
        nationality: raw.nationality || null,
        packageId: raw.packageId || null,
        packageName: raw.packageName || null,
        checkIn: raw.checkIn ? new Date(raw.checkIn) : null,
        checkOut: raw.checkOut ? new Date(raw.checkOut) : null,
        adults: raw.adults,
        children: raw.children,
        infants: raw.infants,
        message: raw.message,
        specialRequests: raw.specialRequests || null,
        arrivalFlight: raw.arrivalFlight || null,
        departureFlight: raw.departureFlight || null,
        market,
        status: "NEW",
      },
    });

    // Send email notification
    const notificationEmails = await getNotificationEmails();
    if (notificationEmails.length > 0) {
      const html = buildInquiryNotificationEmail({
        ...raw,
        phone: raw.phone || null,
        packageName: raw.packageName || null,
        checkIn: raw.checkIn ? new Date(raw.checkIn) : null,
        checkOut: raw.checkOut ? new Date(raw.checkOut) : null,
        specialRequests: raw.specialRequests || null,
        market,
      });
      await sendEmail({
        to: notificationEmails,
        subject: `New Booking Inquiry: ${raw.packageName || "General"} - ${raw.name}`,
        html,
      });
    }

    return { success: true, data: { id: inquiry.id } };
  } catch {
    return { success: false, error: "Failed to submit. Please try again." };
  }
}

async function getNotificationEmails(): Promise<string[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "notification_emails" },
    });
    if (!setting?.value) return [];
    return setting.value
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

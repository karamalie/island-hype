import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return { success: true, data: null };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || "Island Hype <notifications@islandhype.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: "Failed to send email" };
  }
}

export function buildInquiryNotificationEmail(inquiry: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  packageName?: string | null;
  checkIn?: Date | null;
  checkOut?: Date | null;
  adults: number;
  children: number;
  infants: number;
  market: string;
  specialRequests?: string | null;
}) {
  const guestInfo = [
    `${inquiry.adults} adult${inquiry.adults !== 1 ? "s" : ""}`,
    inquiry.children > 0
      ? `${inquiry.children} child${inquiry.children !== 1 ? "ren" : ""}`
      : null,
    inquiry.infants > 0
      ? `${inquiry.infants} infant${inquiry.infants !== 1 ? "s" : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(", ");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0f172a; color: white; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">New Inquiry Received</h1>
        <p style="margin: 4px 0 0; opacity: 0.7; font-size: 14px;">Island Hype Booking System</p>
      </div>
      <div style="background: white; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
        <h2 style="margin: 0 0 16px; font-size: 16px; color: #334155;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 120px;">Name</td><td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${inquiry.name}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;">Email</td><td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${inquiry.email}" style="color: #2563eb;">${inquiry.email}</a></td></tr>
          ${inquiry.phone ? `<tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;">Phone</td><td style="padding: 6px 0; font-size: 14px; color: #0f172a;">${inquiry.phone}</td></tr>` : ""}
          <tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;">Market</td><td style="padding: 6px 0; font-size: 14px; color: #0f172a;">${inquiry.market}</td></tr>
        </table>

        ${
          inquiry.packageName
            ? `
        <h2 style="margin: 0 0 16px; font-size: 16px; color: #334155;">Booking Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 120px;">Package</td><td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 500;">${inquiry.packageName}</td></tr>
          ${inquiry.checkIn ? `<tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;">Check-in</td><td style="padding: 6px 0; font-size: 14px; color: #0f172a;">${new Date(inquiry.checkIn).toLocaleDateString()}</td></tr>` : ""}
          ${inquiry.checkOut ? `<tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;">Check-out</td><td style="padding: 6px 0; font-size: 14px; color: #0f172a;">${new Date(inquiry.checkOut).toLocaleDateString()}</td></tr>` : ""}
          <tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;">Guests</td><td style="padding: 6px 0; font-size: 14px; color: #0f172a;">${guestInfo}</td></tr>
        </table>
        `
            : ""
        }

        <h2 style="margin: 0 0 12px; font-size: 16px; color: #334155;">Message</h2>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">${inquiry.message}</p>
        </div>

        ${
          inquiry.specialRequests
            ? `
        <h2 style="margin: 0 0 12px; font-size: 16px; color: #334155;">Special Requests</h2>
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">${inquiry.specialRequests}</p>
        </div>
        `
            : ""
        }

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://islandhype.com"}/admin/inquiries" style="display: inline-block; background: #0f172a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">View in Admin Panel</a>
        </div>
      </div>
    </div>
  `;
}

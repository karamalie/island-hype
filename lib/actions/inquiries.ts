"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import type { InquiryStatus, Market } from "@prisma/client";

export interface InquiryFilters {
  status?: InquiryStatus;
  market?: Market;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

function buildWhereClause(filters?: InquiryFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.market) where.market = filters.market;

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters?.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters?.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { email: { contains: filters.search } },
    ];
  }

  return where;
}

export async function getInquiries(filters?: InquiryFilters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;
  const where = buildWhereClause(filters);

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      include: { package: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return {
    data: inquiries,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getInquiry(id: string) {
  return prisma.inquiry.findUnique({
    where: { id },
    include: { package: { select: { id: true, name: true, slug: true } } },
  });
}

export async function updateInquiryStatus(id: string, status: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const current = await prisma.inquiry.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!current) return { success: false, error: "Inquiry not found" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status: status as InquiryStatus };
    if (current.status === "NEW" && status !== "NEW") {
      updateData.respondedAt = new Date();
      updateData.respondedBy = session.name || session.username;
    }

    await prisma.inquiry.update({ where: { id }, data: updateData });
    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update status" };
  }
}

export async function addInquiryNote(id: string, note: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      select: { notes: true },
    });
    if (!inquiry) return { success: false, error: "Inquiry not found" };

    const timestamp = new Date().toLocaleString();
    const author = session.name || session.username;
    const formattedNote = `[${timestamp} - ${author}] ${note}`;
    const updatedNotes = inquiry.notes
      ? `${inquiry.notes}\n\n---\n\n${formattedNote}`
      : formattedNote;

    await prisma.inquiry.update({
      where: { id },
      data: { notes: updatedNotes },
    });
    revalidatePath(`/admin/inquiries/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to add note" };
  }
}

export async function updateInquiryNotes(id: string, notes: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.inquiry.update({ where: { id }, data: { notes } });
    revalidatePath(`/admin/inquiries/${id}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update notes" };
  }
}

export async function deleteInquiry(id: string) {
  const session = await getSession();
  if (!session?.isLoggedIn) return { success: false, error: "Unauthorized" };

  try {
    await prisma.inquiry.delete({ where: { id } });
    revalidatePath("/admin/inquiries");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete inquiry" };
  }
}

export async function exportInquiriesToCSV(filters?: InquiryFilters) {
  const where = buildWhereClause(filters);

  const inquiries = await prisma.inquiry.findMany({
    where,
    include: { package: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Name", "Email", "Phone", "Nationality", "Package",
    "Check-in", "Check-out", "Adults", "Children", "Infants",
    "Market", "Status", "Message", "Special Requests", "Created At",
  ];

  function esc(v: string | null | undefined): string {
    if (v == null) return "";
    const s = String(v);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const rows = inquiries.map((i) => [
    esc(i.name), esc(i.email), esc(i.phone), esc(i.nationality),
    esc(i.package?.name || i.packageName || "General"),
    esc(i.checkIn ? new Date(i.checkIn).toLocaleDateString() : null),
    esc(i.checkOut ? new Date(i.checkOut).toLocaleDateString() : null),
    String(i.adults), String(i.children), String(i.infants),
    esc(i.market), esc(i.status), esc(i.message), esc(i.specialRequests),
    esc(new Date(i.createdAt).toLocaleString()),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

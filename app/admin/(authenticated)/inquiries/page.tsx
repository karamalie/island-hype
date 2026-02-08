import { getInquiries } from "@/lib/actions/inquiries";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import { InquiryFilters } from "./inquiry-filters";
import Link from "next/link";
import type { InquiryStatus, Market } from "@prisma/client";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const filters = {
    status: params.status as InquiryStatus | undefined,
    market: params.market as Market | undefined,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
    limit: 20,
  };

  const { data: inquiries, pagination } = await getInquiries(filters);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inquiries</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage booking inquiries and contact requests
          </p>
        </div>
      </div>

      <InquiryFilters />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Package</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Market</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{inq.name}</td>
                <td className="px-4 py-3 text-slate-600">{inq.email}</td>
                <td className="px-4 py-3 text-slate-600">
                  {inq.package?.name || inq.packageName || "General"}
                </td>
                <td className="px-4 py-3 text-slate-600">{inq.market}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inq.status} />
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/inquiries/${inq.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No inquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Link
                href={`/admin/inquiries?page=${pagination.page - 1}${params.status ? `&status=${params.status}` : ""}${params.market ? `&market=${params.market}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                Previous
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`/admin/inquiries?page=${pagination.page + 1}${params.status ? `&status=${params.status}` : ""}${params.market ? `&market=${params.market}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

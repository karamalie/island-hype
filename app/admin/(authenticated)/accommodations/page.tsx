import { getAccommodations } from "@/lib/actions/accommodations";
import { PageHeader } from "@/components/admin/ui/page-header";
import { TableEmptyRow } from "@/components/admin/ui/table-empty";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import Link from "next/link";

export default async function AccommodationsPage() {
  const accommodations = await getAccommodations();

  return (
    <div>
      <PageHeader
        title="Accommodations"
        description="Manage resorts, guesthouses, and hotels"
        action={{ label: "New Accommodation", href: "/admin/accommodations/new" }}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Stars</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accommodations.map((acc) => (
              <tr key={acc.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{acc.name}</td>
                <td className="px-4 py-3 text-slate-600">{acc.type}</td>
                <td className="px-4 py-3 text-slate-600">{acc.location.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {acc.location.starRating ? "★".repeat(acc.location.starRating) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={acc.isActive ? "active" : "inactive"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/accommodations/${acc.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {accommodations.length === 0 && (
              <TableEmptyRow
                colSpan={6}
                title="No stays yet."
                body="A stay is the resort, hotel or guesthouse a package puts guests in. Each package needs one, and each stay gets its own page listing its rooms and facilities."
                action={{ label: "New stay", href: "/admin/accommodations/new" }}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

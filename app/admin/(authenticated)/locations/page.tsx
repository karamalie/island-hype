import { getLocations } from "@/lib/actions/locations";
import { PageHeader } from "@/components/admin/ui/page-header";
import { TableEmptyRow } from "@/components/admin/ui/table-empty";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import Link from "next/link";

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Manage destinations and atolls"
        action={{ label: "New Location", href: "/admin/locations/new" }}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Atoll</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Island</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Featured</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Accommodations</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{loc.name}</td>
                <td className="px-4 py-3 text-slate-600">{loc.atoll}</td>
                <td className="px-4 py-3 text-slate-600">{loc.island || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={loc.isFeatured ? "featured" : "inactive"} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={loc.isActive ? "active" : "inactive"} />
                </td>
                <td className="px-4 py-3 text-slate-600">{loc._count.accommodations}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/locations/${loc.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {locations.length === 0 && (
              <TableEmptyRow
                colSpan={7}
                title="No islands yet."
                body="Every package has to sit on an island, so this is the thing to set up first. Islands also get their own page on the site, with a season calendar and transfer times."
                action={{ label: "New location", href: "/admin/locations/new" }}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

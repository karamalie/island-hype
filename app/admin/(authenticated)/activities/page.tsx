import { getActivities } from "@/lib/actions/activities";
import { PageHeader } from "@/components/admin/ui/page-header";
import { TableEmptyRow } from "@/components/admin/ui/table-empty";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import Link from "next/link";

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return (
    <div>
      <PageHeader
        title="Activities"
        description="Manage activities and add-ons"
        action={{ label: "New Activity", href: "/admin/activities/new" }}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Local (MVR)</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Intl (USD)</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act) => (
              <tr key={act.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{act.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {act.category.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3 text-slate-600">{act.location.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {act.localPrice != null ? `MVR ${act.localPrice}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {act.internationalPrice != null ? `$${act.internationalPrice}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={act.isActive ? "active" : "inactive"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/activities/${act.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <TableEmptyRow
                colSpan={7}
                title="No activities yet."
                body="Activities are the optional extras you attach to a package — diving, sandbank trips, fishing. They are genuinely optional: a package with none simply does not show that section on its page."
                action={{ label: "New activity", href: "/admin/activities/new" }}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { getPackages } from "@/lib/actions/packages";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import Link from "next/link";

export default async function PackagesPage() {
  const packages = await getPackages();

  return (
    <div>
      <PageHeader
        title="Packages"
        description="Manage travel packages"
        action={{ label: "New Package", href: "/admin/packages/new" }}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Location</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Accommodation</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Featured</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Inquiries</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{pkg.name}</div>
                  {pkg.shortDesc && (
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {pkg.shortDesc}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{pkg.location.name}</td>
                <td className="px-4 py-3 text-slate-600">{pkg.accommodation.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={pkg.isFeatured ? "featured" : "inactive"} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={pkg.isActive ? "active" : "inactive"} />
                </td>
                <td className="px-4 py-3 text-slate-600">{pkg._count.inquiries}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/packages/${pkg.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No packages found. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

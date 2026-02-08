import { getOffers } from "@/lib/actions/offers";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatusBadge } from "@/components/admin/ui/status-badge";
import Link from "next/link";

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <div>
      <PageHeader
        title="Offers"
        description="Manage promotions and discounts"
        action={{ label: "New Offer", href: "/admin/offers/new" }}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Badge</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Discount</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Package</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Valid</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const discountLabel =
                offer.discountType === "PERCENTAGE"
                  ? `${offer.discountValue}%`
                  : offer.discountType === "FREE_NIGHTS"
                    ? `${offer.discountValue} free nights`
                    : `$${offer.discountValue}`;
              return (
                <tr key={offer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{offer.name}</td>
                  <td className="px-4 py-3 text-slate-600">{offer.badge || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{discountLabel}</td>
                  <td className="px-4 py-3 text-slate-600">{offer.package.name}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {new Date(offer.validFrom).toLocaleDateString()} —{" "}
                    {new Date(offer.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={offer.isActive ? "active" : "inactive"} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/offers/${offer.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {offers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No offers found. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { getOffers } from "@/lib/actions/offers";
import { PageHeader } from "@/components/admin/ui/page-header";
import { TableEmptyRow } from "@/components/admin/ui/table-empty";
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
                    {/* Not offer.isActive on its own. An offer whose dates have
                        passed is invisible on the site while isActive is still
                        true, so a plain "Active" badge told staff the opposite of
                        what a guest sees. The verdict below is the same one the
                        public pages derive. */}
                    <OfferStatus offer={offer} />
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
              <TableEmptyRow
                colSpan={7}
                title="No offers yet."
                body="An offer shows as a badge on its package's card and as a panel on the package page, with its conditions and end date. It appears only while today falls inside its dates."
                action={{ label: "New offer", href: "/admin/offers/new" }}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * What a guest actually sees for this offer, in the same words the site uses.
 *
 * Four states, and the two middle ones are the reason this exists: an offer can
 * be switched on and still be invisible because its window has not opened yet or
 * has already closed. Two of the four offers in the database were in that state.
 */
function OfferStatus({
  offer,
}: {
  offer: { isActive: boolean; validFrom: Date; validUntil: Date };
}) {
  if (!offer.isActive) {
    return (
      <span className="inline-flex flex-col">
        <StatusBadge status="inactive" />
        <span className="mt-1 text-xs text-slate-400">Switched off</span>
      </span>
    );
  }

  const day = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
  };
  const today = day(new Date());
  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });

  if (today < day(offer.validFrom)) {
    return (
      <span className="inline-flex flex-col">
        <StatusBadge status="draft" />
        <span className="mt-1 text-xs text-slate-400">
          Starts {fmt(offer.validFrom)}
        </span>
      </span>
    );
  }

  if (today > day(offer.validUntil)) {
    return (
      <span className="inline-flex flex-col">
        <StatusBadge status="inactive" />
        <span className="mt-1 text-xs text-amber-600">
          Ended {fmt(offer.validUntil)} — not on the site
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col">
      <StatusBadge status="active" />
      <span className="mt-1 text-xs text-slate-400">
        Showing until {fmt(offer.validUntil)}
      </span>
    </span>
  );
}

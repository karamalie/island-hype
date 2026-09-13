"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { runAction } from "@/lib/admin/run-action";
import { useFormDraft } from "@/lib/admin/use-form-draft";
import { DraftBanner, ClearFormButton } from "@/components/admin/ui/form-draft";
import { BackButton } from "@/components/admin/ui/back-button";
import { DeleteWithImpact } from "@/components/admin/ui/delete-with-impact";
import { offerDeleteImpact } from "@/lib/actions/delete-impact";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import { createOffer, updateOffer, deleteOffer } from "@/lib/actions/offers";
import { generateSlug } from "@/lib/utils";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

interface OfferFormProps {
  offer?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    badge: string | null;
    discountType: string;
    discountValue: number;
    code: string | null;
    validFrom: Date;
    validUntil: Date;
    minNights: number | null;
    minGuests: number | null;
    market: string | null;
    packageId: string;
    isActive: boolean;
  };
  packages: { id: string; name: string }[];
}

function dateStr(d: Date | string | null): string {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().split("T")[0];
}

export function OfferForm({ offer, packages }: OfferFormProps) {
  const router = useRouter();
  const isEdit = !!offer;

  // One object for every field the draft and the undo both work on, built once
  // so the useState defaults and "put back what is saved" cannot drift apart.
  const saved = useMemo(
    () => ({
      name: offer?.name || "",
      slug: offer?.slug || "",
      description: offer?.description || "",
      badge: offer?.badge || "",
      discountType: offer?.discountType || "PERCENTAGE",
      discountValue: offer?.discountValue?.toString() || "",
      code: offer?.code || "",
      validFrom: dateStr(offer?.validFrom || null),
      validUntil: dateStr(offer?.validUntil || null),
      minNights: offer?.minNights?.toString() || "",
      minGuests: offer?.minGuests?.toString() || "",
      market: offer?.market || "",
      packageId: offer?.packageId || "",
      isActive: offer?.isActive ?? true,
    }),
    [offer]
  );

  const [name, setName] = useState(saved.name);
  const [slug, setSlug] = useState(saved.slug);
  const [description, setDescription] = useState(saved.description);
  const [badge, setBadge] = useState(saved.badge);
  const [discountType, setDiscountType] = useState(saved.discountType);
  const [discountValue, setDiscountValue] = useState(saved.discountValue);
  const [code, setCode] = useState(saved.code);
  const [validFrom, setValidFrom] = useState(saved.validFrom);
  const [validUntil, setValidUntil] = useState(saved.validUntil);
  const [minNights, setMinNights] = useState(saved.minNights);
  const [minGuests, setMinGuests] = useState(saved.minGuests);
  const [market, setMarket] = useState(saved.market);
  const [packageId, setPackageId] = useState(saved.packageId);
  const [isActive, setIsActive] = useState(saved.isActive);
  const [loading, setLoading] = useState(false);

  type Values = typeof saved;

  const values: Values = { name, slug, description, badge, discountType, discountValue, code, validFrom, validUntil, minNights, minGuests, market, packageId, isActive };

  function apply(v: Values) {
    setName(v.name);
    setSlug(v.slug);
    setDescription(v.description);
    setBadge(v.badge);
    setDiscountType(v.discountType);
    setDiscountValue(v.discountValue);
    setCode(v.code);
    setValidFrom(v.validFrom);
    setValidUntil(v.validUntil);
    setMinNights(v.minNights);
    setMinGuests(v.minGuests);
    setMarket(v.market);
    setPackageId(v.packageId);
    setIsActive(v.isActive);
  }

  // New records only — see the note in use-form-draft.ts on why an edit must not
  // be silently overwritten by a draft made days earlier.
  const draft = useFormDraft<Values>({
    key: "offer",
    enabled: !isEdit,
    values,
    baseline: saved,
    onRestore: apply,
  });

  const changed = JSON.stringify(values) !== JSON.stringify(saved);

  function handleClear() {
    apply(saved);
    draft.clear();
  }


  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) setSlug(generateSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("description", description);
    formData.set("badge", badge);
    formData.set("discountType", discountType);
    formData.set("discountValue", discountValue);
    formData.set("code", code);
    formData.set("validFrom", validFrom);
    formData.set("validUntil", validUntil);
    if (minNights) formData.set("minNights", minNights);
    if (minGuests) formData.set("minGuests", minGuests);
    formData.set("market", market);
    formData.set("packageId", packageId);
    formData.set("isActive", String(isActive));

    const result = await runAction(() =>
      isEdit ? updateOffer(offer.id, formData) : createOffer(formData)
    );

    setLoading(false);

    if (result.success) {
      draft.clear();
      toast.success(isEdit ? "Offer updated" : "Offer created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/offers/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }


  return (
    <div>
      <BackButton href="/admin/offers" />

      {draft.pending && (
        <DraftBanner
          savedAt={draft.pending.savedAt}
          onRestore={draft.restore}
          onDiscard={draft.discard}
        />
      )}
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${offer.name}` : "New Offer"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input value={name} onChange={(e) => handleNameChange(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Badge</label>
              <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g. 15% OFF" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Promo Code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type *</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className={inputClass}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
                <option value="FREE_NIGHTS">Free Nights</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Discount Value *</label>
              <input type="number" step="0.01" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid From *</label>
              <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valid Until *</label>
              <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Nights</label>
              <input type="number" value={minNights} onChange={(e) => setMinNights(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Min Guests</label>
              <input type="number" value={minGuests} onChange={(e) => setMinGuests(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Market</label>
              <select value={market} onChange={(e) => setMarket(e.target.value)} className={inputClass}>
                <option value="">All Markets</option>
                <option value="LOCAL">Local</option>
                <option value="INTERNATIONAL">International</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Package *</label>
            <select value={packageId} onChange={(e) => setPackageId(e.target.value)} required className={inputClass}>
              <option value="">Select package...</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
              ))}
            </select>
          </div>

          <Toggle checked={isActive} onChange={setIsActive} label="Active" />
        </div>

        <div className="flex flex-wrap gap-3">
          <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Offer"}</SubmitButton>
          <ClearFormButton isEdit={isEdit} disabled={!changed} onClear={handleClear} />
          {isEdit && (
            <DeleteWithImpact
                noun="offer"
                getImpact={() => offerDeleteImpact(offer!.id)}
                onDelete={() => deleteOffer(offer!.id)}
                redirectTo="/admin/offers"
              />
          )}
        </div>
      </form>
    </div>
  );
}

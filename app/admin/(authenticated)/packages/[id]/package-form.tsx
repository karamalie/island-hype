"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { runAction } from "@/lib/admin/run-action";
import { useFormDraft } from "@/lib/admin/use-form-draft";
import { DraftBanner, ClearFormButton } from "@/components/admin/ui/form-draft";
import { BackButton } from "@/components/admin/ui/back-button";
import { DeleteWithImpact } from "@/components/admin/ui/delete-with-impact";
import { packageDeleteImpact } from "@/lib/actions/delete-impact";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import { Tabs } from "@/components/admin/ui/tabs";
import {
  AvailabilityEditor,
  FaqEditor,
  PackageDisplayEditor,
  TagPicker,
  type BlackoutRow,
  type PackageDisplayFields,
} from "@/components/admin/editors";
import {
  createPackage,
  updatePackage,
  deletePackage,
  updatePackagePricing,
  updatePackageInclusions,
  updatePackageActivities,
  deletePackageImage,
} from "@/lib/actions/packages";
import { generateSlug } from "@/lib/utils";
import { X, Plus, Trash2 } from "lucide-react";
import { ImageGallery } from "@/components/admin/shared/image-gallery";
import { CoverImageUpload } from "@/components/admin/shared/cover-image-upload";
import type { InclusionCategory, Market } from "@prisma/client";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

const INCLUSION_CATEGORIES: InclusionCategory[] = [
  "ACCOMMODATION", "MEALS", "TRANSFER", "ACTIVITY", "EQUIPMENT", "SERVICE", "TAXES",
];

interface PricingData {
  basePrice: string;
  extraAdultPrice: string;
  childPrice: string;
  infantPrice: string;
  singleSupplement: string;
  childAgeMin: string;
  childAgeMax: string;
  validFrom: string;
  validUntil: string;
  notes: string;
}

interface InclusionRow {
  category: InclusionCategory;
  item: string;
  details: string;
}

interface ActivitySelection {
  activityId: string;
  isIncluded: boolean;
  /** Optional package-specific line, shown on the site instead of the activity's own blurb. */
  note: string;
}

interface PackageFormProps {
  pkg?: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    description: string;
    highlights: string[];
    locationId: string;
    accommodationId: string;
    minNights: number;
    maxNights: number | null;
    maxGuests: number | null;
    bookingWindowStart: Date | null;
    bookingWindowEnd: Date | null;
    travelWindowStart: Date | null;
    travelWindowEnd: Date | null;
    terms: string | null;
    cancellationPolicy: string | null;
    bookingInfo: string | null;
    coverImage: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
    images: { id: string; url: string; alt: string | null }[];
    pricing: {
      id: string;
      market: Market;
      basePrice: number;
      extraAdultPrice: number | null;
      childPrice: number | null;
      infantPrice: number | null;
      singleSupplement: number | null;
      childAgeMin: number;
      childAgeMax: number;
      validFrom: Date | null;
      validUntil: Date | null;
      notes: string | null;
    }[];
    inclusions: { category: InclusionCategory; item: string; details: string | null; sortOrder: number }[];
    activities: {
      activity: { id: string; name: string };
      isIncluded: boolean;
      note: string | null;
    }[];
  };
  locations: { id: string; name: string }[];
  accommodations: { id: string; name: string; locationId: string }[];
  allActivities?: { id: string; name: string; locationId: string }[];
  /** Card copy, dates, categories and questions — each saved on its own tab. */
  display?: PackageDisplayFields;
  blackouts?: BlackoutRow[];
  allTags?: { id: string; name: string }[];
  tagIds?: string[];
  faqs?: { question: string; answer: string }[];
  /** Drives the note explaining whether filters are visible on the site yet. */
  livePackageCount?: number;
}

function dateStr(d: Date | string | null): string {
  if (!d) return "";
  return new Date(d).toISOString().split("T")[0];
}

function initPricing(p?: PackageFormProps["pkg"]): { local: PricingData; international: PricingData } {
  const empty: PricingData = {
    basePrice: "", extraAdultPrice: "", childPrice: "",
    infantPrice: "", singleSupplement: "", childAgeMin: "2", childAgeMax: "11",
    validFrom: "", validUntil: "", notes: "",
  };
  if (!p) return { local: { ...empty }, international: { ...empty } };

  const result = { local: { ...empty }, international: { ...empty } };
  for (const pr of p.pricing) {
    const key = pr.market === "LOCAL" ? "local" : "international";
    result[key] = {
      basePrice: pr.basePrice.toString(),
      extraAdultPrice: pr.extraAdultPrice?.toString() || "",
      childPrice: pr.childPrice?.toString() || "",
      infantPrice: pr.infantPrice?.toString() || "",
      singleSupplement: pr.singleSupplement?.toString() || "",
      childAgeMin: pr.childAgeMin.toString(),
      childAgeMax: pr.childAgeMax.toString(),
      validFrom: dateStr(pr.validFrom),
      validUntil: dateStr(pr.validUntil),
      notes: pr.notes || "",
    };
  }
  return result;
}

export function PackageForm({
  pkg,
  locations,
  accommodations,
  allActivities = [],
  display,
  blackouts = [],
  allTags = [],
  tagIds = [],
  faqs = [],
  livePackageCount = 0,
}: PackageFormProps) {
  const router = useRouter();
  const isEdit = !!pkg;

  const [activeTab, setActiveTab] = useState("basic");

  // Basic info
  // One object for every field the draft and the undo both work on, built once
  // so the useState defaults and "put back what is saved" cannot drift apart.
  const saved = useMemo(
    () => ({
      name: pkg?.name || "",
      slug: pkg?.slug || "",
      shortDesc: pkg?.shortDesc || "",
      description: pkg?.description || "",
      highlights: pkg?.highlights || [],
      locationId: pkg?.locationId || "",
      accommodationId: pkg?.accommodationId || "",
      minNights: pkg?.minNights?.toString() || "1",
      maxNights: pkg?.maxNights?.toString() || "",
      maxGuests: pkg?.maxGuests?.toString() || "",
      isFeatured: pkg?.isFeatured ?? false,
      isActive: pkg?.isActive ?? true,
      sortOrder: pkg?.sortOrder || 0,
    }),
    [pkg]
  );

  const [name, setName] = useState(saved.name);
  const [slug, setSlug] = useState(saved.slug);
  const [shortDesc, setShortDesc] = useState(saved.shortDesc);
  const [description, setDescription] = useState(saved.description);
  const [highlights, setHighlights] = useState<string[]>(saved.highlights);
  const [newHighlight, setNewHighlight] = useState("");
  const [locationId, setLocationId] = useState(saved.locationId);
  const [accommodationId, setAccommodationId] = useState(saved.accommodationId);
  const [minNights, setMinNights] = useState(saved.minNights);
  const [maxNights, setMaxNights] = useState(saved.maxNights);
  const [maxGuests, setMaxGuests] = useState(saved.maxGuests);
  const [isFeatured, setIsFeatured] = useState(saved.isFeatured);
  const [isActive, setIsActive] = useState(saved.isActive);
  const [sortOrder, setSortOrder] = useState(saved.sortOrder);

  // Pricing
  const [pricing, setPricing] = useState(initPricing(pkg));

  // Inclusions
  const [inclusions, setInclusions] = useState<InclusionRow[]>(
    pkg?.inclusions.map((i) => ({ category: i.category, item: i.item, details: i.details || "" })) || []
  );

  // Activities — what a guest can do here; isIncluded separates price-inclusive from add-ons
  const [selectedActivities, setSelectedActivities] = useState<ActivitySelection[]>(
    pkg?.activities.map((a) => ({
      activityId: a.activity.id,
      isIncluded: a.isIncluded,
      note: a.note ?? "",
    })) || []
  );

  // Cover image (create mode)
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Images
  const currentImages = pkg?.images || [];

  // Terms
  const [terms, setTerms] = useState(pkg?.terms || "");
  const [cancellationPolicy, setCancellationPolicy] = useState(pkg?.cancellationPolicy || "");
  const [bookingInfo, setBookingInfo] = useState(pkg?.bookingInfo || "");

  // Loading states
  const [loading, setLoading] = useState(false);

  type Values = typeof saved;

  const values: Values = { name, slug, shortDesc, description, highlights, locationId, accommodationId, minNights, maxNights, maxGuests, isFeatured, isActive, sortOrder };

  function apply(v: Values) {
    setName(v.name);
    setSlug(v.slug);
    setShortDesc(v.shortDesc);
    setDescription(v.description);
    setHighlights(v.highlights);
    setLocationId(v.locationId);
    setAccommodationId(v.accommodationId);
    setMinNights(v.minNights);
    setMaxNights(v.maxNights);
    setMaxGuests(v.maxGuests);
    setIsFeatured(v.isFeatured);
    setIsActive(v.isActive);
    setSortOrder(v.sortOrder);
  }

  // New records only — see the note in use-form-draft.ts on why an edit must not
  // be silently overwritten by a draft made days earlier.
  const draft = useFormDraft<Values>({
    key: "package",
    enabled: !isEdit,
    values,
    baseline: saved,
    onRestore: apply,
  });

  const changed = JSON.stringify(values) !== JSON.stringify(saved);

  function handleClear() {
    apply(saved);
    setCoverFile(null);
    draft.clear();
  }

  const [savingPricing, setSavingPricing] = useState<string | null>(null);
  const [savingInclusions, setSavingInclusions] = useState(false);
  const [savingExpAct, setSavingExpAct] = useState(false);
  const [savingTerms, setSavingTerms] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) setSlug(generateSlug(value));
  }

  const tabs = isEdit
    ? [
        { id: "basic", label: "Basic info" },
        { id: "card", label: "What the card says" },
        { id: "pricing", label: "Pricing" },
        { id: "dates", label: "Dates & availability" },
        { id: "inclusions", label: "Inclusions" },
        { id: "expact", label: "Activities" },
        { id: "faqs", label: "Questions" },
        { id: "categories", label: "Categories" },
        { id: "images", label: "Images" },
        { id: "terms", label: "Terms" },
      ]
    : [{ id: "basic", label: "Basic info" }];

  // Filtered accommodations by selected location
  const filteredAccommodations = locationId
    ? accommodations.filter((a) => a.locationId === locationId)
    : accommodations;

  // === SAVE HANDLERS ===

  async function handleSaveBasic(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("shortDesc", shortDesc);
    formData.set("description", description);
    formData.set("highlights", highlights.join("\n"));
    formData.set("locationId", locationId);
    formData.set("accommodationId", accommodationId);
    formData.set("minNights", minNights);
    if (maxNights) formData.set("maxNights", maxNights);
    if (maxGuests) formData.set("maxGuests", maxGuests);
    formData.set("isFeatured", String(isFeatured));
    formData.set("isActive", String(isActive));
    formData.set("sortOrder", String(sortOrder));
    if (!isEdit && coverFile) formData.set("coverImage", coverFile);

    const result = await runAction(() =>
      isEdit ? updatePackage(pkg.id, formData) : createPackage(formData)
    );

    setLoading(false);

    if (result.success) {
      draft.clear();
      toast.success(isEdit ? "Package updated" : "Package created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/packages/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }

  async function handleSavePricing(market: "LOCAL" | "INTERNATIONAL") {
    if (!pkg) return;
    const key = market === "LOCAL" ? "local" : "international";
    const p = pricing[key];
    if (!p.basePrice) {
      toast.error("A price is required");
      return;
    }
    setSavingPricing(market);
    const result = await runAction(() =>
      updatePackagePricing(pkg.id, market, {
        basePrice: parseFloat(p.basePrice),
        extraAdultPrice: p.extraAdultPrice ? parseFloat(p.extraAdultPrice) : null,
        childPrice: p.childPrice ? parseFloat(p.childPrice) : null,
        infantPrice: p.infantPrice ? parseFloat(p.infantPrice) : null,
        singleSupplement: p.singleSupplement ? parseFloat(p.singleSupplement) : null,
        childAgeMin: parseInt(p.childAgeMin) || 2,
        childAgeMax: parseInt(p.childAgeMax) || 11,
        validFrom: p.validFrom || null,
        validUntil: p.validUntil || null,
        notes: p.notes || null,
      })
    );
    setSavingPricing(null);
    if (result.success) toast.success(`${market} pricing saved`);
    else toast.error(result.error || "Failed to save pricing");
  }

  async function handleSaveInclusions() {
    if (!pkg) return;
    setSavingInclusions(true);
    const result = await runAction(() =>
      updatePackageInclusions(
        pkg.id,
        inclusions.map((inc, i) => ({
          category: inc.category,
          item: inc.item,
          details: inc.details || null,
          sortOrder: i,
        }))
      )
    );
    setSavingInclusions(false);
    if (result.success) toast.success("Inclusions saved");
    else toast.error(result.error || "Failed to save");
  }

  async function handleSaveActivities() {
    if (!pkg) return;
    setSavingExpAct(true);
    const result = await runAction(() =>
      updatePackageActivities(pkg.id, selectedActivities)
    );
    setSavingExpAct(false);
    if (result.success) toast.success("Activities saved");
    else toast.error(result.error || "Failed to save activities");
  }

  async function handleSaveTerms() {
    if (!pkg) return;
    setSavingTerms(true);
    const formData = new FormData();
    formData.set("name", pkg.name);
    formData.set("slug", pkg.slug);
    formData.set("description", pkg.description);
    formData.set("highlights", pkg.highlights.join("\n"));
    formData.set("locationId", pkg.locationId);
    formData.set("accommodationId", pkg.accommodationId);
    formData.set("minNights", String(pkg.minNights));
    formData.set("isFeatured", String(pkg.isFeatured));
    formData.set("isActive", String(pkg.isActive));
    formData.set("sortOrder", String(pkg.sortOrder));
    formData.set("terms", terms);
    formData.set("cancellationPolicy", cancellationPolicy);
    formData.set("bookingInfo", bookingInfo);
    const result = await runAction(() => updatePackage(pkg.id, formData));
    setSavingTerms(false);
    if (result.success) toast.success("Terms saved");
    else toast.error(result.error || "Failed to save terms");
  }




  async function handleImageDelete(imageId: string) {
    return deletePackageImage(imageId);
  }

  function updatePricing(market: "local" | "international", field: string, value: string) {
    setPricing((prev) => ({
      ...prev,
      [market]: { ...prev[market], [field]: value },
    }));
  }

  function toggleActivity(activityId: string) {
    setSelectedActivities((prev) => {
      const exists = prev.find((a) => a.activityId === activityId);
      if (exists) return prev.filter((a) => a.activityId !== activityId);
      return [...prev, { activityId, isIncluded: true, note: "" }];
    });
  }

  function setActivityNote(activityId: string, note: string) {
    setSelectedActivities((prev) =>
      prev.map((a) => (a.activityId === activityId ? { ...a, note } : a))
    );
  }

  function toggleActivityIncluded(activityId: string) {
    setSelectedActivities((prev) =>
      prev.map((a) => (a.activityId === activityId ? { ...a, isIncluded: !a.isIncluded } : a))
    );
  }

  // === RENDER ===

  function renderPricingCard(market: "local" | "international", label: string, currency: string) {
    const p = pricing[market];
    const marketKey = market === "local" ? "LOCAL" : "INTERNATIONAL";
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-900">{label} ({currency})</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* One price, spanning both columns because it is not one of a pair
              any more. "Base Price" beside a "Couple Price" invited the reading
              that a guest pays base and a couple pays couple; this is the whole
              price of the package, and the fields under it adjust it. */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Price *</label>
            <input type="number" step="0.01" value={p.basePrice} onChange={(e) => updatePricing(market, "basePrice", e.target.value)} className={inputClass} />
            <p className="mt-1 text-xs text-slate-400">
              The total for the whole package, however many guests. Shown on the
              site as &ldquo;{currency === "MVR" ? "MVR " : "$"}
              {p.basePrice ? Number(p.basePrice).toLocaleString() : "0"} total&rdquo;.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Extra Adult</label>
            <input type="number" step="0.01" value={p.extraAdultPrice} onChange={(e) => updatePricing(market, "extraAdultPrice", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Child</label>
            <input type="number" step="0.01" value={p.childPrice} onChange={(e) => updatePricing(market, "childPrice", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Infant</label>
            <input type="number" step="0.01" value={p.infantPrice} onChange={(e) => updatePricing(market, "infantPrice", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Single Supplement</label>
            <input type="number" step="0.01" value={p.singleSupplement} onChange={(e) => updatePricing(market, "singleSupplement", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Child Age Min</label>
            <input type="number" value={p.childAgeMin} onChange={(e) => updatePricing(market, "childAgeMin", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Child Age Max</label>
            <input type="number" value={p.childAgeMax} onChange={(e) => updatePricing(market, "childAgeMax", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Valid From</label>
            <input type="date" value={p.validFrom} onChange={(e) => updatePricing(market, "validFrom", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Valid Until</label>
            <input type="date" value={p.validUntil} onChange={(e) => updatePricing(market, "validUntil", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea value={p.notes} onChange={(e) => updatePricing(market, "notes", e.target.value)} rows={2} className={inputClass} />
        </div>
        <SubmitButton
          type="button"
          loading={savingPricing === marketKey}
          onClick={() => handleSavePricing(marketKey as "LOCAL" | "INTERNATIONAL")}
        >
          Save {label} Pricing
        </SubmitButton>
      </div>
    );
  }

  return (
    <div>
      <BackButton href="/admin/packages" />

      {draft.pending && (
        <DraftBanner
          savedAt={draft.pending.savedAt}
          onRestore={draft.restore}
          onDiscard={draft.discard}
        />
      )}
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-4">
        {isEdit ? `Edit: ${pkg.name}` : "New Package"}
      </h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      <div className="max-w-3xl">
        {/* BASIC INFO TAB */}
        {activeTab === "basic" && (
          <form onSubmit={handleSaveBasic} className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <CoverImageUpload
                currentImageUrl={pkg?.coverImage || undefined}
                kind="package"
                entityId={pkg?.id}
                onFileChange={!isEdit ? setCoverFile : undefined}
                onUploaded={() => router.refresh()}
                required={!isEdit}
              />

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
                <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
                <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} maxLength={300} rows={2} className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className={inputClass} />
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Highlights</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newHighlight.trim()) { setHighlights([...highlights, newHighlight.trim()]); setNewHighlight(""); } } }}
                    placeholder="Add highlight..."
                    className={inputClass}
                  />
                  <button type="button" onClick={() => { if (newHighlight.trim()) { setHighlights([...highlights, newHighlight.trim()]); setNewHighlight(""); } }} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="flex-1">{h}</span>
                      <button type="button" onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                  <select value={locationId} onChange={(e) => { setLocationId(e.target.value); setAccommodationId(""); }} required className={inputClass}>
                    <option value="">Select...</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Accommodation *</label>
                  <select value={accommodationId} onChange={(e) => setAccommodationId(e.target.value)} required className={inputClass}>
                    <option value="">Select...</option>
                    {filteredAccommodations.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Nights</label>
                  <input type="number" min="1" value={minNights} onChange={(e) => setMinNights(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Nights</label>
                  <input type="number" value={maxNights} onChange={(e) => setMaxNights(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Guests</label>
                  <input type="number" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                  <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className={inputClass} />
                </div>
              </div>

              <div className="flex gap-4">
                <Toggle checked={isFeatured} onChange={setIsFeatured} label="Featured" />
                <Toggle checked={isActive} onChange={setIsActive} label="Active" />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <SubmitButton loading={loading}>{isEdit ? "Save Basic Info" : "Create Package"}</SubmitButton>
              <ClearFormButton isEdit={isEdit} disabled={!changed} onClear={handleClear} />
              {isEdit && (
                <DeleteWithImpact
                noun="package"
                getImpact={() => packageDeleteImpact(pkg!.id)}
                onDelete={() => deletePackage(pkg!.id)}
                redirectTo="/admin/packages"
              />
              )}
            </div>
          </form>
        )}

        {/* PRICING TAB */}
        {activeTab === "pricing" && isEdit && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderPricingCard("local", "Local Market", "MVR")}
            {renderPricingCard("international", "International Market", "USD")}
          </div>
        )}

        {/* INCLUSIONS TAB */}
        {activeTab === "inclusions" && isEdit && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-slate-900">Inclusions</h3>
              <button type="button" onClick={() => setInclusions([...inclusions, { category: "ACCOMMODATION", item: "", details: "" }])} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {inclusions.map((inc, i) => (
              <div key={i} className="flex gap-3 items-start">
                <select value={inc.category} onChange={(e) => { const updated = [...inclusions]; updated[i].category = e.target.value as InclusionCategory; setInclusions(updated); }} className={`${inputClass} w-40`}>
                  {INCLUSION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={inc.item} onChange={(e) => { const updated = [...inclusions]; updated[i].item = e.target.value; setInclusions(updated); }} placeholder="Item..." className={inputClass} />
                <input value={inc.details} onChange={(e) => { const updated = [...inclusions]; updated[i].details = e.target.value; setInclusions(updated); }} placeholder="Details..." className={inputClass} />
                <button type="button" onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))} className="p-2 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {inclusions.length === 0 && <p className="text-sm text-slate-500">No inclusions yet.</p>}
            <SubmitButton type="button" loading={savingInclusions} onClick={handleSaveInclusions}>Save Inclusions</SubmitButton>
          </div>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === "expact" && isEdit && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">Activities</h3>
              <div className="space-y-2">
                {allActivities.map((act) => {
                  const sel = selectedActivities.find((a) => a.activityId === act.id);
                  return (
                    <div key={act.id} className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input type="checkbox" checked={!!sel} onChange={() => toggleActivity(act.id)} className="rounded border-slate-300" />
                        <span className="text-sm text-slate-700">{act.name}</span>
                      </label>
                      {sel && (
                        <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={sel.isIncluded} onChange={() => toggleActivityIncluded(act.id)} className="rounded border-slate-300" />
                          Included in price
                        </label>
                      )}
                      {sel && (
                        <input
                          value={sel.note}
                          onChange={(e) => setActivityNote(act.id, e.target.value)}
                          placeholder="Optional note for this package…"
                          className="flex-1 min-w-0 px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                      )}
                    </div>
                  );
                })}
                {allActivities.length === 0 && <p className="text-sm text-slate-500">No activities available.</p>}
              </div>
            </div>
            <SubmitButton type="button" loading={savingExpAct} onClick={handleSaveActivities}>
              Save Activities
            </SubmitButton>
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === "card" && isEdit && display && (
          <PackageDisplayEditor packageId={pkg!.id} initial={display} />
        )}

        {activeTab === "dates" && isEdit && (
          <AvailabilityEditor
            packageId={pkg!.id}
            initialWindows={{
              travelStart: dateStr(pkg!.travelWindowStart),
              travelEnd: dateStr(pkg!.travelWindowEnd),
              bookingStart: dateStr(pkg!.bookingWindowStart),
              bookingEnd: dateStr(pkg!.bookingWindowEnd),
            }}
            initialBlackouts={blackouts}
          />
        )}

        {activeTab === "faqs" && isEdit && (
          <FaqEditor owner={{ packageId: pkg!.id }} initial={faqs} what="package" />
        )}

        {activeTab === "categories" && isEdit && (
          <TagPicker
            packageId={pkg!.id}
            allTags={allTags}
            initialTagIds={tagIds}
            livePackageCount={livePackageCount}
          />
        )}

        {activeTab === "images" && isEdit && (
          <ImageGallery
            images={currentImages}
            kind="package"
            entityId={pkg!.id}
            onDelete={handleImageDelete}
            onUploaded={() => router.refresh()}
          />
        )}

        {/* TERMS TAB */}
        {activeTab === "terms" && isEdit && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Terms & Conditions</label>
              <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={6} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cancellation Policy</label>
              <textarea value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Booking Info</label>
              <textarea value={bookingInfo} onChange={(e) => setBookingInfo(e.target.value)} rows={4} className={inputClass} />
            </div>
            <SubmitButton type="button" loading={savingTerms} onClick={handleSaveTerms}>Save Terms</SubmitButton>
          </div>
        )}
      </div>
    </div>
  );
}

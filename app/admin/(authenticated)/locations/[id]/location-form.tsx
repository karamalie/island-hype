"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { runAction } from "@/lib/admin/run-action";
import { useFormDraft } from "@/lib/admin/use-form-draft";
import { DraftBanner, ClearFormButton } from "@/components/admin/ui/form-draft";
import { BackButton } from "@/components/admin/ui/back-button";
import { DeleteWithImpact } from "@/components/admin/ui/delete-with-impact";
import { locationDeleteImpact } from "@/lib/actions/delete-impact";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import { ImageGallery } from "@/components/admin/shared/image-gallery";
import {
  FaqEditor,
  LocationCharacterEditor,
  SeasonEditor,
  StayTypesEditor,
  type LocationCharacterFields,
  type StayTypeOption,
  type StayTypeSelection,
} from "@/components/admin/editors";
import type { SeasonState } from "@prisma/client";
import { CoverImageUpload } from "@/components/admin/shared/cover-image-upload";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  deleteLocationImage,
} from "@/lib/actions/locations";
import { generateSlug } from "@/lib/utils";
import { X, Plus } from "lucide-react";
import { updateLocationAmenities } from "@/lib/actions/locations";

interface AmenityRow {
  group: string;
  item: string;
}

/** Hints, not a fixed list — the field is free text and staff can type anything. */
const AMENITY_GROUPS = ["On the island", "In the water", "Eating and drinking"];

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

const TRANSFER_TYPES = ["SPEEDBOAT", "SEAPLANE", "DOMESTIC_FLIGHT", "FERRY", "YACHT"] as const;

interface LocationFormProps {
  location?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDesc: string | null;
    atoll: string;
    island: string | null;
    latitude: number | null;
    longitude: number | null;
    transferType: string | null;
    transferTime: number | null;
    transferInfo: string | null;
    starRating: number | null;
    termsText: string | null;
    privacyText: string | null;
    importantInfo: string | null;
    coverImage: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
  };
  images?: { id: string; url: string; alt: string | null }[];
  amenities?: AmenityRow[];
  /** Each of these blocks saves on its own, below the main details form. */
  character?: LocationCharacterFields;
  season?: Record<number, SeasonState>;
  seasonLabel?: string;
  allStayTypes?: StayTypeOption[];
  stayTypes?: StayTypeSelection[];
  faqs?: { question: string; answer: string }[];
}

export function LocationForm({
  location,
  images = [],
  amenities: initialAmenities = [],
  character,
  season = {},
  seasonLabel = "",
  allStayTypes = [],
  stayTypes = [],
  faqs = [],
}: LocationFormProps) {
  const router = useRouter();
  const isEdit = !!location;

  // One object for every field the draft and the undo both work on, built once
  // so the useState defaults and "put back what is saved" cannot drift apart.
  const saved = useMemo(
    () => ({
      name: location?.name || "",
      slug: location?.slug || "",
      description: location?.description || "",
      shortDesc: location?.shortDesc || "",
      atoll: location?.atoll || "",
      island: location?.island || "",
      latitude: location?.latitude?.toString() || "",
      longitude: location?.longitude?.toString() || "",
      transferType: location?.transferType || "",
      transferTime: location?.transferTime?.toString() || "",
      transferInfo: location?.transferInfo || "",
      starRating: location?.starRating?.toString() || "",
      termsText: location?.termsText || "",
      privacyText: location?.privacyText || "",
      importantInfo: location?.importantInfo || "",
      isFeatured: location?.isFeatured ?? false,
      isActive: location?.isActive ?? true,
      sortOrder: location?.sortOrder || 0,
    }),
    [location]
  );

  const [name, setName] = useState(saved.name);
  const [slug, setSlug] = useState(saved.slug);
  const [description, setDescription] = useState(saved.description);
  const [shortDesc, setShortDesc] = useState(saved.shortDesc);
  const [atoll, setAtoll] = useState(saved.atoll);
  const [island, setIsland] = useState(saved.island);
  const [latitude, setLatitude] = useState(saved.latitude);
  const [longitude, setLongitude] = useState(saved.longitude);
  const [transferType, setTransferType] = useState(saved.transferType);
  const [transferTime, setTransferTime] = useState(saved.transferTime);
  const [transferInfo, setTransferInfo] = useState(saved.transferInfo);
  const [starRating, setStarRating] = useState(saved.starRating);
  const [amenities, setAmenities] = useState<AmenityRow[]>(initialAmenities);
  const [savingAmenities, setSavingAmenities] = useState(false);
  const [termsText, setTermsText] = useState(saved.termsText);
  const [privacyText, setPrivacyText] = useState(saved.privacyText);
  const [importantInfo, setImportantInfo] = useState(saved.importantInfo);
  const [isFeatured, setIsFeatured] = useState(saved.isFeatured);
  const [isActive, setIsActive] = useState(saved.isActive);
  const [sortOrder, setSortOrder] = useState(saved.sortOrder);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  type Values = typeof saved;

  const values: Values = { name, slug, description, shortDesc, atoll, island, latitude, longitude, transferType, transferTime, transferInfo, starRating, termsText, privacyText, importantInfo, isFeatured, isActive, sortOrder };

  function apply(v: Values) {
    setName(v.name);
    setSlug(v.slug);
    setDescription(v.description);
    setShortDesc(v.shortDesc);
    setAtoll(v.atoll);
    setIsland(v.island);
    setLatitude(v.latitude);
    setLongitude(v.longitude);
    setTransferType(v.transferType);
    setTransferTime(v.transferTime);
    setTransferInfo(v.transferInfo);
    setStarRating(v.starRating);
    setTermsText(v.termsText);
    setPrivacyText(v.privacyText);
    setImportantInfo(v.importantInfo);
    setIsFeatured(v.isFeatured);
    setIsActive(v.isActive);
    setSortOrder(v.sortOrder);
  }

  // New records only — see the note in use-form-draft.ts on why an edit must not
  // be silently overwritten by a draft made days earlier.
  const draft = useFormDraft<Values>({
    key: "location",
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
    formData.set("shortDesc", shortDesc);
    formData.set("atoll", atoll);
    formData.set("island", island);
    if (latitude) formData.set("latitude", latitude);
    if (longitude) formData.set("longitude", longitude);
    formData.set("transferType", transferType);
    if (transferTime) formData.set("transferTime", transferTime);
    formData.set("transferInfo", transferInfo);
    if (starRating) formData.set("starRating", starRating);
    formData.set("termsText", termsText);
    formData.set("privacyText", privacyText);
    formData.set("importantInfo", importantInfo);
    formData.set("isFeatured", String(isFeatured));
    formData.set("isActive", String(isActive));
    formData.set("sortOrder", String(sortOrder));
    if (!isEdit && coverFile) formData.set("coverImage", coverFile);

    const result = await runAction(() =>
      isEdit ? updateLocation(location.id, formData) : createLocation(formData)
    );

    setLoading(false);

    if (result.success) {
      draft.clear();
      toast.success(isEdit ? "Location updated" : "Location created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/locations/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }




  async function handleImageDelete(imageId: string) {
    return deleteLocationImage(imageId);
  }

  return (
    <div>
      <BackButton href="/admin/locations" />

      {draft.pending && (
        <DraftBanner
          savedAt={draft.pending.savedAt}
          onRestore={draft.restore}
          onDiscard={draft.discard}
        />
      )}
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${location.name}` : "New Location"}
      </h1>

      <div className="space-y-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <CoverImageUpload
              currentImageUrl={location?.coverImage || undefined}
              kind="location"
              entityId={location?.id}
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
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Atoll *</label>
                <input value={atoll} onChange={(e) => setAtoll(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Island</label>
                <input value={island} onChange={(e) => setIsland(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Type</label>
                <select value={transferType} onChange={(e) => setTransferType(e.target.value)} className={inputClass}>
                  <option value="">None</option>
                  {TRANSFER_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Time (min)</label>
                <input type="number" value={transferTime} onChange={(e) => setTransferTime(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transfer Info</label>
              <textarea value={transferInfo} onChange={(e) => setTransferInfo(e.target.value)} rows={2} className={inputClass} />
            </div>

            {/* The rating belongs here rather than on a stay: it describes the
                island or resort, and the stays under it are villa types. */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Star rating</label>
              <input type="number" min="1" max="5" value={starRating} onChange={(e) => setStarRating(e.target.value)} placeholder="e.g. 5" className={`${inputClass} max-w-[160px]`} />
              <p className="mt-1 text-xs leading-5 text-slate-400">
                For a resort, which is its own island. Stays here inherit it
                unless they carry a rating of their own — which is what a
                guesthouse on a local island should do. Leave blank for a local
                island: Maafushi has no star rating, its guesthouses do.
              </p>
            </div>

            {/* Generic, and shown on the PACKAGES rather than here — baggage,
                travel times, the things true of every package for this island. */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Important information</label>
              <textarea value={importantInfo} onChange={(e) => setImportantInfo(e.target.value)} rows={5} placeholder={"Baggage allowance on the transfer\nTravel times and check-in\nAnything true of every package here"} className={inputClass} />
              <p className="mt-1 text-xs text-slate-400">
                Appears on every package for this island, not on the island page itself.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Terms and conditions</label>
              <textarea value={termsText} onChange={(e) => setTermsText(e.target.value)} rows={6} className={inputClass} />
              <p className="mt-1 text-xs text-slate-400">
                Guests must accept these before sending an enquiry for any package here.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Privacy policy</label>
              <textarea value={privacyText} onChange={(e) => setPrivacyText(e.target.value)} rows={6} className={inputClass} />
            </div>

            <div className="flex gap-4">
              <Toggle checked={isFeatured} onChange={setIsFeatured} label="Featured" />
              <Toggle checked={isActive} onChange={setIsActive} label="Active" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Location"}</SubmitButton>
            <ClearFormButton isEdit={isEdit} disabled={!changed} onClear={handleClear} />
            {isEdit && (
              <DeleteWithImpact
                noun="island"
                getImpact={() => locationDeleteImpact(location!.id)}
                onDelete={() => deleteLocation(location!.id)}
                redirectTo="/admin/locations"
              />
            )}
          </div>
        </form>

        {/* Amenities. Shaped and edited exactly like a stay's facilities, so the
            two lists behave the same for whoever maintains them — and so the
            island's own offering is not confused with a villa's. */}
        {isEdit && location && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Amenities</h2>
                <p className="text-xs text-slate-500">
                  What the island offers. Grouped — the site renders one column per group.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAmenities([...amenities, { group: AMENITY_GROUPS[0], item: "" }])}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" /> Add amenity
              </button>
            </div>
            <div className="space-y-2">
              {amenities.map((a, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    list="amenity-groups"
                    value={a.group}
                    onChange={(e) => { const u = [...amenities]; u[i] = { ...u[i], group: e.target.value }; setAmenities(u); }}
                    placeholder="Group"
                    className={inputClass}
                  />
                  <input
                    value={a.item}
                    onChange={(e) => { const u = [...amenities]; u[i] = { ...u[i], item: e.target.value }; setAmenities(u); }}
                    placeholder="Dive centre, spa, sandbank picnics"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setAmenities(amenities.filter((_, idx) => idx !== i))}
                    className="px-2 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <datalist id="amenity-groups">
                {AMENITY_GROUPS.map((g) => <option key={g} value={g} />)}
              </datalist>
              {amenities.length === 0 && (
                <p className="text-sm text-slate-500">
                  No amenities yet. The section is hidden on the site until you add one.
                </p>
              )}
            </div>
            <div className="mt-3">
              <SubmitButton
                type="button"
                loading={savingAmenities}
                onClick={async () => {
                  setSavingAmenities(true);
                  const result = await runAction(() =>
                    updateLocationAmenities(location.id, amenities)
                  );
                  setSavingAmenities(false);
                  if (result.success) toast.success("Amenities saved");
                  else toast.error(result.error || "Failed to save amenities");
                }}
              >
                Save amenities
              </SubmitButton>
            </div>
          </div>
        )}

        {isEdit && location && (
          <>
            <ImageGallery
              images={images}
              kind="location"
              entityId={location!.id}
              onDelete={handleImageDelete}
              onUploaded={() => router.refresh()}
            />

            {/* Each block below saves independently. They are separate from the
                details form above because they are the parts that actually
                differentiate one island from another, and they are edited far
                more often than a slug or a latitude. */}
            {character && (
              <LocationCharacterEditor
                locationId={location.id}
                locationName={location.name}
                initial={character}
              />
            )}

            <SeasonEditor
              locationId={location.id}
              locationName={location.name}
              initialMonths={season}
              initialLabel={seasonLabel}
            />

            <StayTypesEditor
              locationId={location.id}
              locationName={location.name}
              allStayTypes={allStayTypes}
              initial={stayTypes}
            />

            <FaqEditor
              owner={{ locationId: location.id }}
              initial={faqs}
              what="island"
            />
          </>
        )}
      </div>
    </div>
  );
}

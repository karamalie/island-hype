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
    coverImage: string | null;
    isFeatured: boolean;
    isActive: boolean;
    sortOrder: number;
  };
  images?: { id: string; url: string; alt: string | null }[];
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
  const [isFeatured, setIsFeatured] = useState(saved.isFeatured);
  const [isActive, setIsActive] = useState(saved.isActive);
  const [sortOrder, setSortOrder] = useState(saved.sortOrder);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  type Values = typeof saved;

  const values: Values = { name, slug, description, shortDesc, atoll, island, latitude, longitude, transferType, transferTime, transferInfo, isFeatured, isActive, sortOrder };

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

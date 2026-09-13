"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { runAction } from "@/lib/admin/run-action";
import { useFormDraft } from "@/lib/admin/use-form-draft";
import { DraftBanner, ClearFormButton } from "@/components/admin/ui/form-draft";
import { BackButton } from "@/components/admin/ui/back-button";
import { DeleteWithImpact } from "@/components/admin/ui/delete-with-impact";
import { activityDeleteImpact } from "@/lib/actions/delete-impact";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import { ImageGallery } from "@/components/admin/shared/image-gallery";
import { CoverImageUpload } from "@/components/admin/shared/cover-image-upload";
import {
  createActivity,
  updateActivity,
  deleteActivity,
  deleteActivityImage,
} from "@/lib/actions/activities";
import { generateSlug } from "@/lib/utils";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

const CATEGORIES = [
  "WATER_SPORTS", "DIVING", "SNORKELING", "FISHING",
  "EXCURSION", "WELLNESS", "CULTURAL", "ADVENTURE",
] as const;

interface ActivityFormProps {
  activity?: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    description: string;
    category: string;
    duration: number | null;
    locationId: string;
    localPrice: number | null;
    internationalPrice: number | null;
    coverImage: string | null;
    isActive: boolean;
    sortOrder: number;
  };
  images?: { id: string; url: string; alt: string | null }[];
  locations: { id: string; name: string }[];
}

export function ActivityForm({ activity, images = [], locations }: ActivityFormProps) {
  const router = useRouter();
  const isEdit = !!activity;

  // One object for every field the draft and the undo both work on, built once
  // so the useState defaults and "put back what is saved" cannot drift apart.
  const saved = useMemo(
    () => ({
      name: activity?.name || "",
      slug: activity?.slug || "",
      shortDesc: activity?.shortDesc || "",
      description: activity?.description || "",
      category: activity?.category || "WATER_SPORTS",
      duration: activity?.duration?.toString() || "",
      locationId: activity?.locationId || "",
      localPrice: activity?.localPrice?.toString() || "",
      internationalPrice: activity?.internationalPrice?.toString() || "",
      isActive: activity?.isActive ?? true,
      sortOrder: activity?.sortOrder || 0,
    }),
    [activity]
  );

  const [name, setName] = useState(saved.name);
  const [slug, setSlug] = useState(saved.slug);
  const [shortDesc, setShortDesc] = useState(saved.shortDesc);
  const [description, setDescription] = useState(saved.description);
  const [category, setCategory] = useState(saved.category);
  const [duration, setDuration] = useState(saved.duration);
  const [locationId, setLocationId] = useState(saved.locationId);
  const [localPrice, setLocalPrice] = useState(saved.localPrice);
  const [internationalPrice, setInternationalPrice] = useState(saved.internationalPrice);
  const [isActive, setIsActive] = useState(saved.isActive);
  const [sortOrder, setSortOrder] = useState(saved.sortOrder);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  type Values = typeof saved;

  const values: Values = { name, slug, shortDesc, description, category, duration, locationId, localPrice, internationalPrice, isActive, sortOrder };

  function apply(v: Values) {
    setName(v.name);
    setSlug(v.slug);
    setShortDesc(v.shortDesc);
    setDescription(v.description);
    setCategory(v.category);
    setDuration(v.duration);
    setLocationId(v.locationId);
    setLocalPrice(v.localPrice);
    setInternationalPrice(v.internationalPrice);
    setIsActive(v.isActive);
    setSortOrder(v.sortOrder);
  }

  // New records only — see the note in use-form-draft.ts on why an edit must not
  // be silently overwritten by a draft made days earlier.
  const draft = useFormDraft<Values>({
    key: "activity",
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
    formData.set("shortDesc", shortDesc);
    formData.set("description", description);
    formData.set("category", category);
    if (duration) formData.set("duration", duration);
    formData.set("locationId", locationId);
    if (localPrice) formData.set("localPrice", localPrice);
    if (internationalPrice) formData.set("internationalPrice", internationalPrice);
    formData.set("isActive", String(isActive));
    formData.set("sortOrder", String(sortOrder));
    if (!isEdit && coverFile) formData.set("coverImage", coverFile);

    const result = await runAction(() =>
      isEdit ? updateActivity(activity.id, formData) : createActivity(formData)
    );

    setLoading(false);

    if (result.success) {
      draft.clear();
      toast.success(isEdit ? "Activity updated" : "Activity created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/activities/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }




  async function handleImageDelete(imageId: string) {
    return deleteActivityImage(imageId);
  }

  return (
    <div>
      <BackButton href="/admin/activities" />

      {draft.pending && (
        <DraftBanner
          savedAt={draft.pending.savedAt}
          onRestore={draft.restore}
          onDiscard={draft.discard}
        />
      )}
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${activity.name}` : "New Activity"}
      </h1>

      <div className="space-y-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <CoverImageUpload
              currentImageUrl={activity?.coverImage || undefined}
              kind="activity"
              entityId={activity?.id}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required className={inputClass}>
                <option value="">Select location...</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Local Price (MVR)</label>
                <input type="number" step="0.01" value={localPrice} onChange={(e) => setLocalPrice(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">International Price (USD)</label>
                <input type="number" step="0.01" value={internationalPrice} onChange={(e) => setInternationalPrice(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className={inputClass} />
              </div>
            </div>

            <Toggle checked={isActive} onChange={setIsActive} label="Active" />
          </div>

          <div className="flex flex-wrap gap-3">
            <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Activity"}</SubmitButton>
            <ClearFormButton isEdit={isEdit} disabled={!changed} onClear={handleClear} />
            {isEdit && (
              <DeleteWithImpact
                noun="activity"
                getImpact={() => activityDeleteImpact(activity!.id)}
                onDelete={() => deleteActivity(activity!.id)}
                redirectTo="/admin/activities"
              />
            )}
          </div>
        </form>

        {isEdit && (
          <ImageGallery
            images={images}
            kind="activity"
            entityId={activity!.id}
            onDelete={handleImageDelete}
            onUploaded={() => router.refresh()}
          />
        )}
      </div>
    </div>
  );
}

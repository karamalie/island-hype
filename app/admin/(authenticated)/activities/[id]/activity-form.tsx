"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  uploadActivityImage,
  deleteActivityImage,
  uploadActivityCoverImage,
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

  const [name, setName] = useState(activity?.name || "");
  const [slug, setSlug] = useState(activity?.slug || "");
  const [shortDesc, setShortDesc] = useState(activity?.shortDesc || "");
  const [description, setDescription] = useState(activity?.description || "");
  const [category, setCategory] = useState(activity?.category || "WATER_SPORTS");
  const [duration, setDuration] = useState(activity?.duration?.toString() || "");
  const [locationId, setLocationId] = useState(activity?.locationId || "");
  const [localPrice, setLocalPrice] = useState(activity?.localPrice?.toString() || "");
  const [internationalPrice, setInternationalPrice] = useState(activity?.internationalPrice?.toString() || "");
  const [isActive, setIsActive] = useState(activity?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(activity?.sortOrder || 0);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

    const result = isEdit
      ? await updateActivity(activity.id, formData)
      : await createActivity(formData);

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Activity updated" : "Activity created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/activities/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }


  async function handleCoverUpload(file: File) {
    if (!activity) return { success: false, error: "Save the activity first" };
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadActivityCoverImage(activity.id, formData);
    if (result.success) router.refresh();
    return result;
  }

  async function handleImageUpload(file: File) {
    if (!activity) return { success: false, error: "Save the activity first" };
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadActivityImage(activity.id, formData);
    if (result.success) router.refresh();
    return result;
  }

  async function handleImageDelete(imageId: string) {
    return deleteActivityImage(imageId);
  }

  return (
    <div>
      <BackButton href="/admin/activities" />
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${activity.name}` : "New Activity"}
      </h1>

      <div className="space-y-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <CoverImageUpload
              currentImageUrl={activity?.coverImage || undefined}
              onFileChange={!isEdit ? setCoverFile : undefined}
              onUpload={isEdit ? handleCoverUpload : undefined}
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

          <div className="flex gap-3">
            <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Activity"}</SubmitButton>
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
            onUpload={handleImageUpload}
            onDelete={handleImageDelete}
          />
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/admin/ui/back-button";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import { ImageGallery } from "@/components/admin/shared/image-gallery";
import { CoverImageUpload } from "@/components/admin/shared/cover-image-upload";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  uploadLocationImage,
  deleteLocationImage,
  uploadLocationCoverImage,
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
}

export function LocationForm({
  location,
  images = [],
}: LocationFormProps) {
  const router = useRouter();
  const isEdit = !!location;

  const [name, setName] = useState(location?.name || "");
  const [slug, setSlug] = useState(location?.slug || "");
  const [description, setDescription] = useState(location?.description || "");
  const [shortDesc, setShortDesc] = useState(location?.shortDesc || "");
  const [atoll, setAtoll] = useState(location?.atoll || "");
  const [island, setIsland] = useState(location?.island || "");
  const [latitude, setLatitude] = useState(location?.latitude?.toString() || "");
  const [longitude, setLongitude] = useState(location?.longitude?.toString() || "");
  const [transferType, setTransferType] = useState(location?.transferType || "");
  const [transferTime, setTransferTime] = useState(location?.transferTime?.toString() || "");
  const [transferInfo, setTransferInfo] = useState(location?.transferInfo || "");
  const [isFeatured, setIsFeatured] = useState(location?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(location?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(location?.sortOrder || 0);
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

    const result = isEdit
      ? await updateLocation(location.id, formData)
      : await createLocation(formData);

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Location updated" : "Location created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/locations/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!location || !confirm("Delete this location?")) return;
    const result = await deleteLocation(location.id);
    if (result.success) {
      toast.success("Location deleted");
      router.push("/admin/locations");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  async function handleCoverUpload(file: File) {
    if (!location) return { success: false, error: "Save the location first" };
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadLocationCoverImage(location.id, formData);
    if (result.success) router.refresh();
    return result;
  }

  async function handleImageUpload(file: File) {
    if (!location) return { success: false, error: "Save the location first" };
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadLocationImage(location.id, formData);
    if (result.success) router.refresh();
    return result;
  }

  async function handleImageDelete(imageId: string) {
    return deleteLocationImage(imageId);
  }

  return (
    <div>
      <BackButton href="/admin/locations" />
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${location.name}` : "New Location"}
      </h1>

      <div className="space-y-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <CoverImageUpload
              currentImageUrl={location?.coverImage || undefined}
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

          <div className="flex gap-3">
            <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Location"}</SubmitButton>
            {isEdit && (
              <SubmitButton type="button" variant="danger" onClick={handleDelete}>Delete</SubmitButton>
            )}
          </div>
        </form>

        {isEdit && (
          <>
            <ImageGallery
              images={images}
              onUpload={handleImageUpload}
              onDelete={handleImageDelete}
            />

          </>
        )}
      </div>
    </div>
  );
}

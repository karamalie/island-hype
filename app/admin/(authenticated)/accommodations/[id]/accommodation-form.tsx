"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/admin/ui/back-button";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import {
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  uploadAccommodationImage,
  deleteAccommodationImage,
  setAccommodationCoverImage,
} from "@/lib/actions/accommodations";
import { generateSlug } from "@/lib/utils";
import { X, Star, Plus } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

const TYPES = ["RESORT", "GUESTHOUSE", "HOTEL", "LIVEABOARD"] as const;

interface AccommodationFormProps {
  accommodation?: {
    id: string;
    name: string;
    slug: string;
    type: string;
    shortDesc: string | null;
    description: string;
    starRating: number | null;
    roomTypes: string[];
    amenities: string[];
    locationId: string;
    coverImage: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isActive: boolean;
    sortOrder: number;
  };
  images?: { id: string; url: string; alt: string | null }[];
  locations: { id: string; name: string }[];
}

export function AccommodationForm({ accommodation, images = [], locations }: AccommodationFormProps) {
  const router = useRouter();
  const isEdit = !!accommodation;

  const [name, setName] = useState(accommodation?.name || "");
  const [slug, setSlug] = useState(accommodation?.slug || "");
  const [type, setType] = useState(accommodation?.type || "RESORT");
  const [shortDesc, setShortDesc] = useState(accommodation?.shortDesc || "");
  const [description, setDescription] = useState(accommodation?.description || "");
  const [starRating, setStarRating] = useState(accommodation?.starRating?.toString() || "");
  const [locationId, setLocationId] = useState(accommodation?.locationId || "");
  const [roomTypes, setRoomTypes] = useState<string[]>(accommodation?.roomTypes || []);
  const [amenities, setAmenities] = useState<string[]>(accommodation?.amenities || []);
  const [newRoomType, setNewRoomType] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const [contactEmail, setContactEmail] = useState(accommodation?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(accommodation?.contactPhone || "");
  const [isActive, setIsActive] = useState(accommodation?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(accommodation?.sortOrder || 0);
  const [coverImg, setCoverImg] = useState(accommodation?.coverImage || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentImages, setCurrentImages] = useState(images);

  function handleNameChange(value: string) {
    setName(value);
    if (!isEdit) setSlug(generateSlug(value));
  }

  function addRoomType() {
    if (newRoomType.trim() && !roomTypes.includes(newRoomType.trim())) {
      setRoomTypes([...roomTypes, newRoomType.trim()]);
      setNewRoomType("");
    }
  }

  function addAmenity() {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("type", type);
    formData.set("shortDesc", shortDesc);
    formData.set("description", description);
    if (starRating) formData.set("starRating", starRating);
    formData.set("locationId", locationId);
    formData.set("roomTypes", roomTypes.join(","));
    formData.set("amenities", amenities.join(","));
    formData.set("contactEmail", contactEmail);
    formData.set("contactPhone", contactPhone);
    formData.set("isActive", String(isActive));
    formData.set("sortOrder", String(sortOrder));

    const result = isEdit
      ? await updateAccommodation(accommodation.id, formData)
      : await createAccommodation(formData);

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Accommodation updated" : "Accommodation created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/accommodations/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!accommodation || !confirm("Delete this accommodation?")) return;
    const result = await deleteAccommodation(accommodation.id);
    if (result.success) {
      toast.success("Accommodation deleted");
      router.push("/admin/accommodations");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !accommodation) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadAccommodationImage(accommodation.id, formData);
    setUploading(false);
    if (result.success && result.url) {
      setCurrentImages([...currentImages, { id: Date.now().toString(), url: result.url, alt: file.name }]);
      toast.success("Image uploaded");
      router.refresh();
    } else {
      toast.error(result.error || "Upload failed");
    }
    e.target.value = "";
  }

  async function handleImageDelete(imageId: string) {
    const result = await deleteAccommodationImage(imageId);
    if (result.success) {
      setCurrentImages(currentImages.filter((img) => img.id !== imageId));
      toast.success("Image deleted");
    }
  }

  async function handleSetCover(url: string) {
    if (!accommodation) return;
    const result = await setAccommodationCoverImage(accommodation.id, url);
    if (result.success) {
      setCoverImg(url);
      toast.success("Cover image set");
    }
  }

  return (
    <div>
      <BackButton href="/admin/accommodations" />
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${accommodation.name}` : "New Accommodation"}
      </h1>

      <div className="space-y-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Star Rating</label>
                <input type="number" min="1" max="5" value={starRating} onChange={(e) => setStarRating(e.target.value)} className={inputClass} />
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
              <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} maxLength={300} rows={2} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className={inputClass} />
            </div>

            {/* Room Types */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Room Types</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRoomType())}
                  placeholder="Add room type..."
                  className={inputClass}
                />
                <button type="button" onClick={addRoomType} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roomTypes.map((rt) => (
                  <span key={rt} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-sm text-slate-700">
                    {rt}
                    <button type="button" onClick={() => setRoomTypes(roomTypes.filter((r) => r !== rt))} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amenities</label>
              <div className="flex gap-2 mb-2">
                <input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                  placeholder="Add amenity..."
                  className={inputClass}
                />
                <button type="button" onClick={addAmenity} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map((am) => (
                  <span key={am} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-sm text-slate-700">
                    {am}
                    <button type="button" onClick={() => setAmenities(amenities.filter((a) => a !== am))} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
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
            <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Accommodation"}</SubmitButton>
            {isEdit && (
              <SubmitButton type="button" variant="danger" onClick={handleDelete}>Delete</SubmitButton>
            )}
          </div>
        </form>

        {isEdit && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Images</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {currentImages.map((img) => (
                <div
                  key={img.id}
                  className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer ${coverImg === img.url ? "border-blue-500" : "border-slate-200"}`}
                  onClick={() => handleSetCover(img.url)}
                >
                  <img src={img.url} alt={img.alt || ""} className="w-full h-24 object-cover" />
                  {coverImg === img.url && (
                    <div className="absolute top-1 left-1">
                      <Star className="w-4 h-4 text-blue-500 fill-blue-500" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleImageDelete(img.id); }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mb-2">Click an image to set it as the cover.</p>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-sm text-slate-600" />
            {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
          </div>
        )}
      </div>
    </div>
  );
}

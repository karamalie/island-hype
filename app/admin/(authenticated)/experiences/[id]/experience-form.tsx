"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/admin/ui/back-button";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  uploadExperienceImage,
  deleteExperienceImage,
} from "@/lib/actions/experiences";
import { generateSlug } from "@/lib/utils";
import { X } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

interface ExperienceFormProps {
  experience?: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    description: string;
    icon: string | null;
    isActive: boolean;
    sortOrder: number;
  };
  images?: { id: string; url: string; alt: string | null }[];
}

export function ExperienceForm({ experience, images = [] }: ExperienceFormProps) {
  const router = useRouter();
  const isEdit = !!experience;

  const [name, setName] = useState(experience?.name || "");
  const [slug, setSlug] = useState(experience?.slug || "");
  const [shortDesc, setShortDesc] = useState(experience?.shortDesc || "");
  const [description, setDescription] = useState(experience?.description || "");
  const [icon, setIcon] = useState(experience?.icon || "");
  const [isActive, setIsActive] = useState(experience?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(experience?.sortOrder || 0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentImages, setCurrentImages] = useState(images);

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
    formData.set("icon", icon);
    formData.set("isActive", String(isActive));
    formData.set("sortOrder", String(sortOrder));

    const result = isEdit
      ? await updateExperience(experience.id, formData)
      : await createExperience(formData);

    setLoading(false);

    if (result.success) {
      toast.success(isEdit ? "Experience updated" : "Experience created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/experiences/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!experience || !confirm("Delete this experience?")) return;
    const result = await deleteExperience(experience.id);
    if (result.success) {
      toast.success("Experience deleted");
      router.push("/admin/experiences");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !experience) return;
    setUploading(true);

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadExperienceImage(experience.id, formData);
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
    const result = await deleteExperienceImage(imageId);
    if (result.success) {
      setCurrentImages(currentImages.filter((img) => img.id !== imageId));
      toast.success("Image deleted");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  }

  return (
    <div>
      <BackButton href="/admin/experiences" />
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${experience.name}` : "New Experience"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
            <textarea
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              maxLength={300}
              rows={2}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
              <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. 🤿" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
          </div>

          <Toggle checked={isActive} onChange={setIsActive} label="Active" />
        </div>

        {isEdit && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Images</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {currentImages.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-200">
                  <img src={img.url} alt={img.alt || ""} className="w-full h-24 object-cover" />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="text-sm text-slate-600"
            />
            {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
          </div>
        )}

        <div className="flex gap-3">
          <SubmitButton loading={loading}>
            {isEdit ? "Save Changes" : "Create Experience"}
          </SubmitButton>
          {isEdit && (
            <SubmitButton type="button" variant="danger" onClick={handleDelete}>
              Delete
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}

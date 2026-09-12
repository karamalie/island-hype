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
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  uploadAccommodationImage,
  deleteAccommodationImage,
  uploadAccommodationCoverImage,
  updateAccommodationRooms,
  updateAccommodationFacilities,
} from "@/lib/actions/accommodations";
import { generateSlug } from "@/lib/utils";
import { X, Plus } from "lucide-react";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

const TYPES = ["RESORT", "GUESTHOUSE", "HOTEL", "LIVEABOARD"] as const;

/** The groups the design's two facility columns use. Free text, these are a hint. */
const FACILITY_GROUPS = ["Eating and drinking", "In the water", "On the island"];

interface RoomRow {
  name: string;
  blurb: string;
  nightlyFrom: string;
  size: string;
  sleeps: string;
  access: string;
}

interface FacilityRow {
  group: string;
  item: string;
}

const emptyRoom = (): RoomRow => ({
  name: "", blurb: "", nightlyFrom: "", size: "", sleeps: "", access: "",
});

interface AccommodationFormProps {
  accommodation?: {
    id: string;
    name: string;
    slug: string;
    type: string;
    shortDesc: string | null;
    description: string;
    starRating: number | null;
    locationId: string;
    houseReef: string | null;
    suits: string | null;
    boardOptions: string | null;
    absentNote: string | null;
    coverImage: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    isActive: boolean;
    sortOrder: number;
  };
  images?: { id: string; url: string; alt: string | null }[];
  locations: { id: string; name: string }[];
  rooms?: RoomRow[];
  facilities?: FacilityRow[];
}

export function AccommodationForm({
  accommodation,
  images = [],
  locations,
  rooms: initialRooms = [],
  facilities: initialFacilities = [],
}: AccommodationFormProps) {
  const router = useRouter();
  const isEdit = !!accommodation;

  const [name, setName] = useState(accommodation?.name || "");
  const [slug, setSlug] = useState(accommodation?.slug || "");
  const [type, setType] = useState(accommodation?.type || "RESORT");
  const [shortDesc, setShortDesc] = useState(accommodation?.shortDesc || "");
  const [description, setDescription] = useState(accommodation?.description || "");
  const [starRating, setStarRating] = useState(accommodation?.starRating?.toString() || "");
  const [locationId, setLocationId] = useState(accommodation?.locationId || "");
  const [rooms, setRooms] = useState<RoomRow[]>(initialRooms);
  const [facilities, setFacilities] = useState<FacilityRow[]>(initialFacilities);
  const [savingRooms, setSavingRooms] = useState(false);
  const [savingFacilities, setSavingFacilities] = useState(false);
  // Display fields the redesign reads. Nullable — a blank drops the row on the site.
  const [houseReef, setHouseReef] = useState(accommodation?.houseReef || "");
  const [suits, setSuits] = useState(accommodation?.suits || "");
  const [boardOptions, setBoardOptions] = useState(accommodation?.boardOptions || "");
  const [absentNote, setAbsentNote] = useState(accommodation?.absentNote || "");
  const [contactEmail, setContactEmail] = useState(accommodation?.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(accommodation?.contactPhone || "");
  const [isActive, setIsActive] = useState(accommodation?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(accommodation?.sortOrder || 0);
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
    formData.set("type", type);
    formData.set("shortDesc", shortDesc);
    formData.set("description", description);
    if (starRating) formData.set("starRating", starRating);
    formData.set("locationId", locationId);
    formData.set("houseReef", houseReef);
    formData.set("suits", suits);
    formData.set("boardOptions", boardOptions);
    formData.set("absentNote", absentNote);
    formData.set("contactEmail", contactEmail);
    formData.set("contactPhone", contactPhone);
    formData.set("isActive", String(isActive));
    formData.set("sortOrder", String(sortOrder));
    if (!isEdit && coverFile) formData.set("coverImage", coverFile);

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

  async function handleCoverUpload(file: File) {
    if (!accommodation) return { success: false, error: "Save the accommodation first" };
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadAccommodationCoverImage(accommodation.id, formData);
    if (result.success) router.refresh();
    return result;
  }

  async function handleImageUpload(file: File) {
    if (!accommodation) return { success: false, error: "Save the accommodation first" };
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadAccommodationImage(accommodation.id, formData);
    if (result.success) router.refresh();
    return result;
  }

  async function handleImageDelete(imageId: string) {
    return deleteAccommodationImage(imageId);
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
            <CoverImageUpload
              currentImageUrl={accommodation?.coverImage || undefined}
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

            {/* Display fields the redesign reads — all optional */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">House reef</label>
                <input value={houseReef} onChange={(e) => setHouseReef(e.target.value)} placeholder="Yes — 9m from the villa ladder" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Suits</label>
                <input value={suits} onChange={(e) => setSuits(e.target.value)} placeholder="Couples, snorkellers, divers" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Board options</label>
                <input value={boardOptions} onChange={(e) => setBoardOptions(e.target.value)} placeholder="Half-board or full-board" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  What&apos;s absent
                  <span className="ml-1 font-normal text-slate-400">shown under the facilities</span>
                </label>
                <input value={absentNote} onChange={(e) => setAbsentNote(e.target.value)} placeholder="No kids' club, patchy villa wifi" className={inputClass} />
              </div>
            </div>

            {isEdit && (
              <>
                {/* Rooms */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Rooms</h3>
                      <p className="text-xs text-slate-500">Only the name is required. Blank cells are hidden on the site.</p>
                    </div>
                    <button type="button" onClick={() => setRooms([...rooms, emptyRoom()])} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                      <Plus className="w-4 h-4" /> Add room
                    </button>
                  </div>
                  <div className="space-y-3">
                    {rooms.map((r, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={r.name}
                            onChange={(e) => { const u = [...rooms]; u[i] = { ...u[i], name: e.target.value }; setRooms(u); }}
                            placeholder="Water villa"
                            className={inputClass}
                          />
                          <button type="button" onClick={() => setRooms(rooms.filter((_, idx) => idx !== i))} className="px-2 text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={r.blurb}
                          onChange={(e) => { const u = [...rooms]; u[i] = { ...u[i], blurb: e.target.value }; setRooms(u); }}
                          placeholder="What makes this room worth having…"
                          rows={2}
                          className={inputClass}
                        />
                        <div className="grid grid-cols-4 gap-2">
                          <input value={r.nightlyFrom} onChange={(e) => { const u = [...rooms]; u[i] = { ...u[i], nightlyFrom: e.target.value }; setRooms(u); }} placeholder="From / night" className={inputClass} />
                          <input value={r.size} onChange={(e) => { const u = [...rooms]; u[i] = { ...u[i], size: e.target.value }; setRooms(u); }} placeholder="78 m²" className={inputClass} />
                          <input value={r.sleeps} onChange={(e) => { const u = [...rooms]; u[i] = { ...u[i], sleeps: e.target.value }; setRooms(u); }} placeholder="2 adults" className={inputClass} />
                          <input value={r.access} onChange={(e) => { const u = [...rooms]; u[i] = { ...u[i], access: e.target.value }; setRooms(u); }} placeholder="Ladder to lagoon" className={inputClass} />
                        </div>
                      </div>
                    ))}
                    {rooms.length === 0 && <p className="text-sm text-slate-500">No rooms yet. The room section is hidden on the site until you add one.</p>}
                  </div>
                  <div className="mt-3">
                    <SubmitButton
                      type="button"
                      loading={savingRooms}
                      onClick={async () => {
                        setSavingRooms(true);
                        const result = await updateAccommodationRooms(
                          accommodation!.id,
                          rooms.map((r) => ({
                            name: r.name,
                            blurb: r.blurb,
                            nightlyFrom: r.nightlyFrom ? Number(r.nightlyFrom) : null,
                            size: r.size,
                            sleeps: r.sleeps,
                            access: r.access,
                          }))
                        );
                        setSavingRooms(false);
                        if (result.success) toast.success("Rooms saved");
                        else toast.error(result.error || "Failed to save rooms");
                      }}
                    >
                      Save rooms
                    </SubmitButton>
                  </div>
                </div>

                {/* Facilities */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Facilities</h3>
                      <p className="text-xs text-slate-500">Grouped — the site renders one column per group.</p>
                    </div>
                    <button type="button" onClick={() => setFacilities([...facilities, { group: FACILITY_GROUPS[0], item: "" }])} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                      <Plus className="w-4 h-4" /> Add facility
                    </button>
                  </div>
                  <div className="space-y-2">
                    {facilities.map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          list="facility-groups"
                          value={f.group}
                          onChange={(e) => { const u = [...facilities]; u[i] = { ...u[i], group: e.target.value }; setFacilities(u); }}
                          placeholder="Group"
                          className={inputClass}
                        />
                        <input
                          value={f.item}
                          onChange={(e) => { const u = [...facilities]; u[i] = { ...u[i], item: e.target.value }; setFacilities(u); }}
                          placeholder="PADI dive centre, nitrox available"
                          className={inputClass}
                        />
                        <button type="button" onClick={() => setFacilities(facilities.filter((_, idx) => idx !== i))} className="px-2 text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <datalist id="facility-groups">
                      {FACILITY_GROUPS.map((g) => <option key={g} value={g} />)}
                    </datalist>
                    {facilities.length === 0 && <p className="text-sm text-slate-500">No facilities yet. The section is hidden on the site until you add one.</p>}
                  </div>
                  <div className="mt-3">
                    <SubmitButton
                      type="button"
                      loading={savingFacilities}
                      onClick={async () => {
                        setSavingFacilities(true);
                        const result = await updateAccommodationFacilities(accommodation!.id, facilities);
                        setSavingFacilities(false);
                        if (result.success) toast.success("Facilities saved");
                        else toast.error(result.error || "Failed to save facilities");
                      }}
                    >
                      Save facilities
                    </SubmitButton>
                  </div>
                </div>
              </>
            )}

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

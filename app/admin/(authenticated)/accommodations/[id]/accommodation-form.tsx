"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { runAction } from "@/lib/admin/run-action";
import { useFormDraft } from "@/lib/admin/use-form-draft";
import { DraftBanner, ClearFormButton } from "@/components/admin/ui/form-draft";
import { BackButton } from "@/components/admin/ui/back-button";
import { DeleteWithImpact } from "@/components/admin/ui/delete-with-impact";
import { accommodationDeleteImpact } from "@/lib/actions/delete-impact";
import { SubmitButton } from "@/components/admin/ui/submit-button";
import { Toggle } from "@/components/admin/ui/toggle";
import { ImageGallery } from "@/components/admin/shared/image-gallery";
import { CoverImageUpload } from "@/components/admin/shared/cover-image-upload";
import {
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  deleteAccommodationImage,
  updateAccommodationRooms,
  updateAccommodationFacilities,
} from "@/lib/actions/accommodations";
import { generateSlug } from "@/lib/utils";
import { FaqEditor } from "@/components/admin/editors";
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
    maxAdults: number | null;
    maxChildren: number | null;
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
  faqs?: { question: string; answer: string }[];
}

export function AccommodationForm({
  accommodation,
  images = [],
  locations,
  rooms: initialRooms = [],
  facilities: initialFacilities = [],
  faqs = [],
}: AccommodationFormProps) {
  const router = useRouter();
  const isEdit = !!accommodation;

  // One object for every field the draft and the undo both work on, built once
  // so the useState defaults and "put back what is saved" cannot drift apart.
  const saved = useMemo(
    () => ({
      name: accommodation?.name || "",
      slug: accommodation?.slug || "",
      type: accommodation?.type || "RESORT",
      shortDesc: accommodation?.shortDesc || "",
      description: accommodation?.description || "",
      starRating: accommodation?.starRating?.toString() || "",
      maxAdults: accommodation?.maxAdults?.toString() || "",
      maxChildren: accommodation?.maxChildren?.toString() || "",
      locationId: accommodation?.locationId || "",
      houseReef: accommodation?.houseReef || "",
      suits: accommodation?.suits || "",
      boardOptions: accommodation?.boardOptions || "",
      absentNote: accommodation?.absentNote || "",
      contactEmail: accommodation?.contactEmail || "",
      contactPhone: accommodation?.contactPhone || "",
      isActive: accommodation?.isActive ?? true,
      sortOrder: accommodation?.sortOrder || 0,
    }),
    [accommodation]
  );

  const [name, setName] = useState(saved.name);
  const [slug, setSlug] = useState(saved.slug);
  const [type, setType] = useState(saved.type);
  const [shortDesc, setShortDesc] = useState(saved.shortDesc);
  const [description, setDescription] = useState(saved.description);
  const [starRating, setStarRating] = useState(saved.starRating);
  const [maxAdults, setMaxAdults] = useState(saved.maxAdults);
  const [maxChildren, setMaxChildren] = useState(saved.maxChildren);
  const [locationId, setLocationId] = useState(saved.locationId);
  const [rooms, setRooms] = useState<RoomRow[]>(initialRooms);
  const [facilities, setFacilities] = useState<FacilityRow[]>(initialFacilities);
  const [savingRooms, setSavingRooms] = useState(false);
  const [savingFacilities, setSavingFacilities] = useState(false);
  // Display fields the redesign reads. Nullable — a blank drops the row on the site.
  const [houseReef, setHouseReef] = useState(saved.houseReef);
  const [suits, setSuits] = useState(saved.suits);
  const [boardOptions, setBoardOptions] = useState(saved.boardOptions);
  const [absentNote, setAbsentNote] = useState(saved.absentNote);
  const [contactEmail, setContactEmail] = useState(saved.contactEmail);
  const [contactPhone, setContactPhone] = useState(saved.contactPhone);
  const [isActive, setIsActive] = useState(saved.isActive);
  const [sortOrder, setSortOrder] = useState(saved.sortOrder);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  type Values = typeof saved;

  const values: Values = {
    name, slug, type, shortDesc, description, starRating, maxAdults, maxChildren, locationId,
    houseReef, suits, boardOptions, absentNote, contactEmail, contactPhone,
    isActive, sortOrder,
  };

  function apply(v: Values) {
    setName(v.name);
    setSlug(v.slug);
    setType(v.type);
    setShortDesc(v.shortDesc);
    setDescription(v.description);
    setStarRating(v.starRating);
    setMaxAdults(v.maxAdults);
    setMaxChildren(v.maxChildren);
    setLocationId(v.locationId);
    setHouseReef(v.houseReef);
    setSuits(v.suits);
    setBoardOptions(v.boardOptions);
    setAbsentNote(v.absentNote);
    setContactEmail(v.contactEmail);
    setContactPhone(v.contactPhone);
    setIsActive(v.isActive);
    setSortOrder(v.sortOrder);
  }

  // New records only — see the note in use-form-draft.ts on why an edit must not
  // be silently overwritten by a draft made days earlier.
  const draft = useFormDraft<Values>({
    key: "accommodation",
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
    formData.set("type", type);
    formData.set("shortDesc", shortDesc);
    formData.set("description", description);
    if (starRating) formData.set("starRating", starRating);
    if (maxAdults) formData.set("maxAdults", maxAdults);
    if (maxChildren) formData.set("maxChildren", maxChildren);
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

    const result = await runAction(() =>
      isEdit
        ? updateAccommodation(accommodation.id, formData)
        : createAccommodation(formData)
    );

    setLoading(false);

    if (result.success) {
      draft.clear();
      toast.success(isEdit ? "Accommodation updated" : "Accommodation created");
      if (!isEdit && "data" in result) {
        const created = result as { data: { id: string } };
        router.push(`/admin/accommodations/${created.data.id}`);
      }
    } else {
      toast.error(result.error || "Something went wrong");
    }
  }




  async function handleImageDelete(imageId: string) {
    return deleteAccommodationImage(imageId);
  }

  return (
    <div>
      <BackButton href="/admin/accommodations" />

      {draft.pending && (
        <DraftBanner
          savedAt={draft.pending.savedAt}
          onRestore={draft.restore}
          onDiscard={draft.discard}
        />
      )}
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-6">
        {isEdit ? `Edit: ${accommodation.name}` : "New Accommodation"}
      </h1>

      <div className="space-y-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <CoverImageUpload
              currentImageUrl={accommodation?.coverImage || undefined}
              kind="accommodation"
              entityId={accommodation?.id}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Occupancy. These caps the Guests selector on every package sold
                against this stay, so nobody can enquire for six people in a
                villa that sleeps three and find out only after a reply. Left
                blank means we have not asked the island yet, and the selector
                falls back to its old ceiling rather than guessing a limit. */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Star rating</label>
              <input type="number" min="1" max="5" value={starRating} onChange={(e) => setStarRating(e.target.value)} placeholder="Leave blank for a resort" className={`${inputClass} max-w-[200px]`} />
              <p className="mt-1 text-xs leading-5 text-slate-400">
                For a guesthouse or hotel with its own rating. Leave blank for a
                resort&rsquo;s room types — the island&rsquo;s rating is used
                instead, and a room does not have a star rating of its own.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max adults</label>
                <input type="number" min="1" value={maxAdults} onChange={(e) => setMaxAdults(e.target.value)} placeholder="e.g. 3" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max children</label>
                <input type="number" min="0" value={maxChildren} onChange={(e) => setMaxChildren(e.target.value)} placeholder="e.g. 2" className={inputClass} />
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
                        const result = await runAction(() =>
                          updateAccommodationRooms(
                            accommodation!.id,
                            rooms.map((r) => ({
                              name: r.name,
                              blurb: r.blurb,
                              nightlyFrom: r.nightlyFrom ? Number(r.nightlyFrom) : null,
                              size: r.size,
                              sleeps: r.sleeps,
                              access: r.access,
                            }))
                          )
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
                        const result = await runAction(() =>
                          updateAccommodationFacilities(accommodation!.id, facilities)
                        );
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

          <div className="flex flex-wrap gap-3">
            <SubmitButton loading={loading}>{isEdit ? "Save Changes" : "Create Accommodation"}</SubmitButton>
            <ClearFormButton isEdit={isEdit} disabled={!changed} onClear={handleClear} />
            {isEdit && (
              <DeleteWithImpact
                noun="place to stay"
                getImpact={() => accommodationDeleteImpact(accommodation!.id)}
                onDelete={() => deleteAccommodation(accommodation!.id)}
                redirectTo="/admin/accommodations"
              />
            )}
          </div>
        </form>

        {isEdit && accommodation && (
          <>
            <ImageGallery
              images={images}
              kind="accommodation"
              entityId={accommodation!.id}
              onDelete={handleImageDelete}
              onUploaded={() => router.refresh()}
            />

            <FaqEditor
              owner={{ accommodationId: accommodation.id }}
              initial={faqs}
              what="stay"
            />
          </>
        )}
      </div>
    </div>
  );
}

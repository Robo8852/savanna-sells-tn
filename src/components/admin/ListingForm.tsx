"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useStorageUrl } from "@/hooks/useStorageUrl";
import { Upload, X, Loader2 } from "lucide-react";

// ─── TYPES ───

export type ListingFormData = {
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  state: string;
  beds: number;
  baths: number;
  sqft: number;
  status: "for-sale" | "pending" | "sold" | "hidden";
  address?: string;
  zip?: string;
  propertyType?: string;
  yearBuilt?: number;
  features?: string[];
  mlsNumber?: string;
  images: Id<"_storage">[];
};

type Props = {
  initialData?: ListingFormData;
  onSubmit: (data: ListingFormData) => Promise<void>;
  submitLabel: string;
};

// ─── CONSTANTS ───

const PROPERTY_TYPES = [
  { value: "", label: "Select type…" },
  { value: "single-family", label: "Single-Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-family", label: "Multi-Family" },
  { value: "land", label: "Land" },
];

const STATUS_OPTIONS = [
  { value: "for-sale", label: "For Sale" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "hidden", label: "Hidden" },
];

// ─── IMAGE PREVIEW ───
// Shows a thumbnail for an image — either an existing Convex storage ID
// or a freshly selected file (shown via a local blob URL).

function ImagePreview({
  src,
  onRemove,
}: {
  src: string;
  onRemove: () => void;
}) {
  return (
    <div className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── STORAGE IMAGE PREVIEW ───
// Resolves a Convex storage ID to a URL, then renders ImagePreview.
// We use a dedicated component so each image has its own query subscription.

function StorageImagePreview({
  storageId,
  onRemove,
}: {
  storageId: Id<"_storage">;
  onRemove: () => void;
}) {
  const url = useStorageUrl(storageId);

  if (!url) {
    return (
      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-secondary">
        <Loader2 size={18} className="animate-spin text-primary/30" />
      </div>
    );
  }

  return <ImagePreview src={url} onRemove={onRemove} />;
}

// ─── FEATURE TAG INPUT ───
// Type a feature name, press Enter to add it as a tag.

function FeatureTagInput({
  features,
  onChange,
}: {
  features: string[];
  onChange: (features: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addFeature() {
    const trimmed = input.trim();
    if (trimmed && !features.includes(trimmed)) {
      onChange([...features, trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addFeature();
            }
          }}
          placeholder="Type a feature and press Enter…"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={addFeature}
          className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-gray-200"
        >
          Add
        </button>
      </div>
      {features.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {features.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
            >
              {feature}
              <button
                type="button"
                onClick={() =>
                  onChange(features.filter((f) => f !== feature))
                }
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-accent/20"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN FORM ───

export default function ListingForm({
  initialData,
  onSubmit,
  submitLabel,
}: Props) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // ── Form state ──
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [state, setState] = useState(initialData?.state ?? "TN");
  const [zip, setZip] = useState(initialData?.zip ?? "");
  const [beds, setBeds] = useState(initialData?.beds?.toString() ?? "");
  const [baths, setBaths] = useState(initialData?.baths?.toString() ?? "");
  const [sqft, setSqft] = useState(initialData?.sqft?.toString() ?? "");
  const [propertyType, setPropertyType] = useState(initialData?.propertyType ?? "");
  const [yearBuilt, setYearBuilt] = useState(initialData?.yearBuilt?.toString() ?? "");
  const [status, setStatus] = useState<ListingFormData["status"]>(
    initialData?.status ?? "for-sale"
  );
  const [features, setFeatures] = useState<string[]>(initialData?.features ?? []);
  const [mlsNumber, setMlsNumber] = useState(initialData?.mlsNumber ?? "");

  // ── Image state ──
  // existingImages: storage IDs that were already saved (edit mode)
  // newFiles: files the user just selected (not yet uploaded)
  const [existingImages, setExistingImages] = useState<Id<"_storage">[]>(
    initialData?.images ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Submission state ──
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Upload a single file to Convex storage ──
  async function uploadFile(file: File): Promise<Id<"_storage">> {
    const uploadUrl = await generateUploadUrl();
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await response.json();
    return storageId as Id<"_storage">;
  }

  // ── Handle form submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Upload any new files first
      const uploadedIds = await Promise.all(newFiles.map(uploadFile));
      const allImages = [...existingImages, ...uploadedIds];

      if (allImages.length === 0) {
        setError("Please add at least one image.");
        setSubmitting(false);
        return;
      }

      const data: ListingFormData = {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        location: location.trim(),
        city: city.trim(),
        state: state.trim(),
        beds: Number(beds),
        baths: Number(baths),
        sqft: Number(sqft),
        status,
        images: allImages,
        ...(address.trim() && { address: address.trim() }),
        ...(zip.trim() && { zip: zip.trim() }),
        ...(propertyType && { propertyType }),
        ...(yearBuilt && { yearBuilt: Number(yearBuilt) }),
        ...(features.length > 0 && { features }),
        ...(mlsNumber.trim() && { mlsNumber: mlsNumber.trim() }),
      };

      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  // ── Drag & drop handlers ──
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setNewFiles((prev) => [...prev, ...files]);
  }

  // ── Shared input styles ──
  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = "block text-sm font-medium text-primary/70 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ── Basic Info ── */}
      <section>
        <h2 className="text-lg font-semibold text-primary">Basic Info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "Charming 3BR in Franklin"'
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full property description…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="299000"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as ListingFormData["status"])
              }
              className={inputClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>MLS Number</label>
            <input
              type="text"
              value={mlsNumber}
              onChange={(e) => setMlsNumber(e.target.value)}
              placeholder="e.g. 2512345"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Property Type</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={inputClass}
            >
              {PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section>
        <h2 className="text-lg font-semibold text-primary">Location</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Display Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nashville, TN"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Nashville"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="TN"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ZIP Code</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="37064"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Property Details ── */}
      <section>
        <h2 className="text-lg font-semibold text-primary">Property Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>
              Beds <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              placeholder="3"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Baths <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              step={0.5}
              value={baths}
              onChange={(e) => setBaths(e.target.value)}
              placeholder="2"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Sq Ft <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              placeholder="1800"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Year Built</label>
            <input
              type="number"
              min={1800}
              max={2030}
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
              placeholder="2005"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section>
        <h2 className="text-lg font-semibold text-primary">Features</h2>
        <p className="mt-1 text-sm text-primary/50">
          Type a feature and press Enter to add it.
        </p>
        <div className="mt-3">
          <FeatureTagInput features={features} onChange={setFeatures} />
        </div>
      </section>

      {/* ── Images ── */}
      <section>
        <h2 className="text-lg font-semibold text-primary">
          Photos <span className="text-red-500">*</span>
        </h2>
        <p className="mt-1 text-sm text-primary/50">
          Upload property photos. Drag &amp; drop or click to browse.
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
            dragging
              ? "border-accent bg-accent/5"
              : "border-gray-200 hover:border-accent/50"
          }`}
        >
          <Upload size={28} className="text-primary/30" />
          <p className="mt-2 text-sm text-primary/50">
            Drop images here, or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
              }
              // Reset so the same file can be re-selected
              e.target.value = "";
            }}
          />
        </div>

        {/* Image previews */}
        {(existingImages.length > 0 || newFiles.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {/* Existing images (already in Convex storage) */}
            {existingImages.map((id, index) => (
              <StorageImagePreview
                key={id}
                storageId={id}
                onRemove={() =>
                  setExistingImages((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              />
            ))}
            {/* Newly selected files (local previews) */}
            {newFiles.map((file, index) => (
              <ImagePreview
                key={`new-${index}`}
                src={URL.createObjectURL(file)}
                onRemove={() =>
                  setNewFiles((prev) => prev.filter((_, i) => i !== index))
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Error & Submit ── */}
      {error && (
        <p className="text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

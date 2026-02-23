"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";

// ─── STATUS BADGE ───

const STATUS_STYLES: Record<string, string> = {
  "for-sale": "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  sold: "bg-blue-100 text-blue-700",
  hidden: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  "for-sale": "For Sale",
  pending: "Pending",
  sold: "Sold",
  hidden: "Hidden",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── DELETE CONFIRMATION MODAL ───

function DeleteModal({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-primary">Delete Listing</h3>
        <p className="mt-2 text-sm text-primary/60">
          Are you sure you want to delete <strong>{title}</strong>? This action
          cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LISTINGS PAGE ───

export default function AdminListings() {
  const listings = useQuery(api.listings.getAll);
  const removeListing = useMutation(api.listings.remove);

  const [deleting, setDeleting] = useState<{
    id: Id<"listings">;
    title: string;
  } | null>(null);

  async function handleDelete() {
    if (!deleting) return;
    await removeListing({ id: deleting.id });
    setDeleting(null);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-primary">Listings</h1>
          <p className="mt-1 text-primary/60">
            Manage all property listings.
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <Plus size={16} />
          Add Listing
        </Link>
      </div>

      {/* Table */}
      <div className="mt-8 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-primary/50">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Location</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Added</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings === undefined ? (
              // Loading skeleton — 4 placeholder rows
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    </td>
                  ))}
                </tr>
              ))
            ) : listings.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-primary/40"
                >
                  No listings yet. Click &ldquo;Add Listing&rdquo; to create
                  your first one.
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr
                  key={listing._id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-6 py-4 font-medium text-primary">
                    {listing.title}
                  </td>
                  <td className="px-6 py-4 text-primary/70">
                    {listing.location}
                  </td>
                  <td className="px-6 py-4 text-primary/70">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={listing.status} />
                  </td>
                  <td className="px-6 py-4 text-primary/50">
                    {new Date(listing._creationTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/listings/${listing._id}/edit`}
                        className="rounded-lg p-2 text-primary/40 transition-colors hover:bg-secondary hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() =>
                          setDeleting({
                            id: listing._id,
                            title: listing.title,
                          })
                        }
                        className="rounded-lg p-2 text-primary/40 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {deleting && (
        <DeleteModal
          title={deleting.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

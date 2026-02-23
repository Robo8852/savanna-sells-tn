"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ListingForm from "@/components/admin/ListingForm";
import type { ListingFormData } from "@/components/admin/ListingForm";

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const listing = useQuery(api.listings.getById, {
    id: id as Id<"listings">,
  });
  const updateListing = useMutation(api.listings.update);
  const router = useRouter();

  async function handleSubmit(data: ListingFormData) {
    await updateListing({
      id: id as Id<"listings">,
      ...data,
    });
    router.push("/admin/listings");
  }

  // Loading state
  if (listing === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary/30" />
      </div>
    );
  }

  // Not found
  if (listing === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-primary/50">Listing not found.</p>
        <Link
          href="/admin/listings"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Listings
        </Link>
      </div>
    );
  }

  // Convert the Convex document to our form data shape
  const initialData: ListingFormData = {
    title: listing.title,
    description: listing.description,
    price: listing.price,
    location: listing.location,
    city: listing.city,
    state: listing.state,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    status: listing.status,
    images: listing.images,
    ...(listing.address && { address: listing.address }),
    ...(listing.zip && { zip: listing.zip }),
    ...(listing.propertyType && { propertyType: listing.propertyType }),
    ...(listing.yearBuilt && { yearBuilt: listing.yearBuilt }),
    ...(listing.features && { features: listing.features }),
    ...(listing.mlsNumber && { mlsNumber: listing.mlsNumber }),
  };

  return (
    <div>
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1.5 text-sm text-primary/50 transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Listings
      </Link>

      <h1 className="mt-4 text-3xl font-serif text-primary">Edit Listing</h1>
      <p className="mt-1 text-primary/60">
        Update &ldquo;{listing.title}&rdquo;.
      </p>

      <div className="mt-8 max-w-3xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <ListingForm
          initialData={initialData}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}

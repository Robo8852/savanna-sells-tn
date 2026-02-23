"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ListingForm from "@/components/admin/ListingForm";
import type { ListingFormData } from "@/components/admin/ListingForm";

export default function NewListingPage() {
  const createListing = useMutation(api.listings.create);
  const router = useRouter();

  async function handleSubmit(data: ListingFormData) {
    await createListing(data);
    router.push("/admin/listings");
  }

  return (
    <div>
      <Link
        href="/admin/listings"
        className="inline-flex items-center gap-1.5 text-sm text-primary/50 transition-colors hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Listings
      </Link>

      <h1 className="mt-4 text-3xl font-serif text-primary">Add Listing</h1>
      <p className="mt-1 text-primary/60">
        Create a new property listing.
      </p>

      <div className="mt-8 max-w-3xl rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <ListingForm onSubmit={handleSubmit} submitLabel="Create Listing" />
      </div>
    </div>
  );
}

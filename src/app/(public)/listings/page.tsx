"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ListingCard from "@/components/ui/ListingCard";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ListingsPage() {
  const listings = useQuery(api.listings.getActive);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6 md:px-12">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mt-6 mb-16">
          <span className="mb-4 block text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Browse Properties
          </span>
          <h1 className="text-4xl font-serif text-primary md:text-5xl">
            All Listings
          </h1>
        </div>

        {/* Loading */}
        {listings === undefined && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary/30" />
          </div>
        )}

        {/* Empty state */}
        {listings && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg text-primary/60">
              No listings available right now.
            </p>
            <p className="mt-2 text-sm text-primary/40">
              Check back soon for new properties.
            </p>
          </div>
        )}

        {/* Listings grid */}
        {listings && listings.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => (
              <ListingCard key={listing._id} listing={listing} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ListingCard from "@/components/ui/ListingCard";
import Link from "next/link";

function ListingsSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse bg-white shadow-sm">
          <div className="h-64 bg-gray-200" />
          <div className="p-6 space-y-4">
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-6 w-2/3 rounded bg-gray-200" />
            <div className="h-12 rounded bg-gray-100" />
            <div className="flex justify-between">
              <div className="h-6 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-lg text-primary/60">No listings available right now.</p>
      <p className="mt-2 text-sm text-primary/40">Check back soon for new properties.</p>
    </div>
  );
}

export default function ListingsGrid() {
  const listings = useQuery(api.listings.getActive);

  return (
    <section id="listings" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="mb-4 block text-sm font-medium uppercase tracking-[0.2em] text-accent">
              Exclusive Inventory
            </span>
            <h2 className="text-4xl font-serif text-primary md:text-5xl">Featured Listings</h2>
          </div>
          <Link href="/listings" className="border-b border-primary pb-1 font-medium text-primary transition-all hover:text-accent hover:border-accent">
            View All Properties
          </Link>
        </div>

        {listings === undefined ? (
          <ListingsSkeleton />
        ) : listings.length === 0 ? (
          <EmptyState />
        ) : (
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

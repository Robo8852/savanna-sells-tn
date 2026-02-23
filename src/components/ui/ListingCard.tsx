"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";
import { useStorageUrl } from "@/hooks/useStorageUrl";
import { formatPrice } from "@/lib/format";

/** Map listing status to a display label. */
const STATUS_LABELS: Record<string, string> = {
  "for-sale": "For Sale",
  pending: "Pending",
  sold: "Sold",
};

interface ListingCardProps {
  listing: Doc<"listings">;
  index: number;
}

export default function ListingCard({ listing, index }: ListingCardProps) {
  // Resolve the first image storage ID to a displayable URL
  const imageUrl = useStorageUrl(listing.images[0]);

  return (
    <Link href={`/listings/${listing._id}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer bg-white shadow-sm transition-all hover:shadow-xl"
    >
      <div className="relative h-64 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
        <div className="absolute left-4 top-4 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          {STATUS_LABELS[listing.status] ?? listing.status}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-center gap-1 text-sm text-primary/60">
          <MapPin size={14} className="text-accent" />
          {listing.location}
        </div>
        <h3 className="mb-4 text-2xl font-serif text-primary">{listing.title}</h3>
        <div className="mb-6 grid grid-cols-3 border-y border-gray-100 py-4">
          <div className="flex flex-col items-center border-r border-gray-100">
            <span className="flex items-center gap-1 text-sm font-medium">
              <Bed size={16} className="text-accent" /> {listing.beds}
            </span>
            <span className="text-[10px] uppercase tracking-tighter text-gray-400">Beds</span>
          </div>
          <div className="flex flex-col items-center border-r border-gray-100">
            <span className="flex items-center gap-1 text-sm font-medium">
              <Bath size={16} className="text-accent" /> {listing.baths}
            </span>
            <span className="text-[10px] uppercase tracking-tighter text-gray-400">Baths</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="flex items-center gap-1 text-sm font-medium">
              <Square size={16} className="text-accent" /> {listing.sqft.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase tracking-tighter text-gray-400">Sqft</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-primary">{formatPrice(listing.price)}</span>
          <button className="text-sm font-semibold uppercase tracking-wider text-accent group-hover:underline">
            Details
          </button>
        </div>
      </div>
    </motion.div>
    </Link>
  );
}

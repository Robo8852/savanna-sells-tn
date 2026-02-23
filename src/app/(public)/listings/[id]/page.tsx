"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Bed,
  Bath,
  Square,
  MapPin,
  Calendar,
  Home,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useStorageUrl } from "@/hooks/useStorageUrl";
import { formatPrice } from "@/lib/format";

// ─── STATUS LABELS ───

const STATUS_LABELS: Record<string, string> = {
  "for-sale": "For Sale",
  pending: "Pending",
  sold: "Sold",
};

// ─── IMAGE GALLERY ───
// Shows all listing photos with crossfade transitions,
// prev/next arrows, dot indicators, and mobile swipe.

function GalleryImage({
  storageId,
  alt,
}: {
  storageId: Id<"_storage">;
  alt: string;
}) {
  const url = useStorageUrl(storageId);

  if (!url) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <Loader2 size={28} className="animate-spin text-primary/30" />
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover"
        priority
      />
    </motion.div>
  );
}

function ImageGallery({
  images,
  title,
}: {
  images: Id<"_storage">[];
  title: string;
}) {
  const [current, setCurrent] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // Hide swipe hint after 3 seconds or on first swipe
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  function prev() {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  }

  function next() {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  }

  // Swipe threshold in pixels — drag further than this to change image
  const SWIPE_THRESHOLD = 50;

  function handleDragEnd(
    _: unknown,
    info: { offset: { x: number } }
  ) {
    setShowHint(false);
    if (info.offset.x < -SWIPE_THRESHOLD) {
      next();
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      prev();
    }
  }

  return (
    <motion.div
      className="relative h-[400px] w-full overflow-hidden bg-gray-100 sm:h-[500px] lg:h-[550px] cursor-grab active:cursor-grabbing"
      drag={images.length > 1 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
    >
      <AnimatePresence mode="wait">
        <GalleryImage
          key={images[current]}
          storageId={images[current]}
          alt={`${title} — photo ${current + 1}`}
        />
      </AnimatePresence>

      {/* Navigation arrows (only if multiple images) */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white"
          >
            <ChevronLeft size={20} className="text-primary" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white"
          >
            <ChevronRight size={20} className="text-primary" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image counter */}
      <div className="absolute right-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
        {current + 1} / {images.length}
      </div>

      {/* Swipe hint */}
      <AnimatePresence>
        {showHint && images.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-x-0 bottom-14 z-10 flex justify-center pointer-events-none"
          >
            <span className="rounded-full bg-black/50 px-4 py-1.5 text-sm font-medium text-white">
              Swipe for more photos
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── DETAIL PAGE ───

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const listing = useQuery(api.listings.getById, {
    id: id as Id<"listings">,
  });

  // Loading state
  if (listing === undefined) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-primary/30" />
      </div>
    );
  }

  // Not found
  if (listing === null) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-serif text-primary">Listing Not Found</h2>
        <p className="mt-2 text-primary/50">
          This property may have been removed or is no longer available.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Image Gallery */}
      <ImageGallery images={listing.images} title={listing.title} />

      {/* Content */}
      <div className="container mx-auto px-6 py-12 md:px-12">
        {/* Back link */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-sm text-primary/50 transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Listings
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-3">
          {/* Left column — main info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            {/* Status badge */}
            <span className="inline-block bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              {STATUS_LABELS[listing.status] ?? listing.status}
            </span>

            {/* Title + location */}
            <h1 className="mt-4 text-3xl font-serif text-primary md:text-4xl">
              {listing.title}
            </h1>
            <div className="mt-2 flex items-center gap-1 text-primary/60">
              <MapPin size={16} className="text-accent" />
              {listing.address ? `${listing.address}, ` : ""}
              {listing.location}
              {listing.zip ? ` ${listing.zip}` : ""}
            </div>

            {/* Price */}
            <p className="mt-4 text-3xl font-bold text-primary">
              {formatPrice(listing.price)}
            </p>

            {/* Stats bar */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-gray-100 py-6 sm:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2.5">
                  <Bed size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{listing.beds}</p>
                  <p className="text-xs text-primary/50">Bedrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2.5">
                  <Bath size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">{listing.baths}</p>
                  <p className="text-xs text-primary/50">Bathrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2.5">
                  <Square size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    {listing.sqft.toLocaleString()}
                  </p>
                  <p className="text-xs text-primary/50">Sq Ft</p>
                </div>
              </div>
              {listing.yearBuilt && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2.5">
                    <Calendar size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-primary">
                      {listing.yearBuilt}
                    </p>
                    <p className="text-xs text-primary/50">Year Built</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-serif text-primary">About This Property</h2>
              <p className="mt-4 leading-relaxed text-primary/70">
                {listing.description}
              </p>
            </div>

            {/* Property details */}
            {(listing.propertyType || listing.mlsNumber) && (
              <div className="mt-8">
                <h2 className="text-xl font-serif text-primary">Property Details</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {listing.propertyType && (
                    <div className="flex items-center gap-2 text-sm">
                      <Home size={16} className="text-accent" />
                      <span className="text-primary/50">Type:</span>
                      <span className="font-medium capitalize text-primary">
                        {listing.propertyType}
                      </span>
                    </div>
                  )}
                  {listing.mlsNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-primary/50">MLS #:</span>
                      <span className="font-medium text-primary">
                        {listing.mlsNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-serif text-primary">Features</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {listing.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right column — contact card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="sticky top-8 rounded-xl bg-white p-6 shadow-md">
              <h3 className="text-lg font-serif text-primary">
                Interested in this property?
              </h3>
              <p className="mt-2 text-sm text-primary/60">
                Get in touch with Savanna to schedule a showing or ask questions
                about this listing.
              </p>
              <button className="mt-6 w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent/90">
                Schedule a Showing
              </button>
              <button className="mt-3 w-full rounded-lg border border-primary/20 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary">
                Call (123) 456-7890
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

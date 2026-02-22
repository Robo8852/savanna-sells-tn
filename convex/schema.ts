// Convex schema — defines the database tables for Savanna Sells TN
// Docs: https://docs.convex.dev/database/schemas
// Every Convex schema file starts with these two imports (boilerplate).
// defineSchema/defineTable create tables. v is the validator (type enforcer).
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // ─── LISTINGS TABLE ───
  // Each row is a property listing on Savanna's website.
  // Fields marked v.optional() can be left blank.
  // Fields without optional are required — Convex will reject data without them.
  listings: defineTable({
    title: v.string(),                              // Headline, e.g. "Charming 3BR in Nashville"
    description: v.string(),                        // Full property description
    price: v.number(),                              // Raw number like 299000 (formatted as $299,000 in the UI)
    location: v.string(),                           // Display text like "Nashville, TN"
    address: v.optional(v.string()),                // Street address — optional, some listings keep this private
    city: v.string(),                               // City name — required for search index
    state: v.string(),                              // State abbreviation like "TN"
    zip: v.optional(v.string()),                    // Zip code — not always needed upfront
    beds: v.number(),                               // Bedroom count
    baths: v.number(),                              // Bathroom count
    sqft: v.number(),                               // Square footage
    propertyType: v.optional(v.string()),           // e.g. "single-family", "condo", "townhouse"
    yearBuilt: v.optional(v.number()),              // e.g. 2005
    features: v.optional(v.array(v.string())),      // List of features like ["pool", "garage", "hardwood floors"]
    images: v.array(v.id("_storage")),              // List of references to uploaded photos in Convex storage
                                                    // (like coat check tickets — IDs that point to the actual files)
    status: v.union(                                // Must be exactly one of these 4 values:
      v.literal("for-sale"),                        //   actively listed
      v.literal("pending"),                         //   offer accepted, not yet closed
      v.literal("sold"),                            //   deal closed
      v.literal("hidden")                           //   not visible on site (draft or archived)
    ),
    mlsNumber: v.optional(v.string()),              // Unique key for RealTracs upsert (Phase 2)
    source: v.optional(v.string()),                 // "manual" | "csv" | "realtracks"
  })
    // Indexes = fast lookups (like a table of contents in a book)
    // Instead of scanning every row, the database jumps straight to matching entries
    .index("by_status", ["status"])                 // Fast lookup: "give me all for-sale listings"
    .index("by_city", ["city"]),                    // Fast lookup: "give me all Nashville listings"

  // ─── LEADS TABLE ───
  // Each row is a person who filled out a contact/inquiry form.
  // Savanna uses this to track potential clients.
  leads: defineTable({
    name: v.string(),                               // Person's full name
    email: v.string(),                              // Contact email
    phone: v.optional(v.string()),                  // Phone number — not required
    preferredDate: v.optional(v.string()),           // When they want to see the property
    preferredTime: v.optional(v.string()),           // What time works for them
    message: v.optional(v.string()),                // Any additional notes
    listingId: v.optional(v.id("listings")),        // Links to a specific listing (reference to listings table)
    listingTitle: v.optional(v.string()),            // Which property they asked about (stored as text too)
    status: v.union(                                // Tracks where Savanna is with this lead:
      v.literal("new"),                             //   just submitted, not yet reviewed
      v.literal("contacted"),                       //   Savanna reached out
      v.literal("scheduled"),                       //   showing or meeting booked
      v.literal("closed")                           //   done — converted or declined
    ),
  })
    .index("by_status", ["status"]),                // Fast lookup: "show me all new leads"
});

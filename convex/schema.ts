// ============================================================================
// SCHEMA — The blueprint for the database
// ============================================================================
//
// Think of this file like a spreadsheet template. It defines what columns
// (called "fields") each table has, and what type of data each column accepts.
//
// If someone tries to save data that doesn't match this blueprint, Convex
// will reject it automatically — like a form that won't submit if you put
// letters in the phone number field.
//
// Docs: https://docs.convex.dev/database/schemas
// ============================================================================

// These two lines pull in tools from Convex that let us define tables.
// defineSchema = creates the overall database structure
// defineTable  = creates one table inside that structure
// v            = short for "validator" — it checks that data is the right type
//                (v.string() means "must be text", v.number() means "must be a number")
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // ─── LISTINGS TABLE ───
  // Each row in this table represents one property listing on Savanna's website.
  //
  // v.optional() means the field can be left blank when creating a listing.
  // Fields WITHOUT optional are required — the database won't accept the
  // listing if those are missing.
  listings: defineTable({
    title: v.string(),                              // Headline shown on the card, e.g. "Charming 3BR in Nashville"
    description: v.string(),                        // Full property description paragraph
    price: v.number(),                              // Price as a plain number like 299000 (the website formats it as $299,000)
    location: v.string(),                           // Display text like "Nashville, TN" — shown on the listing card
    address: v.optional(v.string()),                // Street address — optional because some sellers keep this private
    city: v.string(),                               // City name, e.g. "Franklin" — required so we can search by city
    state: v.string(),                              // State abbreviation like "TN"
    zip: v.optional(v.string()),                    // Zip code — not always needed right away
    beds: v.number(),                               // Number of bedrooms
    baths: v.number(),                              // Number of bathrooms
    sqft: v.number(),                               // Square footage of the property
    propertyType: v.optional(v.string()),           // What kind of property: "single-family", "condo", "townhouse", etc.
    yearBuilt: v.optional(v.number()),              // The year the home was built, e.g. 2005
    features: v.optional(v.array(v.string())),      // A list of feature tags like ["pool", "garage", "hardwood floors"]
                                                    // v.array(v.string()) = a list where every item must be text
    images: v.array(v.id("_storage")),              // A list of photo references stored in Convex's file storage.
                                                    // Each item is an ID (like a coat-check ticket number) that
                                                    // points to an actual image file. We trade in the ticket
                                                    // for a viewable URL when we need to show the photo.
    status: v.union(                                // The listing's current status — must be EXACTLY one of these 4:
      v.literal("for-sale"),                        //   Actively listed on the market
      v.literal("pending"),                         //   An offer was accepted but the deal hasn't closed yet
      v.literal("sold"),                            //   The deal is done
      v.literal("hidden")                           //   Not visible on the public site (used for drafts or archived listings)
    ),
    // v.union() = "pick one from this list" — like a dropdown menu.
    // v.literal() = one specific exact value — not just any text, but THIS exact word.

    mlsNumber: v.optional(v.string()),              // MLS = Multiple Listing Service (the industry database for properties).
                                                    // This number uniquely identifies a listing in that system.
                                                    // We'll use it in Phase 2 to sync data from RealTracs (the local MLS provider).
    source: v.optional(v.string()),                 // Tracks HOW this listing got into our database:
                                                    //   "manual"     = someone typed it into the admin panel
                                                    //   "csv"        = imported from a spreadsheet file
                                                    //   "realtracks" = pulled automatically from the MLS system
  })
    // INDEXES — think of these like the index in the back of a textbook.
    // Instead of flipping through every page to find what you want,
    // you look up the topic in the index and jump straight to the right page.
    // Without indexes, the database would have to check every single listing
    // to answer a question like "show me all for-sale properties."
    .index("by_status", ["status"])                 // Lets us quickly find all listings with a given status
    .index("by_city", ["city"]),                    // Lets us quickly find all listings in a given city

  // ─── LEADS TABLE ───
  // A "lead" is a person who filled out a contact form or inquiry on the site.
  // Savanna uses this table to keep track of potential clients and where
  // she is in the process of following up with them.
  leads: defineTable({
    name: v.string(),                               // The person's full name
    email: v.string(),                              // Their email address
    phone: v.optional(v.string()),                  // Phone number — not required to submit the form
    preferredDate: v.optional(v.string()),           // What date they'd like to see the property
    preferredTime: v.optional(v.string()),           // What time works best for them
    message: v.optional(v.string()),                // Any extra notes or questions they typed in
    listingId: v.optional(v.id("listings")),        // If they asked about a specific property, this links to that
                                                    // listing's row in the listings table. v.id("listings") means
                                                    // "this must be a real ID from the listings table."
    listingTitle: v.optional(v.string()),            // The name of the property they asked about (saved as text
                                                    // so we can display it even if the listing gets deleted later)
    status: v.union(                                // Where Savanna is in the follow-up process:
      v.literal("new"),                             //   Just submitted — Savanna hasn't seen it yet
      v.literal("contacted"),                       //   Savanna reached out to this person
      v.literal("scheduled"),                       //   A showing or meeting has been booked
      v.literal("closed")                           //   Done — either became a client or didn't work out
    ),
  })
    .index("by_status", ["status"]),                // Lets us quickly pull all leads with a given status
                                                    // (e.g. "show me all new leads I haven't responded to")
});

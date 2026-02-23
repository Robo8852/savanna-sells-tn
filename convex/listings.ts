// ============================================================================
// LISTINGS — Database functions for property listings
// ============================================================================
//
// This file contains all the functions that read or write listing data.
// The admin panel uses these to create/edit/delete listings, and the
// public website uses them to display properties to visitors.
//
// KEY TERMS:
//   query    = A function that READS data. It's "real-time," meaning the
//              website automatically updates when the data changes — no
//              page refresh needed. (Convex handles this behind the scenes.)
//   mutation = A function that WRITES data (creates, updates, or deletes).
//   ctx      = Short for "context" — Convex passes this into every function.
//              It's your access pass to the database. ctx.db = the database.
//   args     = The inputs the function expects. Like a form — you fill in
//              the required fields, and the function uses them.
//   handler  = The actual work the function does when called.
//   async/await = Tells JavaScript "this takes a moment, wait for it to
//              finish before moving on." Database lookups aren't instant,
//              so we wait for the answer before continuing.
// ============================================================================

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── QUERIES (reading data) ───

// GET ACTIVE LISTINGS
// Grabs all listings that should be visible on the public website.
// That means "for-sale" and "pending" — but NOT "sold" or "hidden."
// The homepage and the /listings page both use this.
//
// How it works:
//   1. Pull every listing from the database, newest first
//   2. Filter out anything that isn't "for-sale" or "pending"
//   3. Return what's left
export const getActive = query({
  args: {},                                         // No inputs needed — just give us all active listings
  handler: async (ctx) => {
    const listings = await ctx.db.query("listings").order("desc").collect();
    //   .query("listings")  = "look in the listings table"
    //   .order("desc")      = "sort newest first" (desc = descending = biggest/newest at top)
    //   .collect()           = "gather all matching rows into a list"
    return listings.filter(
      (listing) => listing.status === "for-sale" || listing.status === "pending"
    );
    //   .filter()            = "go through the list and keep only the ones that pass this test"
  },
});

// GET LISTING BY ID
// Looks up one specific listing using its unique ID (every row in the
// database gets an auto-generated ID, like a receipt number).
// Used when someone clicks on a listing to see its full detail page,
// or when the admin opens the edit form for a specific property.
export const getById = query({
  args: { id: v.id("listings") },                   // Requires a valid listing ID
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);               // .get() = "find the one row with this exact ID"
  },
});

// GET LISTINGS BY STATUS
// Returns all listings that have a specific status (e.g. all "sold" listings).
// Uses the "by_status" index we set up in schema.ts so the database can
// jump straight to matching rows instead of scanning through every listing.
// The admin panel uses this when filtering the listings table.
export const getByStatus = query({
  args: {
    status: v.union(                                // The caller must pass one of these exact values:
      v.literal("for-sale"),
      v.literal("pending"),
      v.literal("sold"),
      v.literal("hidden")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("listings")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      //   .withIndex()  = "use the index (the shortcut) instead of checking every row"
      //   q.eq()        = "where status equals the value we were given"
      .order("desc")
      .collect();
  },
});

// GET ALL LISTINGS
// Returns every listing in the database, regardless of status (newest first).
// Only the admin panel uses this — Savanna needs to see everything,
// including hidden and sold properties.
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("listings").order("desc").collect();
  },
});

// ─── MUTATIONS (writing data) ───

// CREATE A NEW LISTING
// Adds a brand new property listing to the database.
// Called when Savanna fills out the "Add New Listing" form in the admin panel.
//
// Notice that "source" is NOT in the args — we always set it to "manual"
// automatically, because if someone is typing it into the admin form,
// it's a manual entry (as opposed to an import from a spreadsheet or MLS).
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    location: v.string(),
    city: v.string(),
    state: v.string(),
    beds: v.number(),
    baths: v.number(),
    sqft: v.number(),
    images: v.array(v.id("_storage")),              // List of uploaded photo IDs (see files.ts for how uploads work)
    status: v.union(
      v.literal("for-sale"),
      v.literal("pending"),
      v.literal("sold"),
      v.literal("hidden")
    ),
    address: v.optional(v.string()),
    zip: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    mlsNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("listings", {
      //   .insert() = "add a new row to this table"
      ...args,                                      // ...args = "take everything the caller sent us and spread it out here"
      source: "manual",                             // Always tag admin-created listings as "manual"
    });
  },
});

// UPDATE AN EXISTING LISTING
// Changes specific fields on a listing that already exists.
// The key thing: it only updates fields you actually send it.
// So if you just want to change the price, you send { id, price: 350000 }
// and everything else (title, images, etc.) stays untouched.
//
// IMPORTANT — Source override:
// If this listing was originally imported from a spreadsheet (CSV) or
// pulled from the MLS system (RealTracs), and Savanna manually edits it,
// we change the source to "manual." Why? Because in the future, when we
// build automatic MLS syncing, we don't want the sync to overwrite
// changes Savanna made by hand. Marking it "manual" tells the sync:
// "hands off, a human edited this one."
//
// Used by: the admin "Edit Listing" form.
export const update = mutation({
  args: {
    id: v.id("listings"),                           // Which listing to update (required)
    // Everything else is optional — only send what you want to change:
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    location: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    sqft: v.optional(v.number()),
    images: v.optional(v.array(v.id("_storage"))),
    status: v.optional(
      v.union(
        v.literal("for-sale"),
        v.literal("pending"),
        v.literal("sold"),
        v.literal("hidden")
      )
    ),
    address: v.optional(v.string()),
    zip: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    yearBuilt: v.optional(v.number()),
    features: v.optional(v.array(v.string())),
    mlsNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Pull the ID out separately; everything else goes into "fields."
    // This is called "destructuring" — it's like unpacking a box and
    // setting the label (id) aside while keeping the contents (fields).
    const { id, ...fields } = args;

    // First, make sure the listing actually exists.
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Listing not found");

    // Build a clean object with ONLY the fields that were actually sent.
    // If a field is "undefined" (wasn't included), we skip it so we
    // don't accidentally erase existing data.
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    // Source override — if this listing came from an import, mark it as
    // manually edited now (see the big comment above for why).
    if (
      existing.source === "csv" ||
      existing.source === "realtracks"
    ) {
      updates.source = "manual";
    }

    // .patch() = "merge these changes into the existing row."
    // It only changes the fields we pass in — everything else stays the same.
    // Think of it like editing a Google Doc: you change a paragraph,
    // but the rest of the document doesn't get touched.
    await ctx.db.patch(id, updates);
  },
});

// DELETE A LISTING
// Permanently removes a listing from the database. Gone for good.
// The admin panel shows a confirmation popup before calling this,
// so Savanna can't accidentally delete something.
export const remove = mutation({
  args: { id: v.id("listings") },                   // Which listing to delete
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

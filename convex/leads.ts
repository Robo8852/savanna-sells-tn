// ============================================================================
// LEADS — Database functions for contact form submissions
// ============================================================================
//
// A "lead" is a person who filled out a contact form on the website —
// they want to schedule a showing, ask about a property, or get in touch
// with Savanna. This file handles saving those submissions and letting
// Savanna update their status as she follows up.
//
// LEAD LIFECYCLE (the journey of every lead):
//   "new"        → Just submitted. Savanna hasn't seen it yet.
//   "contacted"  → Savanna reached out (called, emailed, texted).
//   "scheduled"  → A showing or meeting has been booked.
//   "closed"     → Done. Either became a client or didn't work out.
//
// KEY TERMS:
//   query    = Reads data. Real-time — the page updates automatically.
//   mutation = Writes data (create or update).
//   ctx.db   = The database connection.
//   args     = The inputs the function needs to do its job.
// ============================================================================

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── QUERIES (reading data) ───

// GET ALL LEADS
// Returns every lead in the database, newest first.
// Used by the admin dashboard (to show recent leads) and
// the admin leads table (to show the full list).
export const getAll = query({
  args: {},                                         // No inputs needed — just give us everything
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
    //   .order("desc") = newest first (descending order)
    //   .collect()      = gather all rows into a list and return them
  },
});

// GET LEADS BY STATUS
// Returns only leads with a specific status, like "show me all new leads."
// Uses the "by_status" index (set up in schema.ts) so the database can
// jump straight to matching rows instead of checking every single lead.
// Used by the admin leads page when Savanna filters by status.
export const getByStatus = query({
  args: {
    status: v.union(                                // Must be one of these exact values:
      v.literal("new"),
      v.literal("contacted"),
      v.literal("scheduled"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      //   .withIndex() = use the shortcut instead of scanning every row
      //   q.eq()       = "where status equals whatever was passed in"
      .order("desc")
      .collect();
  },
});

// ─── MUTATIONS (writing data) ───

// SUBMIT A NEW LEAD
// Called when someone fills out the contact form on the public website.
// Saves their info to the database and automatically sets their status
// to "new" so it shows up as unread in Savanna's admin panel.
//
// listingId and listingTitle are optional because:
//   - If someone fills out the general "Contact Me" form, there's no
//     specific property attached.
//   - If someone clicks "Schedule a Showing" on a listing page, we
//     include which property they're asking about.
export const submit = mutation({
  args: {
    name: v.string(),                               // Their full name
    email: v.string(),                              // Their email address
    phone: v.optional(v.string()),                  // Phone number (not required)
    preferredDate: v.optional(v.string()),           // When they want to see the property
    preferredTime: v.optional(v.string()),           // What time works for them
    message: v.optional(v.string()),                // Any extra notes they typed in
    listingId: v.optional(v.id("listings")),        // Links to a specific listing (if they came from one)
    listingTitle: v.optional(v.string()),            // The listing name as text (so we can show it even if the listing gets deleted)
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      ...args,                                      // Save everything the form sent us
      status: "new",                                // Every new submission starts as "new"
    });
  },
});

// UPDATE A LEAD'S STATUS
// Savanna uses this to move a lead through the follow-up process:
//   new → contacted → scheduled → closed
//
// This only changes the status field — nothing else about the lead
// (name, email, message, etc.) gets touched.
// Used by the status dropdown in the admin leads table.
export const updateStatus = mutation({
  args: {
    id: v.id("leads"),                              // Which lead to update
    status: v.union(                                // What to change the status to:
      v.literal("new"),
      v.literal("contacted"),
      v.literal("scheduled"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    // .patch() = "update just this one field on this one row"
    // Everything else about the lead stays exactly the same.
    await ctx.db.patch(args.id, { status: args.status });
  },
});

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── QUERIES ───

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const listings = await ctx.db.query("listings").order("desc").collect();
    return listings.filter(
      (listing) => listing.status === "for-sale" || listing.status === "pending"
    );
  },
});

export const getById = query({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
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
      .order("desc")
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("listings").order("desc").collect();
  },
});

// ─── MUTATIONS ───

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
    images: v.array(v.id("_storage")),
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
      ...args,
      source: "manual",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("listings"),
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
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Listing not found");

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    if (
      existing.source === "csv" ||
      existing.source === "realtracks"
    ) {
      updates.source = "manual";
    }

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

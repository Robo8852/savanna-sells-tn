import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ─── QUERIES ───

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
  },
});

export const getByStatus = query({
  args: {
    status: v.union(
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
      .order("desc")
      .collect();
  },
});

// ─── MUTATIONS ───

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    preferredDate: v.optional(v.string()),
    preferredTime: v.optional(v.string()),
    message: v.optional(v.string()),
    listingId: v.optional(v.id("listings")),
    listingTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      ...args,
      status: "new",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("scheduled"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

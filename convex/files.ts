// ============================================================================
// FILES — Handles uploading and displaying images
// ============================================================================
//
// This file manages the image upload system for listing photos.
// Convex stores files separately from regular data (like how a library
// keeps books on shelves but tracks them in a catalog). This file is
// the bridge between the two.
//
// HOW IMAGE UPLOADS WORK (2-step process):
//
//   Step 1: The website asks Convex "give me a place to upload a file."
//           Convex responds with a temporary upload URL — like getting
//           a locker number at the gym. This URL expires in a few minutes.
//
//   Step 2: The website sends the actual image file to that URL.
//           Convex stores the file and gives back a "storage ID" — a
//           unique ticket number for that file. We save this ID in the
//           listing's images list.
//
// HOW IMAGE DISPLAY WORKS:
//   When we want to show a photo on the website, we trade in the
//   storage ID (the ticket) for a real URL that a browser can load.
//   That's what getImageUrl does.
//
// KEY TERMS:
//   mutation   = A function that writes data (upload URLs count as writing
//                because they create a storage slot).
//   query      = A function that reads data (looking up the image URL).
//   ctx.storage = Convex's built-in file storage system.
// ============================================================================

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// GENERATE AN UPLOAD URL
// Creates a temporary URL where the browser can send an image file.
// This URL is short-lived (expires in a few minutes) and is meant to
// be used immediately — the admin form calls this right when someone
// picks a file to upload.
//
// Used by: the image upload section in the admin's "Add/Edit Listing" form.
export const generateUploadUrl = mutation({
  args: {},                                         // No inputs needed — just generate a fresh URL
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// GET AN IMAGE'S DISPLAY URL
// Takes a storage ID (the ticket number we saved when the image was uploaded)
// and returns a real URL that a browser can put in an <img> tag to show
// the photo. Returns null if the storage ID doesn't match any stored file.
//
// Used by: the listing cards on the homepage, the listing detail page,
// and the useStorageUrl helper that components use to load images.
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },            // The ticket number for the stored file
                                                    // v.id("_storage") = must be a valid file storage ID
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

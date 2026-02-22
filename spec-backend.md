# SPEC-BACKEND-CORE.md
*Backend core: schema update, Convex queries, mutations, and image storage*

---

## Overview

This spec defines the backend foundation for Savanna Sells TN — the Convex server functions that power the public site and the CMS. Everything the frontend will subscribe to and every write operation it will trigger lives here.

This is Phase 1 backend. No auth, no CSV import, no MLS sync. Those come later and plug into what this spec establishes.

---

## Scope

**Included:**
- Schema update (add `mlsNumber` and `source` fields to listings table)
- Listing query functions (public + admin)
- Listing mutation functions (create, update, remove)
- Lead query functions (admin)
- Lead mutation functions (submit, update status)
- Image upload and URL resolution (Convex storage)

**Excluded:**
- Clerk auth (Phase 2 — mutations are open for now)
- CSV import pipeline (separate spec: SPEC-CSV-IMPORT.md)
- RealTracs MLS sync (Phase 2, not yet specced)
- Frontend components (this spec is backend only)

---

## Domain Context

Savanna is a real estate agent. She has **listings** (properties she is selling) and **leads** (people who want to buy). The CMS lets her manage both.

In Phase 1, Savanna adds listings manually or via CSV import. The public site displays them in real time thanks to Convex reactivity — no polling, no refresh needed.

---

## Data Model

### Schema Update — Do This First

Add two fields to the `listings` table in `convex/schema.ts`:

```typescript
mlsNumber: v.optional(v.string()),   // unique key for RealTracs upsert (Phase 2)
source: v.optional(v.string()),      // "manual" | "csv" | "realtracks"
```

**Why:** `mlsNumber` is the stable unique key that Phase 2's MLS sync will upsert against. Without it, every sync creates duplicates. `source` tracks where the listing came from. Adding both now costs nothing. Not adding them costs a migration later.

### Existing Schema (no changes needed)

**listings table:** title, description, price, location, address, city, state, zip, beds, baths, sqft, propertyType, yearBuilt, features, images, status

**leads table:** name, email, phone, preferredDate, preferredTime, message, listingId, listingTitle, status

---

## Behavior — Listing Queries

All queries are Convex `query` functions. The UI subscribes to them — when data changes, every client watching that query updates automatically.

### `getActive`
- **Purpose:** Public site uses this to show listings visitors can see
- **Returns:** All listings where status is `"for-sale"` OR `"pending"`
- **Why include pending:** In real estate, pending listings stay visible with a "Pending" badge. Removing them confuses buyers who saw them earlier. This is standard industry practice.
- **Sort:** Newest first (by Convex `_creationTime`, descending)
- **No pagination.** A single agent will have 10-50 active listings at most. Returning all is correct here. Pagination would be over-engineering.

### `getById`
- **Purpose:** Listing detail page — show one listing with all its data
- **Args:** `id` (Convex document ID for the listings table)
- **Returns:** The full listing document, or `null` if not found
- **Note:** Does not filter by status. If someone has the URL to a sold listing, they can still see it. This is intentional — sold listings serve as social proof.

### `getByStatus`
- **Purpose:** CMS filtering — let Savanna view listings by status
- **Args:** `status` (one of: `"for-sale"`, `"pending"`, `"sold"`, `"hidden"`)
- **Returns:** All listings matching that status, newest first
- **Uses index:** `by_status`

### `getAll`
- **Purpose:** CMS — show Savanna every listing regardless of status
- **Returns:** All listings, newest first
- **Note:** This is the admin view. It includes hidden and sold listings that the public site does not show.

---

## Behavior — Listing Mutations

All mutations are Convex `mutation` functions. They validate input, write to the database, and Convex reactivity handles pushing updates to all subscribed clients.

**Auth note:** These mutations are open (no identity check) for now. Phase 2 adds Clerk auth, at which point create/update/remove will require admin identity. The mutation signatures will not change — only an auth guard gets added.

### `create`
- **Purpose:** Add a new listing to the database
- **Args:** All required listing fields (title, description, price, location, city, state, beds, baths, sqft, images, status) plus optional fields (address, zip, propertyType, yearBuilt, features, mlsNumber)
- **Sets `source`** to `"manual"` automatically. The caller does not pass this — it is set server-side.
- **Returns:** The new document's ID
- **Validation:** Convex validators handle type checking. No additional validation needed beyond what the schema enforces.

### `update`
- **Purpose:** Edit an existing listing
- **Args:** `id` (document ID) plus any fields to update (all optional except `id`)
- **Behavior:** Patches the document — only updates fields that are passed. Does not overwrite fields that aren't included.
- **If `source` was `"csv"` or `"realtracks"`, update changes it to `"manual"`** — because a human manually edited it, which means it has diverged from its import source. This prevents stale data from overwriting Savanna's edits on the next import.
- **Returns:** Nothing (void)

### `remove`
- **Purpose:** Delete a listing permanently
- **Args:** `id` (document ID)
- **Behavior:** Hard delete. No soft delete, no trash, no archive. If Savanna wants to hide a listing without deleting it, she changes its status to `"hidden"` using `update`.
- **Returns:** Nothing (void)

---

## Behavior — Lead Queries

### `getAll`
- **Purpose:** CMS — show Savanna all leads
- **Returns:** All leads, newest first (by `_creationTime`, descending)

### `getByStatus`
- **Purpose:** CMS filtering — view leads by status
- **Args:** `status` (one of: `"new"`, `"contacted"`, `"scheduled"`, `"closed"`)
- **Returns:** All leads matching that status, newest first
- **Uses index:** `by_status`

---

## Behavior — Lead Mutations

### `submit`
- **Purpose:** Public site contact form — a visitor submits their info
- **Args:** `name`, `email`, plus optional: `phone`, `preferredDate`, `preferredTime`, `message`, `listingId`, `listingTitle`
- **Sets `status`** to `"new"` automatically. The caller does not pass this.
- **Returns:** The new document's ID
- **Note:** This is the only mutation a public visitor triggers. Everything else is admin-only (once auth exists).

### `updateStatus`
- **Purpose:** CMS — Savanna marks a lead as contacted, scheduled, or closed
- **Args:** `id` (document ID), `status` (one of the four valid statuses)
- **Returns:** Nothing (void)

---

## Behavior — Image Storage

Convex has built-in file storage. Listings reference uploaded images by storage ID. The frontend needs two things: a way to upload images and a way to turn storage IDs into displayable URLs.

### `generateUploadUrl`
- **Purpose:** Get a short-lived upload URL from Convex storage
- **Args:** None
- **Returns:** A URL string that the frontend uses to upload a file via HTTP POST
- **This is a Convex `mutation`** (Convex requires mutations for generating upload URLs)

### `getImageUrl`
- **Purpose:** Turn a Convex storage ID into a URL the browser can display
- **Args:** `storageId` (a Convex storage ID from the `_storage` table)
- **Returns:** The URL string, or `null` if the file doesn't exist
- **This is a Convex `query`** so it benefits from reactivity

---

## Edge Cases

| Scenario | What happens |
|---|---|
| `getById` called with an ID that doesn't exist | Returns `null`. Frontend handles the empty state. |
| `update` called with an ID that doesn't exist | Convex will throw. Let it throw — this means a bug in the frontend, not a user error. |
| `remove` called on an already-deleted listing | Convex will throw. Same reasoning — this shouldn't happen in normal use. |
| `submit` called with only name and email | Valid. All other lead fields are optional. |
| `getActive` returns empty array | Valid. Frontend shows an empty state ("No listings yet" or similar). |
| Image storage ID no longer exists | `getImageUrl` returns `null`. Frontend shows a placeholder. |

---

## Constraints

1. **No polling.** All data flows through Convex subscriptions.
2. **No new dependencies.** Everything here uses Convex built-ins.
3. **No auth checks yet.** Mutations are open. Auth is Phase 2.
4. **Domain language only.** Functions use `listing`, `lead`, `status`, `source`, `mlsNumber` — not generic terms.
5. **Server-side defaults.** `source` and `status` are set by the mutation, not passed by the caller. This prevents the frontend from accidentally setting wrong values.
6. **No pagination.** Single-agent dataset. All queries return full results.

---

## Success Criteria

- [ ] Schema has `mlsNumber` and `source` fields on listings table
- [ ] All listing queries return correct data when tested with seed data in Convex dashboard
- [ ] `create` mutation inserts a listing with `source: "manual"` without the caller passing `source`
- [ ] `update` mutation patches only the fields provided, does not overwrite others
- [ ] `update` on a CSV-sourced listing changes `source` to `"manual"`
- [ ] `remove` hard-deletes a listing
- [ ] `submit` creates a lead with `status: "new"` without the caller passing `status`
- [ ] `generateUploadUrl` returns a valid upload URL
- [ ] `getImageUrl` returns a displayable URL for a valid storage ID, `null` for invalid
- [ ] All queries are reactive — changing data in the Convex dashboard updates any subscribed client in real time

---

## What Not to Build

- **No auth middleware.** That's Phase 2 (Clerk).
- **No CSV import logic.** That's SPEC-CSV-IMPORT.md.
- **No MLS sync.** That's Phase 2, not yet specced.
- **No frontend components.** This spec is backend only.
- **No pagination.** Not needed for a single agent's dataset.
- **No soft delete or trash system.** `remove` is a hard delete. `status: "hidden"` covers the "hide but don't delete" use case.
- **No email notifications.** That's Phase 6 (Resend).
- **No search or text filtering.** Filtering is by status and city only. Full-text search is not in scope.

---

## Decisions Made by Claude Code (Flag for Spec Update)

These are decisions I made based on my understanding of the codebase, the domain, and standard real estate practices. They are not explicitly stated in CONTEXT.md. Leo should review and override any that don't match his intent.

1. **`getActive` includes pending listings.** In real estate, pending listings stay visible with a badge. Removing them creates confusion. This is industry standard.

2. **No pagination on any query.** A single agent will realistically have 10-50 listings and a manageable number of leads. Pagination adds complexity with no benefit at this scale.

3. **`update` changes `source` to `"manual"` if the listing was imported.** This prevents the next CSV import from overwriting Savanna's manual edits. Without this, a re-import would silently revert her changes.

4. **`remove` is a hard delete.** No soft delete, no trash. The `"hidden"` status already covers "remove from site but keep the data." A hard delete means "this listing should not exist."

5. **`getById` does not filter by status.** Sold and hidden listings are viewable if someone has the direct URL. Sold listings serve as social proof ("Savanna sold this"). Hidden listings being accessible by direct URL is an acceptable trade-off since there's no auth yet — this gets locked down in Phase 2.

6. **Image storage uses two functions, not one.** `generateUploadUrl` (mutation) and `getImageUrl` (query) are separate because Convex requires mutations for URL generation but queries for reactive data. This is how Convex is designed to work, not an architectural choice.

7. **Lead `getAll` has no pagination either.** Same reasoning as listings — manageable volume for a single agent.

---

*Version 1.0 — February 2026*
*Spec for backend core. Read after CONTEXT.md and CONSTITUTION.md.*

# Phase 1: Convex Setup — Progress

## Overview
Phase 1 connects the app to Convex (cloud database + backend). After this phase, the app can store listings and leads, upload images, and talk to the Convex cloud.

Reference docs:
- Convex schemas: https://docs.convex.dev/database/schemas
- Convex queries: https://docs.convex.dev/functions/query-functions
- Convex mutations: https://docs.convex.dev/functions/mutation-functions
- Implementation plan: `implementation-plan.md`
- Data contract: `data-contract.md`

---

## Files (6 total, ~176 lines)

| # | File | Status | Lines | What it does |
|---|------|--------|-------|-------------|
| 1 | `convex/schema.ts` | DONE | 63 | Defines the `listings` and `leads` database tables with field types, validation, and indexes |
| 2 | `convex/listings.ts` | NOT STARTED | ~60 | Server functions to read/write listings (getActive, getById, create, update, remove) |
| 3 | `convex/leads.ts` | NOT STARTED | ~35 | Server functions to submit leads and manage their status |
| 4 | `convex/files.ts` | NOT STARTED | ~15 | Server functions for image upload (generateUploadUrl, getUrl) |
| 5 | `src/components/providers/ConvexClientProvider.tsx` | NOT STARTED | ~15 | React provider that connects the frontend to Convex |
| 6 | `next.config.ts` (edit) | NOT STARTED | ~3 | Allow images from `*.convex.cloud` domain |

---

## What's Next: `convex/listings.ts`

This file will contain **server functions** — code that runs on Convex's servers, not in the browser. Two types:
- **Queries** — read data (like SELECT in SQL). Used with `useQuery()` on the frontend.
- **Mutations** — write/change data (like INSERT/UPDATE/DELETE). Used with `useMutation()`.

Functions to write:
- `getActive` — query: returns all listings where status is "for-sale"
- `getById` — query: returns one listing by its ID
- `getAll` — query: returns all listings (public)
- `adminGetAll` — query: returns all listings including hidden (admin only, auth added in Phase 2)
- `create` — mutation: adds a new listing
- `update` — mutation: edits an existing listing
- `remove` — mutation: deletes a listing

---

## Concepts Learned (Session 1)

### Imports & Modules
- **Destructuring imports**: `{ thing } from "package"` — grab specific tools from a package
- **`export default`** — makes something available to other files that import it

### Convex Schema Basics
- **Boilerplate** — the 3 lines every schema starts with (imports + `export default defineSchema({})`)
- **`defineSchema` / `defineTable`** — Convex functions to create tables
- **`v` (validator builder)** — the gatekeeper that enforces field types

### Validators (Type Enforcers)
- `v.string()` — must be text
- `v.number()` — must be a number
- `v.optional(v.something())` — wraps any type to make it not required
- `v.array(v.something())` — a list of items of that type
- `v.id("tableName")` — a reference (pointer) to a row in another table
- `v.id("_storage")` — a reference to an uploaded file (like a coat check ticket)
- `v.union(v.literal("a"), v.literal("b"))` — must be one of the listed exact values

### Indexes
- Like a table of contents — lets the database jump to matching rows instead of scanning everything
- `.index("name", ["field"])` — chained onto a table definition

### Key Insights
- **Boilerplate vs. your code** — boilerplate is the same in every project; your code goes inside it
- **Convex compiles on every save** — `npx convex dev` watches your files and pushes to the cloud in real-time. Errors from half-typed code are normal.
- **You don't memorize code** — you learn patterns, then look up specifics. Docs, autocomplete, and past projects are how devs actually work.
- **Convex tracks types automatically** even without a schema, but defining one locks it down (we defined ours because the data structure was already planned)

---

## Conventions

- **Indentation**: 2 spaces for table-level, 4 spaces for fields inside tables
- **Comments**: Inline comments on each field explaining what it stores
- **Section dividers**: `// ─── TABLE NAME ───` to separate tables
- **Trailing commas**: Always include on the last item in a list/object

---

## How to Continue

1. Make sure `npx convex dev` is running in a terminal (it syncs your code to the cloud)
2. Open `implementation-plan.md` for the full Phase 1 spec
3. Next file to create: `convex/listings.ts`
4. After all 6 files are done, seed test data via the Convex dashboard and verify it renders

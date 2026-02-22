# Savanna Sells TN - Backend Implementation Plan

## Stack
- **Database + Backend**: Convex (real-time DB, server functions, file storage)
- **Auth**: Clerk (admin login for Savanna, integrates with Convex)
- **Email**: Resend (lead notifications to Savanna)
- **MLS**: Later phase - manual listings first

---

## Phase 1: Convex Setup

**Install & init:**
```bash
npm install convex
npx convex init
```

**Schema** (`convex/schema.ts`):
- `listings` table: title, description, location, price (number), beds, baths, sqft, city, state, images (array of storage IDs), status (for-sale/pending/sold/hidden), etc.
- `leads` table: name, email, phone, preferredDate, preferredTime, message, listingId, listingTitle, status (new/contacted/scheduled/closed)
- Indexes on status, city, createdAt

**Server functions:**
- `convex/listings.ts` - getActive, getById, getAll, adminGetAll, create, update, remove
- `convex/leads.ts` - submit, getAll, updateStatus
- `convex/files.ts` - generateUploadUrl, getUrl

**Provider** (`src/components/providers/ConvexClientProvider.tsx`):
- Wrap app with ConvexProvider in layout.tsx

**Config updates:**
- `next.config.ts` - add `*.convex.cloud` to remote image patterns

---

## Phase 2: Clerk Auth

**Install:** `npm install @clerk/nextjs`

**Files:**
- `src/components/providers/ConvexClientProvider.tsx` - upgrade to ClerkProvider + ConvexProviderWithClerk
- `convex/auth.config.ts` - Clerk JWT config for Convex
- `src/middleware.ts` - protect `/admin(.*)` routes
- `src/app/sign-in/[[...sign-in]]/page.tsx` - sign-in page
- Add identity checks to admin Convex functions

---

## Phase 3: Frontend Refactor (Convex Data)

**New shared files:**
- `src/hooks/useStorageUrl.ts` - resolve Convex storage IDs to URLs
- `src/lib/format.ts` - `formatPrice()` utility
- `src/lib/types.ts` - shared Listing/Lead types from Convex

**Refactor ListingsGrid** (`src/components/sections/ListingsGrid.tsx`):
- Remove mock data
- Fetch from Convex via `useQuery(api.listings.getActive)`
- Add loading skeleton + empty state

**Extract ListingCard** (`src/components/ui/ListingCard.tsx`):
- Reusable card component from current grid rendering
- Resolves storage image URLs
- Formats price as number → `$1,200,000`
- "Details" button triggers lead capture modal

**New pages:**
- `src/app/listings/page.tsx` - all listings with filters
- `src/app/listings/[id]/page.tsx` - individual listing detail

---

## Phase 4: Admin Panel

**Route group restructure:**
```
src/app/
  layout.tsx              # Simplified: just providers + html/body
  (public)/
    layout.tsx            # Navbar + Footer wrapper
    page.tsx              # Home (moved from src/app/page.tsx)
    listings/...
  admin/
    layout.tsx            # Admin sidebar, no public nav
    page.tsx              # Dashboard (counts, recent leads)
    listings/
      page.tsx            # Manage listings table
      new/page.tsx        # Create listing form
      [id]/page.tsx       # Edit listing form
    leads/
      page.tsx            # View/manage leads
```

**Admin components:**
- `src/components/admin/ListingForm.tsx` - shared create/edit form with image upload (Convex storage)
- `src/components/admin/AdminSidebar.tsx` - admin navigation

**Listing form fields:** title, description, price, location, address, city, state, zip, beds, baths, sqft, propertyType, yearBuilt, features, status, images (multi-upload)

---

## Phase 5: Lead Capture Form

**`src/components/forms/LeadCaptureModal.tsx`:**
- Modal with Framer Motion animations
- Fields: name, email, phone, preferred date (date input), preferred time (dropdown), optional message
- Submits to `api.leads.submit`
- Success state: "Thank you! Savanna will reach out soon."
- Triggered from ListingCard "Details" button and listing detail page

---

## Phase 6: Email Notifications

**Install:** `npm install resend`

**`convex/email.ts`** (with `"use node"` directive):
- `sendLeadNotification` internal action via Resend
- Sends email to Savanna with lead name, email, phone, property, preferred date/time

**Trigger:** `leads.submit` mutation calls `ctx.scheduler.runAfter(0, ...)` to send email async after saving lead

---

## Phase 7: Polish

- Update Navbar links to real routes (`/listings` instead of `#listings`)
- Update `.gitignore` for `.convex/`
- Update ESLint config to ignore `convex/_generated/`
- Environment variables: Convex, Clerk, Resend keys

---

## Build Order
1. Phase 1 - Convex setup (schema, functions, provider)
2. Phase 3 shared utils (types, format, hooks)
3. Phase 3 ListingsGrid refactor (swap mock data for Convex)
4. Phase 2 - Clerk auth
5. Phase 4 - Admin panel (CRUD for listings)
6. Phase 5 - Lead capture modal
7. Phase 6 - Email notifications
8. Phase 7 - Nav updates, polish

## Key Files Modified
- `src/components/sections/ListingsGrid.tsx` - refactor from mock to Convex
- `src/app/layout.tsx` - add providers, restructure for route groups
- `src/components/ui/Navbar.tsx` - update links
- `next.config.ts` - add Convex image domain
- `data-contract.md` - reference for schema alignment

## Verification
- Seed test listings via Convex dashboard, verify they render on home page
- Create a listing via admin panel, verify it appears on public site in real-time
- Submit lead capture form, verify lead appears in admin + email sent
- Test auth: unauthenticated user hitting /admin gets redirected to sign-in
- Run `npm run build` to verify no type errors

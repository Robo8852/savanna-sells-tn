# CLAUDE.md — Operating Instructions

## Session Startup

1. Read `CONTEXT.md` — architectural decisions
2. Read the relevant `SPEC-*.md` for whatever you're building
3. Do NOT write code until you've read the docs

## Completed Phases

**Phase 1 — Convex Backend: COMPLETE**
- `convex/schema.ts` — listings + leads tables, mlsNumber + source fields
- `convex/listings.ts` — getActive, getById, getByStatus, getAll, create, update, remove
- `convex/leads.ts` — getAll, getByStatus, submit, updateStatus
- `convex/files.ts` — generateUploadUrl, getImageUrl
- `ConvexClientProvider` — wired into layout.tsx
- `next.config.ts` — *.convex.cloud in remote image patterns

**Phase 3 — Frontend Wiring: COMPLETE**
- `src/lib/format.ts` — formatPrice utility
- `src/hooks/useStorageUrl.ts` — resolves Convex storage IDs to URLs
- `src/components/sections/ListingsGrid.tsx` — uses `useQuery(api.listings.getActive)` with loading skeleton + empty state
- `src/components/ui/ListingCard.tsx` — extracted component with image resolution + price formatting

## Current Task: Phase 4 — Admin Panel

**7 steps, build one at a time:**
1. ~~Route group restructure~~ — DONE. `(public)` route group with Navbar/Footer, root layout is shared shell.
2. ~~Admin layout + sidebar~~ — DONE. `AdminSidebar.tsx` (dark green), `admin/layout.tsx`, placeholder dashboard.
3. ~~Dashboard page~~ — DONE. Stat cards (Total/Active Listings, Total/New Leads) + recent leads table, live from Convex.
4. ~~Listings table~~ — DONE. `/admin/listings` with status badges, edit links, delete with confirmation modal.
5. ~~Listing form (create + edit)~~ — DONE. Shared `ListingForm.tsx` with multi-image upload, dropdown for propertyType, tag input for features. Routes: `/admin/listings/new` + `/admin/listings/[id]/edit`.
6. Leads page — table with status dropdown to update lead status
7. Polish — back links, navigation verification

**Also built (added to Phase 4):**
- `src/app/(public)/listings/[id]/page.tsx` — Public listing detail page with image carousel, full property info, features tags, sticky "Schedule a Showing" sidebar (placeholder for Phase 5 lead modal)
- `src/components/ui/ListingCard.tsx` — Now wraps in `<Link>` to `/listings/[id]`
- Image carousel — crossfade transitions (AnimatePresence), arrow buttons, dot indicators (active dot stretches wider), mobile swipe via Framer Motion drag

**Deployment:** Vercel connected to GitHub repo, auto-deploys on push to main. Convex URL: `savory-mockingbird-340` (shared dev/prod for now).

**NEXT SESSION:** Step 6 (Leads page) → Step 7 (Polish).

**No backend changes needed.** All Convex functions already exist.

## Key Rules

1. **Question first, code second.** Ask Leo before assuming.
2. **One feature at a time.** Build it, test it, move on.
3. **No new dependencies** without Leo's approval.
4. **No polling.** Convex subscriptions only.
5. **Spec is source of truth.** If spec and code conflict, spec wins.
6. **Explain new concepts.** Leo knows HTML, CSS, basic JS.
7. **Domain language:** use `listing`, `lead`, `status`, `mlsNumber`, `source` — not generic terms.
8. **Orchestrator pattern.** Claude is the orchestrator — use Task agents to build in parallel. Break work into independent pieces, launch agents, review their output, and coordinate.
9. **Bi-directional prompting.** Ask Leo questions throughout the process, not just at the start. Encourage Leo to ask questions back. Building is a conversation, not a handoff.

## Tech Stack

Next.js 16, React 19, TypeScript 5 (strict), Convex, Tailwind CSS 4, Framer Motion, Lucide React. Path alias: `@/*` → `./src/*`

## Convex Dev Server

Run `npx convex dev` when writing/testing backend code.

## Context Window

At **~50% usage**, tell Leo and suggest a fresh session.

## Key Docs

| File | Purpose |
|------|---------|
| `CONTEXT.md` | Architectural decisions and reasoning |
| `SPEC-BACKEND.md` | Backend functions spec |
| `implementation-plan.md` | 7-phase build roadmap |
| `SDD-OPERATING-MANUAL.md` | How Spec-Driven Development works |
| `docs/data-contract.md` | MLS API data mapping |

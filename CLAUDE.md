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

**Phase 4 — Admin Panel: COMPLETE**
- Route group restructure — `(public)` + `admin/` layout split
- `AdminSidebar.tsx` — dark green sidebar with Dashboard, Listings, Leads links
- Dashboard — stat cards + recent leads table, live from Convex
- Listings table — `/admin/listings` with status badges, edit links, delete with confirmation modal
- `ListingForm.tsx` — shared create/edit form with multi-image upload, dropdown for propertyType, tag input for features
- Leads page — `/admin/leads` with filter tabs, status dropdown, expandable rows
- Public listing detail — `/listings/[id]` with image carousel, full property info, features tags
- Navigation polish — all back links verified, Navbar "Listings" link fixed to `/listings`

**Phase 5 — Lead Capture Form: COMPLETE**
- `src/components/ui/ContactForm.tsx` — name, email, phone, preferred date/time, message
- Submits to `api.leads.submit`, success state with "Savanna will be in touch soon"
- Wired into listing detail page sidebar with `listingId`/`listingTitle` pre-filled
- Button text adapts: "Schedule a Showing" on listing pages, "Send Message" otherwise

**Deployment:** Vercel connected to GitHub repo, auto-deploys on push to main. Convex URL: `savory-mockingbird-340` (shared dev/prod for now).

**Domain:** `savannasellstn.com` on GoDaddy — not yet connected to Vercel. See `docs/domain-setup.md` for instructions.

## Next Up

**Phase 6 — Email Notifications (Resend)**
- Install Resend, create `convex/email.ts` with `"use node"` directive
- `sendLeadNotification` internal action — emails Savanna when a lead submits
- Trigger from `leads.submit` via `ctx.scheduler.runAfter(0, ...)`

**Phase 7 — Final Polish** (partially done)
- ~~Navbar links~~ — DONE
- `.gitignore` for `.convex/`
- ESLint config to ignore `convex/_generated/`
- Environment variables cleanup

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

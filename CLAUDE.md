# CLAUDE.md — Operating Instructions

## Session Startup

1. Read `CONTEXT.md` — architectural decisions
2. Read the relevant `SPEC-*.md` for whatever you're building
3. Do NOT write code until you've read the docs

## Current Task: Phase 3 — Wire Frontend to Convex

**Phase 1 is COMPLETE.** All backend functions exist and match the spec:
- `convex/schema.ts` — listings + leads tables, mlsNumber + source fields
- `convex/listings.ts` — getActive, getById, getByStatus, getAll, create, update, remove
- `convex/leads.ts` — getAll, getByStatus, submit, updateStatus
- `convex/files.ts` — generateUploadUrl, getImageUrl
- `ConvexClientProvider` — wired into layout.tsx
- `next.config.ts` — *.convex.cloud in remote image patterns

**Next: Phase 3 — Frontend Refactor (Convex Data)**
1. Create `src/lib/format.ts` — formatPrice utility
2. Create `src/hooks/useStorageUrl.ts` — resolve Convex storage IDs to URLs
3. Refactor `ListingsGrid.tsx` — swap MOCK_PROPERTIES for `useQuery(api.listings.getActive)`
4. Add loading skeleton + empty state
5. Extract `ListingCard` component

## Key Rules

1. **Question first, code second.** Ask Leo before assuming.
2. **One feature at a time.** Build it, test it, move on.
3. **No new dependencies** without Leo's approval.
4. **No polling.** Convex subscriptions only.
5. **Spec is source of truth.** If spec and code conflict, spec wins.
6. **Explain new concepts.** Leo knows HTML, CSS, basic JS.
7. **Domain language:** use `listing`, `lead`, `status`, `mlsNumber`, `source` — not generic terms.

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

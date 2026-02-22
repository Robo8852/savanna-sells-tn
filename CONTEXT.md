# Project Context: Savannah Sells TN
*A summary of the discovery conversation that established all architectural decisions for this project. This document exists so Claude Code has the full reasoning behind every decision — not just the decisions themselves.*

---

## Who This Is For

This document is written for Claude Code. Read it before touching anything in this repo. It captures the full discovery conversation between Leo (the architect) and Claude (the AI assistant) that produced the architecture decisions for this project.

Do not make assumptions that contradict what is written here. If something is unclear, ask Leo before proceeding.

---

## The Project

**Client:** Savannah — a real estate agent based in Franklin, Tennessee
**Site:** savanna-sells-tn (note: repo name uses one 'n', client name uses two)
**Stack:** Next.js 16, React 19, TypeScript, Convex, Tailwind CSS, Framer Motion
**Deployed on:** Vercel (assumed, standard for Next.js)

---

## The Core Problem We Solved Before Writing a Line of Spec

### What we started with
The question was: what makes API integrations painful in real estate websites — specifically MLS integration with RealTracs (the local MLS for Franklin, TN)?

### The root cause we identified
**Desynchronization.** Not a specific bug, not a bad library — desynchronization is the disease. All API headaches are symptoms of it.

Desynchronization happens when two systems have independent state, communicate across an unreliable boundary (the network), with no shared source of truth enforcing the contract.

In real estate specifically this manifests as:
- **Contract drift** — MLS feed changes shape, frontend breaks silently
- **Stale state** — UI shows a listing that already went pending or sold
- **Race conditions** — two requests in flight, slower one wins
- **Error handling inconsistency** — every endpoint fails differently
- **Pagination drift** — dataset changes while user is paginating

### How Convex solves this
Convex is event-driven by default. The UI does not poll — it subscribes. When data changes in Convex, every client watching that data gets updated automatically. This eliminates stale state natively without custom architecture work.

This is why Convex is the right backend for this project. It's not just convenient — it directly addresses the root cause of the hardest problems in this domain.

---

## Architecture Decisions

### Primary Pattern: Event-Driven
This is the dominant architecture pattern for this project. Everything else is secondary.

- UI subscribes to Convex queries — never polls
- Data changes propagate to all clients automatically
- Do not introduce polling patterns anywhere in this codebase

### Supporting Patterns (describe mechanics, not separate systems)
- **Async queues** — CSV import runs asynchronously, never blocks the UI
- **Pipes and filters** — import pipeline: parse → validate → deduplicate → upsert
- **Client-server** — baseline reality, nothing exotic

### What NOT to build
- No microservices. This is a single-client real estate site. Microservices introduce the exact API headache problems we're trying to avoid.
- No polling. Anywhere. Ever.
- No hybrid data patterns that tightly couple MLS data with CMS data.

---

## Project Phasing

This is a brownfield project. UI exists. Schema exists. Backend functions do not exist yet.

### Phase 1 — Custom CMS (current phase)
Savannah manages listings manually. She fills out a spreadsheet, uploads it through the CMS, and listings populate the site. No MLS dependency. Fast to launch.

**Why Phase 1 first:**
- Gets the site live without waiting for RealTracs access
- Validates the site structure and Savannah's workflow
- Establishes the data model that Phase 2 plugs into

### Phase 2 — RealTracs MLS Integration (future)
RealTracs feed replaces the spreadsheet upload. Automated sync job populates the same Convex tables Phase 1 established. No restructuring required — Phase 2 is an additive change, not a migration.

**RealTracs access method:** Not yet confirmed. Could be RETS, RESO Web API, or IDX feed. Do not build MLS integration until access method is confirmed.

---

## Existing Codebase — What Exists, What to Leave Alone

### UI (do not restructure without Leo's explicit instruction)
```
src/app/layout.tsx          — root layout
src/app/page.tsx            — home page
src/app/globals.css         — global styles
src/components/sections/Hero.tsx        — hero section
src/components/sections/ListingsGrid.tsx — listings display
src/components/ui/Footer.tsx            — footer
src/components/ui/Navbar.tsx            — navbar
src/lib/utils.ts            — utility functions
```

### Convex Schema (exists — see gap note below)
```
convex/schema.ts — defines listings and leads tables
```

**listings table fields:**
- title, description, price, location, address, city, state, zip
- beds, baths, sqft, propertyType, yearBuilt, features
- images (array of storage IDs)
- status: "for-sale" | "pending" | "sold" | "hidden"
- indexes: by_status, by_city

**leads table fields:**
- name, email, phone, preferredDate, preferredTime, message
- listingId (optional reference to listings)
- listingTitle (optional)
- status: "new" | "contacted" | "scheduled" | "closed"
- indexes: by_status

### What Does NOT Exist Yet (this is what gets built)
```
convex/listings.ts      — query and mutation functions
convex/leads.ts         — query and mutation functions
convex/import.ts        — CSV import action
src/app/admin/          — CMS interface for Savannah
```

---

## Critical Schema Gap — Fix Before Building Functions

The current schema is missing two fields needed for Phase 2 compatibility:

```typescript
mlsNumber: v.optional(v.string()),   // unique key for RealTracs upsert
source: v.optional(v.string()),      // "manual" | "realtracks" | "csv"
```

**Why this matters:** When Phase 2 arrives, the MLS sync needs a stable unique key to upsert against. Without `mlsNumber`, every sync either creates duplicates or requires a painful migration. Adding it now costs nothing. Not adding it now costs significant refactoring later.

**Add these fields to the listings table in schema.ts before writing any query or mutation functions.**

---

## The CSV Import Flow

This is Savannah's primary workflow for Phase 1:

1. Savannah fills out the listing template spreadsheet (a .docx template has been created for her)
2. She converts it to CSV
3. She uploads CSV through the CMS interface
4. Backend parses rows, validates fields, deduplicates by MLS #, upserts to Convex
5. Site updates in real time (Convex reactivity handles this automatically)

**Import pipeline (pipes and filters pattern):**
```
Raw CSV file
    → Parse rows
    → Validate required fields (flag rows with missing data, don't fail entire import)
    → Deduplicate by mlsNumber (upsert, not insert)
    → Write to Convex listings table
    → Return import summary (added, updated, skipped, errors)
```

**Key rules:**
- `mlsNumber` is the unique key. If it matches an existing record, update it. If not, create it.
- Do not fail the entire import if one row is invalid. Flag it and continue.
- Show Savannah a preview before committing the import.
- Show a summary after: X added, X updated, X skipped, X errors.

---

## Spec-Driven Development — The Methodology Behind This Project

### What SDD Is

Spec-Driven Development (SDD) is the methodology this entire project is built on. It is not a documentation practice bolted onto the side of development. It is the development paradigm itself.

The core principle, articulated by Roman (an LLM researcher whose work informed this project):

**The spec is the source of truth. Code is the output.**

This is a fundamental inversion of traditional development. Traditionally, code is what you maintain and documentation is what you write afterward to explain it. In SDD, the spec is what you maintain and code is what gets generated, verified, and if necessary regenerated from the spec.

What this means concretely:
- If the spec and the code conflict — **the spec wins**
- If you need to change behavior — **update the spec first, then regenerate the code**
- If the spec doesn't cover something — **do not assume, ask Leo**
- Code is disposable. The spec persists.

### Why This Project Uses SDD

This project uses SDD for a specific reason that emerged from the discovery conversation: Leo recognized that AI has commoditized code generation but has increased the value of precise intent specification. Writing a good spec — one that encodes domain knowledge, architectural constraints, and intent — is the high-value work. Generating code from that spec is what Claude Code does.

This is also why desynchronization matters at the methodology level, not just the technical level. A vague spec creates gaps. Claude Code fills gaps with defaults. Defaults may not match intent. The result is the same desynchronization problem at the architecture level — except now it's between the spec and the codebase rather than between the UI and the backend.

The solution is the same: a precise, shared source of truth that both Leo and Claude Code operate from. That source of truth is the spec.

### The Relationship Between SDD and Domain-Driven Design

This project also draws on Domain-Driven Design (Eric Evans, 2003). DDD says: your code should speak the language of the business domain, not the language of the technology. The spec encodes that domain language before the code exists. When Claude Code reads the spec and generates functions, variable names, and data structures, those artifacts should reflect the real estate domain — not generic CRUD patterns.

See the Domain Language section of this document for the specific vocabulary to use.

### The SDD Pipeline for This Project

```
Discovery conversation (Leo + Claude)
    ↓
Decisions and reasoning captured in CONTEXT.md (this file)
    ↓
Project DNA captured in CONSTITUTION.md
    ↓
Feature intent captured in SPEC-*.md files
    ↓
Claude Code reads all spec files
    ↓
Claude Code generates code that reflects the spec
    ↓
Leo verifies output against spec
    ↓
If drift detected → fix the spec → regenerate
```

### The Spec Files and What Each One Is For

| File | Purpose | Written for | Read order |
|---|---|---|---|
| `CONTEXT.md` | Discovery reasoning, why decisions were made | Claude Code | 1st |

### What Claude Code Must Do Before Writing Any Code

1. Read CONTEXT.md — understand the reasoning
4. If anything is ambiguous or missing — ask Leo before assuming
5. Generate code that serves the spec
6. Do not introduce patterns, libraries, or architectural decisions not covered in the spec

### What Spec Drift Is and Why It Must Be Avoided

Spec drift is when the code diverges from the spec without the spec being updated. It is the SDD equivalent of desynchronization. It happens when:

- Claude Code fills a gap in the spec with a default assumption
- A quick fix gets made in code without updating the spec
- A new dependency gets added without spec approval

Spec drift compounds. One undocumented decision becomes the foundation for the next one. Eventually the spec no longer reflects what was built and loses its value as a source of truth.

**To prevent spec drift:** any decision made during a Claude Code session that isn't covered in the spec must be flagged to Leo so the spec can be updated. The spec is a living document — it evolves with the project, but it evolves deliberately, not silently.

---

## Domain Language (use these terms consistently)

This project operates in the real estate domain. Use domain language, not generic technical language, in function names, variable names, and comments.

| Domain Term | Meaning | Do NOT use instead |
|---|---|---|
| Listing | A property for sale | Property, item, record |
| Lead | A potential buyer who submitted a form | Contact, user, submission |
| Status | The current state of a listing | State, flag |
| MLS | Multiple Listing Service | Feed, API (in domain context) |
| RealTracs | The specific MLS provider for this market | Generic "MLS provider" |
| CMS | Savannah's admin interface | Admin panel, dashboard |
| Import | The CSV upload and processing workflow | Upload, sync (for Phase 1) |
| Sync | The automated MLS feed workflow | Import (for Phase 2) |

---

## Tech Stack Constraints

| Concern | Decision | Reason |
|---|---|---|
| Backend | Convex only | Event-driven natively, no polling needed |
| Frontend | Next.js 16 + React 19 | Already established |
| Styling | Tailwind CSS + tailwind-merge | Already established |
| Animation | Framer Motion | Already installed |
| Icons | Lucide React | Already installed |
| State | Convex reactivity | Do not add Redux, Zustand, or other state libraries |
| Auth | TBD — ask Leo before implementing | Not yet decided |
| Image storage | Convex storage | Already referenced in schema |

**Do not add new dependencies without Leo's approval.**

---

## What Gets Built Next

In order:

1. **Schema update** — add `mlsNumber` and `source` fields to listings table
2. **Convex query functions** — listings queries (by status, by city, single listing)
3. **Convex mutation functions** — create, update, delete listing; create lead
4. **Image upload** — wire Convex storage to listing images
5. **CSV import** — async import action with validation and upsert logic
6. **Admin CMS** — Savannah's interface to manage listings and view leads

Each of these will have its own spec file. Do not build ahead of the spec.

---

## Credits and References

- **Leo** — architect, discovery methodology, project lead
- **Roman** (LLM researcher) — introduced spec as source of truth methodology
- **Eric Evans** — Domain-Driven Design (the theoretical foundation)
- **GitHub Spec Kit, Thoughtworks, InfoQ** — documented SDD as formal practice in 2025

---

*Version 1.0 — February 2026*
*Discovery conversation summary. Read before touching the codebase.*

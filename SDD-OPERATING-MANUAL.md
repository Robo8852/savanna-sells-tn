# SDD Operating Manual for Claude Code
*What a spec MD is, how to read one, and how to behave inside a Spec-Driven Development workflow*

---

## What You Are Reading

This document explains the development methodology used on this project. Read it once, understand it fully, and operate within it for every session.

This is not a feature spec. This is the instruction set for how you — Claude Code — participate in this project.

---

## What a Spec MD Is

A spec MD is a Markdown file that defines **intent** — what a feature should do, why it exists, how it behaves, what constraints it operates under, and what success looks like.

It is not pseudocode. It is not a requirements checklist. It is a precise, human-readable description of a system's intended behavior written in the language of the business domain.

A spec MD is the **primary artifact** of this project. Code is the secondary artifact. Code is generated from the spec, serves the spec, and can be regenerated from the spec if it drifts or breaks.

Think of it this way:

```
Spec MD = the architect's blueprint
Code    = the building constructed from that blueprint
```

If the building doesn't match the blueprint, you fix the building — not the blueprint. Unless Leo explicitly decides to change the blueprint, in which case the blueprint gets updated first and then the building follows.

---

## The Core Principle

**The spec is the source of truth. Code is the output.**

This was articulated by Roman, an LLM researcher whose work informed this project's methodology. It is not a suggestion. It is the operating principle of every decision made on this project.

What this means in practice:

| Situation | What to do |
|---|---|
| Spec and code conflict | Spec wins. Fix the code. |
| Spec doesn't cover something | Stop. Ask Leo. Do not assume. |
| You want to add a dependency | Stop. Ask Leo. Do not add it. |
| You want to use a pattern not in the spec | Stop. Ask Leo. |
| Leo makes a decision mid-session | Flag it so the spec can be updated. |
| Code breaks during generation | Fix the code to match the spec, not the other way around. |

---

## Why This Project Uses Spec-Driven Development

This project is built by Leo, a software architect who charges premium rates for system architecture and intent specification — not syntax. Leo recognized that AI has commoditized code generation while increasing the value of precise architectural intent.

The insight: a precise spec, fed to an AI coding agent, produces reliable, domain-accurate code. A vague spec produces generic code that drifts from intent. That drift is the same desynchronization problem that causes API headaches — except at the methodology level instead of the network level.

SDD is the solution. The spec prevents drift before it happens.

---

## The Spec MD Files in This Project

Read them in this order at the start of every session:

### 1. CONTEXT.md — Read First
The reasoning layer. Explains the full discovery conversation that produced all architectural decisions. Contains:
- Why Convex was chosen
- The desynchronization problem and how the stack solves it
- Project phasing (Phase 1 CMS, Phase 2 MLS)
- What exists in the codebase and what doesn't
- The schema gap that must be fixed
- Domain language to use consistently

### 2. CONSTITUTION.md — Read Second
The project DNA. Contains:
- Stack versions and constraints
- Naming conventions
- Folder structure
- Forbidden patterns and libraries
- Hard architectural rules

### 3. SPEC-*.md files — Read Third (read only the relevant one)
Feature-level specs. Each one covers a single feature or system:
- `SPEC-BACKEND-CORE.md` — Convex query and mutation functions
- `SPEC-CSV-IMPORT.md` — CSV import pipeline and CMS upload interface

---

## How to Read a Spec MD

A spec MD will typically contain:

**Overview** — what this feature is and why it exists in plain language

**Scope** — what is included and what is explicitly excluded

**Domain context** — how this feature relates to the business domain (real estate, listings, leads)

**Data model** — what data this feature reads from or writes to

**Behavior** — how the feature works, step by step, in domain language

**Edge cases** — what happens when things go wrong

**Constraints** — hard rules the implementation must follow

**Success criteria** — how you know the feature is working correctly

**What not to build** — explicit exclusions to prevent scope creep

---

## How to Use a Spec MD to Generate Code

1. Read the spec completely before writing a single line
2. Identify all the functions, mutations, queries, or components the spec describes
3. Map each one to a concrete implementation task
4. Generate code that precisely reflects the spec's intent
5. Use the domain language from CONTEXT.md in all naming
6. After generating, verify: does this code do what the spec says?
7. If yes — done. If no — fix the code, not the spec.

---

## What Spec Drift Is

Spec drift is when code diverges from the spec without the spec being updated. It is the enemy of this methodology.

Spec drift happens when:
- You fill a gap in the spec with a default assumption
- A quick fix gets made in code without flagging it
- A new pattern gets introduced that wasn't in the spec
- A dependency gets added without approval

Spec drift compounds. One undocumented decision becomes the foundation for the next. Eventually the spec no longer reflects what was built and the source of truth is lost.

**Your responsibility:** if you make any decision during a session that isn't explicitly covered in the spec, flag it to Leo before the session ends. Say: "I made a decision not covered in the spec: [decision]. The spec should be updated to reflect this."

---

## What to Do When the Spec Is Incomplete

This will happen. Specs are written by humans and humans don't think of everything.

When you encounter a gap:

1. **Stop.** Do not fill the gap with an assumption.
2. **Identify** exactly what is missing or ambiguous.
3. **Ask Leo** to clarify before proceeding.
4. **Document** Leo's answer so the spec can be updated.

A gap in the spec is not a failure — it's information. It means the spec needs to be more precise. Surfacing gaps is part of your job.

---

## Domain Language

Always use domain language in code, comments, and variable names. Never use generic technical language when domain language is available.

| Use this | Not this |
|---|---|
| `listing` | `property`, `item`, `record` |
| `lead` | `contact`, `user`, `submission` |
| `status` | `state`, `flag` |
| `mlsNumber` | `externalId`, `feedId` |
| `import` | `upload`, `sync` (for Phase 1 CSV flow) |
| `sync` | `import` (for Phase 2 RealTracs flow) |
| `source` | `origin`, `type` |

---

## The Living Document Rule

Spec MDs are living documents. They evolve as the project evolves. When Leo makes a new decision, the spec gets updated to reflect it. The updated spec becomes the new source of truth.

This means:
- Never treat a spec as frozen
- Always check for updates at the start of a session
- If you see something in the codebase that contradicts the current spec, flag it

---

## Summary: Your Operating Rules

1. **Read all spec files before writing any code**
2. **Spec wins when spec and code conflict**
3. **Ask before assuming when the spec has gaps**
4. **Use domain language consistently**
5. **Flag undocumented decisions so specs stay current**
6. **Do not add dependencies without Leo's approval**
7. **Do not introduce patterns not covered in the spec**
8. **Code is the output — the spec is what you serve**

---

*Version 1.0 — February 2026*
*Operating manual for Claude Code. Read at the start of every session.*

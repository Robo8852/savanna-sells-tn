# Testing — Future Setup

## When to Add a Test Framework
- Phase 5+ when CSV import pipeline needs validation testing
- Any time a function has complex logic where mistakes fail silently

## Candidate: Vitest
- Fast, works with TypeScript out of the box
- Needs Leo's approval before installing (new dependency)

## Functions Worth Testing Later
- `formatPrice` — verify USD formatting config (no cents, commas, dollar sign)
- CSV import pipeline — parse, validate, deduplicate, upsert
- Lead form validation

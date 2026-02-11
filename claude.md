# Savanna Sells TN - Product Requirements Document

## Project Overview
A real estate website for the **Savanna Sells TN** brand with future MLS integration capabilities. Serving the Tennessee real estate market.

## Brand Identity
- **Brand Name**: Savanna Sells TN
- **Target Market**: Tennessee home buyers and sellers
- **Tone**: Professional, approachable, local expertise
- **Domain Suggestion**: savannasellstn.com

## Phase 1: Generic Real Estate Website

### Core Pages
- **Home** - Hero section, featured listings, about teaser, contact CTA
- **About** - Savanna's bio, credentials, Tennessee service areas
- **Listings** - Property grid/list view with filters
- **Property Detail** - Individual listing pages with gallery, details, contact form
- **Contact** - Contact form, phone, email, office location

### Essential Features
- Responsive design (mobile-first)
- Property search with filters (price, beds, baths, location)
- Image galleries for properties
- Contact forms with email notifications
- SEO optimization for Tennessee local search (Nashville, Memphis, Knoxville, etc.)

## Phase 2: MLS Integration

### Technical Considerations
- **RESO Web API** - Industry standard for MLS data
- **IDX Feed** - Internet Data Exchange for displaying listings
- **RETS** (legacy) - Real Estate Transaction Standard

### MLS Integration Options
1. **IDX Broker** - Plug-and-play solution
2. **Spark API** - Direct MLS access
3. **Custom RESO integration** - Full control, more complex

## Technical Stack Recommendations

### Frontend
- **Next.js** - React framework with SSR/SSG for SEO
- **Tailwind CSS** - Rapid styling
- **Framer Motion** - Smooth animations

### Backend Options
- **Next.js API Routes** - Simple, integrated
- **Supabase** - Database + Auth + Storage
- **Sanity/Contentful** - CMS for non-MLS content

### Hosting
- **Vercel** - Optimized for Next.js
- **Netlify** - Alternative with good DX

## Data Model (Pre-MLS)

### Property
- id, title, description
- price, status (active/pending/sold)
- beds, baths, sqft, lot_size
- address, city, state, zip
- property_type (single-family, condo, etc.)
- images[], features[]
- created_at, updated_at

### Lead/Contact
- id, name, email, phone
- message, property_interest
- created_at, status

## Success Metrics
- Page load time < 3s
- Mobile Lighthouse score > 90
- Lead form submissions
- Organic search rankings for Tennessee real estate keywords

## Workflow Agreement
- **The developer (Leo) is the architect. Claude is the executor.**
- Leo designs the structure, makes decisions, sets direction
- Claude writes code in small pieces, one file at a time
- After each piece, Claude explains what it does in plain terms
- Leo validates understanding before moving on — if he can't explain it, we stop and break it down
- Claude does not guess when unsure — asks or flags uncertainty honestly
- This is a real project for a real person (Savanna). No hallucinating. Stick to documented patterns.
- Leo's current skill level: HTML, CSS, basic JS (functions, arrays, conditionals, for loops). New concepts get explained as they come up.
- Reference: `docs/implementation-plan.md` for the full 7-phase build plan

## Inspiration
> "How precious to me are your thoughts, God! How vast is the sum of them! Were I to count them, they would outnumber the grains of sand." — Psalm 139:17-18

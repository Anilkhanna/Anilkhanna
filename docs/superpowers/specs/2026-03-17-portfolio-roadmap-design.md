# Portfolio Improvement Roadmap — Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Goal:** Enhance portfolio for job hunting, freelance leads, and long-term brand building using a phased, impact-first approach.

---

## Overview

Five features across three phases, prioritized by conversion impact:

| Phase | Feature | Purpose |
|-------|---------|---------|
| 1 | Hire Me Banner | Drive immediate contact conversions |
| 1 | Testimonials | Social proof from LinkedIn recommendations |
| 2 | Case Studies | Deep credibility for top 3 projects |
| 2 | Services Page | Attract freelance/consulting leads |
| 3 | Blog | Content engine for SEO and thought leadership |

**Dropped:** Section reordering / A/B testing — current order is fine.

---

## Phase 1: Conversion Boosters

### 1.1 "Hire Me" Availability Banner

**Purpose:** Make availability immediately visible to recruiters and hiring managers.

**Placement:** Sticky bar at the top of the page, above or integrated into the Navbar. Visible on scroll. Not dismissible (persistent while active).

**Content when active:**
> "Available for hire — Senior/Lead roles · Full Stack & Mobile · Munich (onsite/hybrid) or Remote · Also open to freelance"

**When toggled off:** Banner disappears entirely. No "unavailable" state.

**Data model — new `availability` field in `portfolio.json`:**
```json
{
  "availability": {
    "isAvailable": true,
    "roles": "Senior/Lead roles",
    "domains": "Full Stack & Mobile",
    "location": "Munich (onsite/hybrid) or Remote",
    "freelance": true
  }
}
```

**Banner message template:**
> "Available for hire — {roles} · {domains} · {location}" + (if freelance: " · Also open to freelance")

When `freelance` is false, that clause is omitted. When `isAvailable` is false, the entire banner is hidden.

**Admin panel integration:**
- Add toggle switch + editable fields to existing admin panel at `/admin-panel-9x7k`
- Read/write via existing `/api/admin/data` endpoint (no new API routes needed)
- Update `PortfolioData` TypeScript interface in admin panel to include `availability` type
- Add `"availability"` to the `requiredKeys` array in `/api/admin/data/route.ts` to prevent data loss on save

**Styling:**
- Accent background color (`--accent`) with contrasting text
- Subtle glow-pulse animation to draw attention
- Small text (14px), single line on desktop, wraps on mobile
- Matches existing theme variables for dark/light mode

**Component:** `src/components/ui/AvailabilityBanner.tsx` — client component reading from portfolio data.

---

### 1.2 Testimonials / Recommendations Section

**Purpose:** Social proof from real people who've worked with Anil.

**Placement:** New section between Projects (04) and Tech Stack. Section numbering shifts:
- 05. TESTIMONIALS → "What People Say"
- 06. TECH STACK (was 05)
- 07. CONTACT (was 06)

**Section headings update in `portfolio.json`:**
- Add `"testimonials": { "label": "05. TESTIMONIALS", "title": "What People Say" }`
- Update `"techStack"` label to `"06. TECH STACK"`
- Update `"contact"` label to `"07. CONTACT"`

**Empty state:** If testimonials array is empty, hide the section entirely (no heading or carousel rendered).

**Content:** 5-7 LinkedIn recommendations. Each testimonial:
- Quote text (trimmed to ~2-3 sentences if long)
- Person's name
- Role & Company
- LinkedIn profile URL (icon link, no photos)

**Data model — new `testimonials` array in `portfolio.json`:**
```json
{
  "testimonials": [
    {
      "name": "John Doe",
      "role": "Engineering Manager",
      "company": "MyGate",
      "quote": "Anil is an exceptional developer who...",
      "linkedinUrl": "https://linkedin.com/in/johndoe"
    }
  ]
}
```

**Layout:**
- Horizontal draggable carousel (reuse pattern from Projects section)
- Cards with quote text, attribution line, LinkedIn icon link
- Responsive: carousel on desktop, stacked or swipeable on mobile

**Component:** `src/components/sections/Testimonials.tsx`

**Animations:** ScrollReveal wrapper (existing pattern). Cards fade in on scroll.

---

## Phase 2: Depth & Credibility

### 2.1 Case Studies

**Purpose:** Convert top projects into detailed narratives that demonstrate problem-solving ability.

**Projects selected:**
1. **Ria Money Transfer** — FinTech, Flutter/iOS, high complexity
2. **EXP Suite** — Enterprise SaaS, web + mobile
3. **MyGate** — PropTech, iOS/Swift, well-known product

**Route:** `/case-study/[slug]` — dynamic route using Next.js App Router.

**Page structure:**
```
├── Hero banner (project image, title, category, tools used)
├── The Problem — what the client/company needed
├── My Approach — architecture decisions, tech choices, team dynamics
├── Key Challenges — interesting technical problems solved
├── Results — metrics (downloads, users, performance) or qualitative impact
├── Back to portfolio link
└── CTA — "Interested in working together? Get in touch"
```

**Data model — new `caseStudies` array in `portfolio.json`:**
```json
{
  "caseStudies": [
    {
      "slug": "ria-money-transfer",
      "title": "Ria Money Transfer",
      "category": "FinTech",
      "tools": "Flutter, iOS, Swift, REST APIs",
      "image": "/images/projects/ria.png",
      "problem": ["Paragraph 1...", "Paragraph 2..."],
      "approach": ["Paragraph 1...", "Paragraph 2..."],
      "challenges": ["Paragraph 1...", "Paragraph 2..."],
      "results": ["Paragraph 1...", "Paragraph 2..."]
    }
  ]
}
```

Note: `tools` uses a comma-separated string to match the existing `projectsData.tools` format. Content sections use `string[]` arrays for multi-paragraph support (matching the `aboutData.paragraphs` pattern).

**Integration with Projects section:** Add optional `caseStudySlug` field to `projectsData` items. Project cards where `caseStudySlug` is set show a "Read Case Study →" link alongside existing live/GitHub links.

**Content:** Draft based on existing project descriptions in portfolio.json — user refines later.

**Component:** `src/app/case-study/[slug]/page.tsx` — server component with dynamic metadata for SEO.

**Styling:** Clean reading layout. Accent-colored section headers. Same theme variables and ScrollReveal animations.

---

### 2.2 Freelance Services Page

**Purpose:** Attract freelance and consulting clients with clear offerings and pricing.

**Route:** `/services`

**Page structure:**
```
├── Hero — "Let's Build Something Together" + short intro
├── Services grid (4 cards)
│   ├── Mobile App Development (iOS, Flutter, React Native)
│   ├── Web App Development (React, Next.js, full-stack)
│   ├── Backend & API Development (Node.js, .NET Core, GraphQL)
│   └── Technical Consulting (architecture, audits, mentoring)
├── Pricing — "$30/hr · Flexible engagement models"
│   └── Note: project-based quotes also available
├── Process — Discovery → Proposal → Build → Deliver
├── CTA — "Say Hello" mailto link (reuse contact pattern)
└── Optional FAQ (3-4 items: engagement length, timezone, NDA)
```

**Data model — new `services` object in `portfolio.json`:**
```json
{
  "services": {
    "headline": "Let's Build Something Together",
    "intro": "14+ years of experience available for your next project.",
    "offerings": [
      {
        "icon": "smartphone",
        "title": "Mobile App Development",
        "description": "Native iOS, Flutter, and React Native apps...",
        "deliverables": ["New app development", "Existing app improvements", "App Store optimization"]
      }
    ],
    "pricing": {
      "hourlyRate": "$30/hr",
      "note": "Project-based quotes available for defined scopes"
    },
    "process": [
      { "step": "Discovery", "description": "Understand your goals and requirements" },
      { "step": "Proposal", "description": "Scope, timeline, and cost estimate" },
      { "step": "Build", "description": "Iterative development with regular updates" },
      { "step": "Deliver", "description": "Launch, handoff, and support" }
    ]
  }
}
```

**Navigation:** Add "Services" to `navLinks` in portfolio.json. Renders in Navbar.

**Component:** `src/app/services/page.tsx`

**Styling:** Consistent with main portfolio — same theme, animations, card patterns.

---

## Phase 3: Content Engine

### 3.1 Blog Infrastructure

**Purpose:** SEO, thought leadership, and content marketing. Infrastructure built now, content written later.

**Routes:**
- `/blog` — listing page
- `/blog/[slug]` — individual post

**Tech approach:** File-based MDX with `next-mdx-remote/rsc` (RSC-compatible version for App Router).
- Posts stored as `.mdx` files in `src/content/blog/`
- Frontmatter for metadata
- Verify `next-mdx-remote` compatibility with Next.js 16 / React 19 during implementation; fall back to `@next/mdx` if needed

**Frontmatter schema:**
```yaml
---
title: "Migrating a native iOS app to Flutter"
date: "2026-03-20"
excerpt: "Lessons learned from rewriting a production iOS app in Flutter"
tags: ["Flutter", "iOS", "Migration"]
readingTime: "5 min"
published: true
---
```

**Blog listing page (`/blog`):**
- Grid of post cards sorted by date (newest first)
- Each card: title, date, excerpt, tags, reading time
- Empty state: "Posts coming soon — check back later" (for initial deploy)
- Client-side pagination if posts exceed 10 (simple "Load More" button — no additional routes needed)

**Post page (`/blog/[slug]`):**
- Title, date, tags, reading time header
- MDX content with code syntax highlighting (use `rehype-pretty-code` or `rehype-highlight`)
- Back link to blog listing
- CTA at bottom: "Get in touch" or related posts

**Navigation:** Add "Blog" to `navLinks` in portfolio.json.

**SEO:**
- Dynamic metadata per post (title, description from excerpt, og:image)
- Auto-add blog posts to `sitemap.ts`

**No database needed** — purely file-based, consistent with the existing architecture.

**Components:**
- `src/app/blog/page.tsx` — listing page
- `src/app/blog/[slug]/page.tsx` — post page
- `src/lib/blog.ts` — utility to read MDX files, parse frontmatter, sort by date

---

## Cross-Cutting Concerns

**Data centralization:** All new content goes into `portfolio.json` (except blog posts which are MDX files). This maintains the existing pattern of decoupled content.

**Admin panel:** Only the availability banner needs admin panel changes. Other content is edited directly in portfolio.json or MDX files.

**Responsive design:** All new sections and pages follow existing responsive patterns (Tailwind breakpoints, mobile-first).

**SEO:** New routes (`/services`, `/case-study/*`, `/blog/*`) added to `sitemap.ts`. Dynamic metadata for all new pages.

**Navigation updates:** Navbar gains "Services" and "Blog" links. Section numbering on main page updates to accommodate Testimonials.

**Navbar link handling:** The current Navbar uses `scrollTo` with `document.querySelector(href)` for all links, which only works for hash anchors (`#about`, `#work`). New page routes (`/services`, `/blog`) require different handling. Add a `type` field to `navLinks` data model:
```json
{ "name": "Services", "href": "/services", "type": "page" }
{ "name": "Blog", "href": "/blog", "type": "page" }
```
Existing links get `"type": "anchor"`. The Navbar click handler uses `scrollTo` for `"anchor"` type and `router.push()` for `"page"` type.

**Data layer updates:** New fields (`availability`, `testimonials`, `caseStudies`, `services`) must be:
- Added to `src/data/portfolio.ts` exports
- Added to the `requiredKeys` array in `/api/admin/data/route.ts`
- Added to the admin panel's `PortfolioData` TypeScript interface

**OG metadata:** All new pages (`/services`, `/case-study/*`, `/blog/*`) include dynamic `<meta>` tags for title, description, and og:image. Case studies and services use project images or a default OG image.

**Theme:** All new components use existing CSS variables. No new design tokens needed.

---

## Out of Scope

- Section reordering / A/B testing (dropped)
- Job scheduler (reverted, not revisiting)
- Authentication changes (existing admin auth is sufficient)
- Database requirements (all file-based)
- Blog content (infrastructure only, content written separately)

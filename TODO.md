# Portfolio Improvement Roadmap

Phased enhancements prioritized by conversion impact — job hunting, freelance leads, and long-term brand building.

---

## Phase 1 — Conversion Boosters

### "Hire Me" Availability Banner
- [ ] Add sticky banner above navbar showing availability status
- [ ] Content: roles, work modes, location, freelance openness
- [ ] Admin panel toggle to show/hide banner
- [ ] Store availability config in portfolio.json
- [ ] Banner disappears entirely when toggled off

### Testimonials / Recommendations Section
- [ ] Add new section between Projects and Tech Stack
- [ ] Pull 5-7 quotes from LinkedIn recommendations
- [ ] Horizontal carousel layout (matching Projects drag pattern)
- [ ] Each card: quote, name, role, company, LinkedIn link
- [ ] Section heading: "07. TESTIMONIALS" — "What People Say"

## Phase 2 — Depth & Credibility

### Case Studies
- [ ] Create `/case-study/[slug]` dynamic route
- [ ] Convert top 3 projects: Ria Money Transfer, EXP Suite, MyGate
- [ ] Page structure: problem, approach, challenges, results
- [ ] Add "Read Case Study →" link on project cards
- [ ] Store case study content in portfolio.json

### Freelance Services Page
- [ ] Create `/services` route
- [ ] 4 service cards: Mobile, Web, Backend, Consulting
- [ ] Pricing: $30/hr with project-based quotes available
- [ ] Process section: Discovery → Proposal → Build → Deliver
- [ ] Add "Services" link to Navbar

## Phase 3 — Content Engine

### Blog Infrastructure
- [ ] Create `/blog` and `/blog/[slug]` routes
- [ ] MDX-based posts in `src/content/blog/` with frontmatter
- [ ] Blog listing page with post cards (title, date, excerpt, tags)
- [ ] Clean reading layout with code syntax highlighting
- [ ] Add "Blog" link to Navbar
- [ ] SEO: sitemap entries and per-post meta tags

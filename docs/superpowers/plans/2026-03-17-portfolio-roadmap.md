# Portfolio Roadmap Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 features across 3 phases — availability banner, testimonials, case studies, services page, and blog — to maximize portfolio conversion for jobs, freelance, and brand building.

**Architecture:** All content centralized in `portfolio.json` (except blog posts as MDX files). New pages use Next.js App Router. Existing patterns (ScrollReveal, theme variables, draggable carousel) are reused throughout.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Framer Motion, next-mdx-remote/rsc, rehype-pretty-code, @tailwindcss/typography

**Important conventions:**
- Use Tailwind theme classes (`text-accent`, `bg-surface`, `text-muted`, `text-foreground`, `border-border`, `bg-surface-hover`) — NOT raw CSS variable syntax (`text-[var(--accent)]`). The project defines these via `@theme` in `globals.css`.
- Match existing section header pattern from `Projects.tsx`: `font-mono text-[13px] font-semibold tracking-[2px] text-accent` for labels, gradient h2, `h-0.5 w-[60px] bg-accent` divider.
- New standalone pages (`/services`, `/case-study/*`, `/blog/*`) must include `<Navbar />` and `<Footer />` for consistent navigation.
- Use `<Link>` from `next/link` for internal navigation — not `<a href>`.
- All new portfolio.json modifications in later tasks must merge into the current file state, not apply fixed patches.

**Spec:** `docs/superpowers/specs/2026-03-17-portfolio-roadmap-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `src/components/ui/AvailabilityBanner.tsx` | Sticky hire-me banner |
| `src/components/sections/Testimonials.tsx` | Testimonials carousel section |
| `src/app/case-study/[slug]/page.tsx` | Case study detail page |
| `src/app/services/page.tsx` | Freelance services page |
| `src/app/blog/page.tsx` | Blog listing page |
| `src/app/blog/[slug]/page.tsx` | Blog post page |
| `src/lib/blog.ts` | MDX file reader + frontmatter parser |
| `src/content/blog/.gitkeep` | Placeholder for blog posts directory |

### Modified Files
| File | Changes |
|------|---------|
| `src/data/portfolio.json` | Add availability, testimonials, caseStudies, services data; update sectionHeadings, navLinks, projectsData |
| `src/data/portfolio.ts` | Add exports for new data fields |
| `src/components/ui/Navbar.tsx` | Handle both anchor and page link types |
| `src/app/page.tsx` | Insert Testimonials section |
| `src/app/api/admin/data/route.ts` | Add new fields to requiredKeys |
| `src/app/admin-panel-9x7k/page.tsx` | Add availability types + editor UI |
| `src/app/sitemap.ts` | Add dynamic routes for new pages |
| `src/components/sections/Projects.tsx` | Add caseStudySlug link rendering |
| `package.json` | Add next-mdx-remote, rehype-pretty-code, gray-matter, @tailwindcss/typography deps |

---

## Task 1: Data Layer Foundation

**Files:**
- Modify: `src/data/portfolio.json`
- Modify: `src/data/portfolio.ts`
- Modify: `src/app/api/admin/data/route.ts`

This task adds all new data fields and exports. Every subsequent task depends on this.

- [ ] **Step 1: Add availability data to portfolio.json**

Add after the last existing top-level field (before closing `}`):

```json
"availability": {
  "isAvailable": true,
  "roles": "Senior/Lead roles",
  "domains": "Full Stack & Mobile",
  "location": "Munich (onsite/hybrid) or Remote",
  "freelance": true
},
"testimonials": [],
"caseStudies": [],
"services": {
  "headline": "Let's Build Something Together",
  "intro": "14+ years of experience building mobile and web products — available for your next project.",
  "offerings": [
    {
      "icon": "smartphone",
      "title": "Mobile App Development",
      "description": "Native iOS, Flutter, and React Native apps from concept to App Store.",
      "deliverables": ["New app development", "Existing app improvements", "App Store optimization"]
    },
    {
      "icon": "globe",
      "title": "Web App Development",
      "description": "React and Next.js applications with modern UI and performance.",
      "deliverables": ["Full-stack web apps", "Landing pages", "Admin dashboards"]
    },
    {
      "icon": "server",
      "title": "Backend & API Development",
      "description": "Node.js, .NET Core, and GraphQL APIs built for scale.",
      "deliverables": ["REST & GraphQL APIs", "Database design", "Third-party integrations"]
    },
    {
      "icon": "users",
      "title": "Technical Consulting",
      "description": "Architecture reviews, code audits, and tech stack guidance.",
      "deliverables": ["Architecture reviews", "Code audits", "Team mentoring"]
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
```

- [ ] **Step 2: Update sectionHeadings in portfolio.json**

Update the `sectionHeadings` object — add `testimonials`, renumber `techStack` and `contact`:

```json
"testimonials": { "label": "05. TESTIMONIALS", "title": "What People Say" },
"techStack": { "label": "06. TECH STACK", "title": "Tools & Technologies" },
"contact": { "label": "07. CONTACT", "title": "Get In Touch" }
```

- [ ] **Step 3: Update navLinks in portfolio.json**

Add `type` field to existing links and add new links:

```json
"navLinks": [
  { "label": "About", "href": "#about", "type": "anchor" },
  { "label": "Work", "href": "#work", "type": "anchor" },
  { "label": "Services", "href": "/services", "type": "page" },
  { "label": "Blog", "href": "/blog", "type": "page" },
  { "label": "Contact", "href": "#contact", "type": "anchor" }
]
```

- [ ] **Step 4: Add exports to portfolio.ts**

Add these lines to `src/data/portfolio.ts`:

```typescript
export const availability = data.availability;
export const testimonials = data.testimonials;
export const caseStudies = data.caseStudies;
export const services = data.services;
```

- [ ] **Step 5: Add new fields to requiredKeys in route.ts**

In `src/app/api/admin/data/route.ts`, add to the `requiredKeys` array:

```typescript
"availability",
"testimonials",
"caseStudies",
"services",
```

- [ ] **Step 6: Verify the app builds**

Run: `npm run build`
Expected: Build succeeds (new data is added but not yet consumed by components)

- [ ] **Step 7: Commit**

```bash
git add src/data/portfolio.json src/data/portfolio.ts src/app/api/admin/data/route.ts
git commit -m "feat: add data layer for availability, testimonials, case studies, and services"
```

---

## Task 2: Navbar — Handle Page Routes

**Files:**
- Modify: `src/components/ui/Navbar.tsx`

The Navbar currently uses `scrollTo` with `document.querySelector(href)` for all links. New page routes (`/services`, `/blog`) need `router.push()` instead.

- [ ] **Step 1: Update scrollTo function to handle link types**

In `src/components/ui/Navbar.tsx`, update the `scrollTo` function and link rendering. Import `useRouter` from `next/navigation`. Update the click handler to check if `href` starts with `/` (page route) or `#` (anchor):

```typescript
import { useRouter } from "next/navigation";
```

Inside the component, add:
```typescript
const router = useRouter();
```

Replace the `scrollTo` function:
```typescript
const handleNavClick = (href: string, type: string) => {
  if (type === "page") {
    router.push(href);
  } else {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
  setMenuOpen(false);
};
```

Update the navLink rendering to pass `type`:
```tsx
{navLinks.map((link) => (
  <button
    key={link.label}
    onClick={() => handleNavClick(link.href, link.type)}
    ...
  >
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Navbar.tsx
git commit -m "feat: update navbar to handle both anchor and page route links"
```

---

## Task 3: Availability Banner

**Files:**
- Create: `src/components/ui/AvailabilityBanner.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/admin-panel-9x7k/page.tsx`

- [ ] **Step 1: Create AvailabilityBanner component**

Create `src/components/ui/AvailabilityBanner.tsx`:

```tsx
"use client";

import { availability } from "@/data/portfolio";

export function AvailabilityBanner() {
  if (!availability.isAvailable) return null;

  const parts = [availability.roles, availability.domains, availability.location];
  if (availability.freelance) parts.push("Also open to freelance");
  const message = parts.join(" · ");

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] w-full bg-accent text-white text-center py-2 px-4 text-sm">
      <span className="inline-flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span><span className="font-medium">Available for hire</span> — {message}</span>
      </span>
    </div>
  );
}
```

Note: Uses `fixed` (not `sticky`) to stay visible on scroll. `z-[60]` places it above the Navbar (`z-50`). The glow-pulse animation is applied only to a small dot indicator, not the entire banner.

- [ ] **Step 2: Add banner to main page and offset Navbar**

In `src/app/page.tsx`, import and render above `<Navbar />`:

```tsx
import { AvailabilityBanner } from "@/components/ui/AvailabilityBanner";
```

Add `<AvailabilityBanner />` as the first child inside the wrapping div, before `<Navbar />`.

In `src/components/ui/Navbar.tsx`, adjust the Navbar's `top` position to account for the banner height (~36px). Change `top-0` to `top-9` (36px) when banner is active. Import `availability` from data and conditionally apply: `className={... ${availability.isAvailable ? "top-9" : "top-0"} ...}`.

- [ ] **Step 3: Update admin panel types**

In `src/app/admin-panel-9x7k/page.tsx`, add to the TypeScript interfaces:

```typescript
interface Availability {
  isAvailable: boolean;
  roles: string;
  domains: string;
  location: string;
  freelance: boolean;
}
```

Update the existing `NavLink` interface to include `type`:
```typescript
interface NavLink {
  label: string;
  href: string;
  type: "anchor" | "page";
}
```

Add to `PortfolioData` interface:
```typescript
availability: Availability;
testimonials: unknown[];
caseStudies: unknown[];
services: unknown;
```

Also update the `NavLinksEditor` component to preserve the `type` field when editing (render it as a read-only badge or a dropdown select for anchor/page).

- [ ] **Step 4: Add availability editor to admin panel**

Add a simple toggle section to the admin panel (after the SiteConfigEditor). Shows an on/off toggle for `isAvailable` and editable text fields for `roles`, `domains`, `location`, and a checkbox for `freelance`.

- [ ] **Step 5: Verify locally**

Run: `npm run dev`
Check:
- Banner shows at top of page with accent color
- Banner disappears when `isAvailable` is set to `false` in portfolio.json
- Admin panel shows availability toggle

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/AvailabilityBanner.tsx src/app/page.tsx src/app/admin-panel-9x7k/page.tsx
git commit -m "feat: add hire-me availability banner with admin panel toggle"
```

---

## Task 4: Testimonials Section

**Files:**
- Create: `src/components/sections/Testimonials.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create Testimonials component**

Create `src/components/sections/Testimonials.tsx` using the same draggable carousel pattern from `Projects.tsx`:

```tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaLinkedin } from "react-icons/fa";
import { testimonials, sectionHeadings } from "@/data/portfolio";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Testimonials() {
  // Hooks must be called before any early returns (Rules of Hooks)
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  useEffect(() => {
    if (trackRef.current) {
      setDragConstraint(trackRef.current.scrollWidth - trackRef.current.offsetWidth);
    }
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  const { label, title } = sectionHeadings.testimonials;

  return (
    <section id="testimonials" className="py-24 px-6 md:px-20 overflow-hidden">
      <ScrollReveal>
        {/* Section header — matches exact pattern from Projects.tsx */}
        <p className="font-mono text-[13px] font-semibold tracking-[2px] text-accent mb-2">{label}</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-2"
            style={{ backgroundImage: "linear-gradient(to right, var(--foreground), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {title}
        </h2>
        <div className="h-0.5 w-[60px] bg-accent mb-10" />
      </ScrollReveal>

      <motion.div
        ref={trackRef}
        className="flex cursor-grab gap-6"
        drag="x"
        dragConstraints={{ left: -dragConstraint, right: 0 }}
        dragElastic={0.1}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            className="min-w-[320px] md:min-w-[400px] bg-surface border border-border rounded-xl p-6 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <p className="text-foreground italic leading-relaxed mb-6">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted">{t.role}, {t.company}</p>
              </div>
              {t.linkedinUrl && (
                <a href={t.linkedinUrl} target="_blank" rel="noopener noreferrer"
                   className="text-accent hover:text-accent-hover transition-colors">
                  <FaLinkedin size={20} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
```

Note: Hooks are called before the early return (fixes Rules of Hooks). Carousel uses the same single-div drag pattern as Projects.tsx. Section header matches Projects.tsx exactly (font-mono label, gradient h2, accent divider). Uses theme classes (`text-accent`, `bg-surface`, etc.) not raw CSS vars.

- [ ] **Step 2: Add Testimonials to main page**

In `src/app/page.tsx`, import and add between `<Projects />` and `<TechStack />`:

```tsx
import { Testimonials } from "@/components/sections/Testimonials";
```

Insert `<Testimonials />` after `<Projects />`.

- [ ] **Step 3: Add placeholder testimonials to portfolio.json**

Add 3-5 placeholder testimonials to the `testimonials` array in `portfolio.json`. These will be replaced with real LinkedIn recommendations:

```json
"testimonials": [
  {
    "name": "Placeholder Name",
    "role": "Engineering Manager",
    "company": "Company",
    "quote": "Placeholder quote — replace with real LinkedIn recommendation.",
    "linkedinUrl": ""
  }
]
```

Note: User will provide real testimonial data from LinkedIn to replace placeholders.

- [ ] **Step 4: Verify locally**

Run: `npm run dev`
Check:
- Testimonials section appears between Projects and Tech Stack
- Carousel is draggable
- Section is hidden when array is empty
- Section numbering is correct (05 Testimonials, 06 Tech Stack, 07 Contact)

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/Testimonials.tsx src/app/page.tsx src/data/portfolio.json
git commit -m "feat: add testimonials section with draggable carousel"
```

---

## Task 5: Case Studies

**Files:**
- Create: `src/app/case-study/[slug]/page.tsx`
- Modify: `src/data/portfolio.json` (add caseStudies data)
- Modify: `src/components/sections/Projects.tsx` (add case study links)
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Add case study data to portfolio.json**

Add 3 case studies to the `caseStudies` array. Draft content based on existing project descriptions — structure each with problem/approach/challenges/results as `string[]`:

```json
"caseStudies": [
  {
    "slug": "ria-money-transfer",
    "title": "Ria Money Transfer",
    "category": "FinTech",
    "tools": "Flutter, iOS, Swift, REST APIs, CI/CD",
    "image": "/images/projects/ria.png",
    "problem": [
      "Ria Money Transfer needed a reliable, high-performance mobile app serving millions of users across 160+ countries for international remittances.",
      "The existing native iOS codebase required modernization while maintaining strict financial compliance and security standards."
    ],
    "approach": [
      "Led the Flutter migration strategy to unify iOS and Android codebases while preserving the native iOS app for legacy users.",
      "Implemented secure transaction flows with biometric authentication, real-time exchange rates, and multi-currency support.",
      "Set up CI/CD pipelines for automated testing and deployment across both platforms."
    ],
    "challenges": [
      "Ensuring zero-downtime migration from native iOS to Flutter without disrupting active users or transaction flows.",
      "Meeting stringent financial regulatory requirements across multiple jurisdictions while maintaining app performance."
    ],
    "results": [
      "Successfully serving millions of users across 160+ countries with reliable cross-border money transfers.",
      "Unified codebase reduced development time and enabled faster feature releases across platforms."
    ]
  }
]
```

Add similar entries for EXP Suite and MyGate (draft from existing project descriptions).

- [ ] **Step 2: Add caseStudySlug to relevant projectsData items**

In `portfolio.json`, add `"caseStudySlug": "ria-money-transfer"` to the Ria project, `"caseStudySlug": "exp-suite"` to EXP Suite, and `"caseStudySlug": "mygate"` to MyGate.

- [ ] **Step 3: Create case study page component**

Create `src/app/case-study/[slug]/page.tsx`. Include `<Navbar />` and `<Footer />` for consistent navigation:

```tsx
import { caseStudies, siteConfig } from "@/data/portfolio";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return {};
  return {
    title: `${cs.title} — Case Study | ${siteConfig.name}`,
    description: cs.problem[0],
    openGraph: {
      title: `${cs.title} — Case Study`,
      description: cs.problem[0],
      images: [cs.image],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) notFound();

  const sections = [
    { title: "The Problem", content: cs.problem },
    { title: "My Approach", content: cs.approach },
    { title: "Key Challenges", content: cs.challenges },
    { title: "Results", content: cs.results },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-20">
        {/* Hero */}
        <div className="relative py-20 px-6 md:px-20">
          <Link href="/#work" className="text-accent hover:underline text-sm mb-8 inline-block">
            ← Back to Projects
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{cs.title}</h1>
          <p className="text-accent text-lg mb-2">{cs.category}</p>
          <p className="text-muted">{cs.tools}</p>
        </div>

        {/* Content sections */}
        <div className="px-6 md:px-20 pb-20 max-w-4xl">
          {sections.map((section) => (
            <div key={section.title} className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-accent">{section.title}</h2>
              {section.content.map((p, i) => (
                <p key={i} className="text-muted leading-relaxed mb-4">{p}</p>
              ))}
            </div>
          ))}

          {/* CTA */}
          <div className="mt-16 p-8 bg-surface border border-border rounded-xl text-center">
            <p className="text-xl font-semibold mb-4">Interested in working together?</p>
            <a href={`mailto:${siteConfig.email}`}
               className="inline-block bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent-hover transition-colors">
              Get in Touch
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Add case study link to Projects section**

In `src/components/sections/Projects.tsx`, update project card rendering to show "Read Case Study →" link when `caseStudySlug` exists:

Import `Link` from `next/link` at the top of Projects.tsx, then:

```tsx
{project.caseStudySlug && (
  <Link href={`/case-study/${project.caseStudySlug}`}
        className="text-accent hover:underline text-sm mt-2 inline-block">
    Read Case Study →
  </Link>
)}
```

- [ ] **Step 5: Update sitemap**

In `src/app/sitemap.ts`, import `caseStudies` and add dynamic entries:

```typescript
import { caseStudies } from "@/data/portfolio";

// Add inside the returned array:
...caseStudies.map((cs) => ({
  url: `${baseUrl}/case-study/${cs.slug}`,
  lastModified: new Date(),
  priority: 0.7,
})),
```

- [ ] **Step 6: Verify locally**

Run: `npm run dev`
Check:
- `/case-study/ria-money-transfer` renders correctly
- Project cards show "Read Case Study →" link
- Back link returns to projects section
- Build succeeds: `npm run build`

- [ ] **Step 7: Commit**

```bash
git add src/app/case-study src/data/portfolio.json src/components/sections/Projects.tsx src/app/sitemap.ts
git commit -m "feat: add case study pages for top 3 projects"
```

---

## Task 6: Freelance Services Page

**Files:**
- Create: `src/app/services/page.tsx`
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Create services page**

Create `src/app/services/page.tsx`. Include `<Navbar />` and `<Footer />`:

```tsx
import { services, siteConfig } from "@/data/portfolio";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import type { Metadata } from "next";
import { FiSmartphone, FiGlobe, FiServer, FiUsers } from "react-icons/fi";

export const metadata: Metadata = {
  title: `Services | ${siteConfig.name}`,
  description: services.intro,
  openGraph: {
    title: `Freelance Services — ${siteConfig.name}`,
    description: services.intro,
  },
};

const iconMap: Record<string, React.ElementType> = {
  smartphone: FiSmartphone,
  globe: FiGlobe,
  server: FiServer,
  users: FiUsers,
};

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-20">
        {/* Hero */}
        <div className="py-20 px-6 md:px-20 text-center">
          <Link href="/" className="text-accent hover:underline text-sm mb-8 inline-block">
            ← Back to Portfolio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{services.headline}</h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">{services.intro}</p>
        </div>

        {/* Service cards */}
        <div className="px-6 md:px-20 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {services.offerings.map((offering) => {
              const Icon = iconMap[offering.icon] || FiGlobe;
              return (
                <div key={offering.title}
                     className="bg-surface border border-border rounded-xl p-8">
                  <Icon className="text-accent mb-4" size={32} />
                  <h3 className="text-xl font-semibold mb-3">{offering.title}</h3>
                  <p className="text-muted mb-4">{offering.description}</p>
                  <ul className="space-y-1">
                    {offering.deliverables.map((d) => (
                      <li key={d} className="text-sm text-muted">• {d}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div className="px-6 md:px-20 pb-16 text-center">
          <div className="bg-surface border border-border rounded-xl p-10 max-w-2xl mx-auto">
            <p className="text-3xl font-bold text-accent mb-2">{services.pricing.hourlyRate}</p>
            <p className="text-muted">{services.pricing.note}</p>
          </div>
        </div>

        {/* Process */}
        <div className="px-6 md:px-20 pb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {services.process.map((step, i) => (
              <div key={step.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-3 font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1">{step.step}</h3>
                <p className="text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 md:px-20 pb-20 text-center">
          <a href={`mailto:${siteConfig.email}`}
             className="inline-block bg-accent text-white px-8 py-3 rounded-lg hover:bg-accent-hover transition-colors text-lg">
            Say Hello
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

**Deferred:** Optional FAQ section (3-4 items on engagement length, timezone, NDA). Add when real client questions emerge — avoid speculative content.

- [ ] **Step 2: Add services to sitemap**

In `src/app/sitemap.ts`, add:

```typescript
{
  url: `${baseUrl}/services`,
  lastModified: new Date(),
  priority: 0.8,
},
```

- [ ] **Step 3: Verify locally**

Run: `npm run dev`
Check:
- `/services` renders correctly with 4 service cards
- Pricing section shows $30/hr
- Process steps render in order
- Navbar "Services" link navigates to the page
- Build succeeds: `npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/app/services src/app/sitemap.ts
git commit -m "feat: add freelance services page with pricing and process"
```

---

## Task 7: Blog Infrastructure

**Files:**
- Create: `src/lib/blog.ts`
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `src/content/blog/.gitkeep`
- Modify: `src/app/sitemap.ts`
- Modify: `package.json` (add dependencies)

- [ ] **Step 1: Install blog dependencies**

```bash
npm install next-mdx-remote gray-matter rehype-pretty-code shiki @tailwindcss/typography
```

If `next-mdx-remote` has compatibility issues with Next.js 16, fall back to `@next/mdx`:
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react
```

Add the typography plugin import to `src/app/globals.css` (Tailwind v4 uses CSS imports):
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

- [ ] **Step 2: Create blog content directory**

```bash
mkdir -p src/content/blog
touch src/content/blog/.gitkeep
```

- [ ] **Step 3: Create blog utility**

Create `src/lib/blog.ts`:

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
  published: boolean;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const filePath = path.join(BLOG_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        excerpt: data.excerpt || "",
        tags: data.tags || [],
        readingTime: data.readingTime || "",
        published: data.published !== false,
        content,
      };
    })
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find((p) => p.slug === slug) || null;
}
```

- [ ] **Step 4: Create blog listing page**

Create `src/app/blog/page.tsx`. Include `<Navbar />` and `<Footer />`:

```tsx
import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/data/portfolio";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Blog | ${siteConfig.name}`,
  description: `Articles on mobile development, web technologies, and software engineering by ${siteConfig.name}.`,
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="py-20 px-6 md:px-20 max-w-4xl mx-auto">
          <Link href="/" className="text-accent hover:underline text-sm mb-8 inline-block">
            ← Back to Portfolio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-muted text-lg mb-12">
            Thoughts on mobile development, web technologies, and software engineering.
          </p>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg">Posts coming soon — check back later.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                      className="block bg-surface border border-border rounded-xl p-6 hover:bg-surface-hover transition-colors">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-muted mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>{post.date}</span>
                    <span>{post.readingTime}</span>
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-accent">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Create blog post page**

Create `src/app/blog/[slug]/page.tsx`. Include `<Navbar />` and `<Footer />`:

```tsx
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/data/portfolio";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | ${siteConfig.name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <article className="py-20 px-6 md:px-20 max-w-3xl mx-auto">
          <Link href="/blog" className="text-accent hover:underline text-sm mb-8 inline-block">
            ← Back to Blog
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted mb-12">
            <span>{post.date}</span>
            <span>{post.readingTime}</span>
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-accent">#{tag}</span>
              ))}
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
                },
              }}
            />
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 bg-surface border border-border rounded-xl text-center">
            <p className="text-lg font-semibold mb-4">Enjoyed this article?</p>
            <a href={`mailto:${siteConfig.email}`}
               className="inline-block bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors">
              Get in Touch
            </a>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
```

Note: Uses `prose dark:prose-invert` (not just `prose-invert`) so light mode gets correct prose colors. Requires `@tailwindcss/typography` installed in Step 1.

- [ ] **Step 6: Update sitemap for blog**

In `src/app/sitemap.ts`, import `getAllPosts` and add:

```typescript
import { getAllPosts } from "@/lib/blog";

// Add inside the returned array:
{
  url: `${baseUrl}/blog`,
  lastModified: new Date(),
  priority: 0.7,
},
...getAllPosts().map((post) => ({
  url: `${baseUrl}/blog/${post.slug}`,
  lastModified: new Date(),
  priority: 0.6,
})),
```

**Deferred:** Client-side "Load More" pagination when posts exceed 10. Not needed until content exists — add when first 10+ posts are published.

- [ ] **Step 7: Verify locally**

Run: `npm run dev`
Check:
- `/blog` shows empty state message
- Navbar "Blog" link navigates to the page
- Build succeeds: `npm run build`

- [ ] **Step 8: Commit**

```bash
git add src/lib/blog.ts src/app/blog src/content/blog/.gitkeep src/app/sitemap.ts package.json package-lock.json
git commit -m "feat: add blog infrastructure with MDX support"
```

---

## Task 8: Final Integration & Cleanup

**Files:**
- Modify: `src/app/layout.tsx` (optional: update jsonLd)
- Review: all new pages for theme consistency

- [ ] **Step 1: Verify all routes work**

Run: `npm run build && npm run start`
Check each route:
- `/` — main page with availability banner + testimonials section
- `/services` — services page with 4 cards and pricing
- `/case-study/ria-money-transfer` — case study renders
- `/blog` — blog listing with empty state
- `/resume` — still works unchanged

- [ ] **Step 2: Verify admin panel**

Run: `npm run dev`
Navigate to `/admin-panel-9x7k`:
- Availability toggle works
- Save does not lose new data fields

- [ ] **Step 3: Verify responsive design**

Check all new pages at mobile (375px), tablet (768px), and desktop (1280px) viewports.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete portfolio roadmap phase 1-3 implementation"
```

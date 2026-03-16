# Portfolio Content Redesign — Design Spec

**Author:** Anil Khanna
**Date:** 2026-03-15
**Status:** Approved
**Goal:** Rewrite portfolio content to convert hiring managers and attract freelance leads

---

## 1. Strategy

**Primary audience:** Hiring managers in Munich looking for Senior/Lead mobile or full stack developers
**Secondary audience:** Freelance/consulting clients
**Positioning:** The versatile engineer — iOS, Flutter, React, full stack

Every content change optimizes for a 30-second scan by a recruiter.

---

## 2. Hero

**Current → Proposed:**

| JSON Field | Current | New |
|------------|---------|-----|
| `siteConfig.greeting` | "Hi, my name is" | "I'm" |
| `siteConfig.name` | "Anil Khanna" | "Anil Khanna" (keep — renders as `{greeting} {name}.` in Hero) |
| `siteConfig.title` | "Senior Full Stack Developer" | "Senior Full Stack Developer" (keep) |
| `siteConfig.description` | "I build things that live in your pocket and on your screen." | "From native iOS to Flutter to React — I ship production apps across every screen." |

**How it renders:** The Hero component (`src/components/sections/Hero.tsx`) renders `greeting` on line 50 as accent text, then `name` on line 66 as a large gradient heading. Setting greeting to "I'm" produces: "I'm" (accent) + "Anil Khanna." (heading) — which reads naturally as "I'm Anil Khanna."

---

## 3. About

**New copy (3 paragraphs):**

> "14+ years shipping mobile and web products — from startup MVPs to enterprise platforms serving millions. I've built native iOS apps in Swift, cross-platform apps in Flutter, and modern web applications in React and Next.js, backed by .NET Core and Node.js APIs."
>
> "I've co-founded a startup that scaled to 200k+ active users, led engineering teams of up to 14 developers, and delivered apps for brands like Ria Money Transfer, 1-800-Flowers, and CES. Currently based in Munich, building Flutter and React apps at Euronet Worldwide."
>
> "Open to senior and lead roles in mobile, full stack, or frontend — remote, hybrid, or onsite in Munich."

---

## 4. What I Do

**MOBILE APPS:**
> "Built and shipped iOS and Flutter apps used by millions — from fintech payment flows to retail inventory systems. I own the full lifecycle: architecture, development, performance tuning, and App Store delivery."

**WEB APPS:**
> "Production web applications in React and Next.js — secure portals, admin dashboards, and customer-facing platforms. I build for performance, accessibility, and real users at scale."

**BACKEND & APIs:**
> "APIs and services in .NET Core and Node.js that power the apps above. Designed for reliability, clean contracts, and teams that need to move fast without breaking things."

**TEAM & DELIVERY:**
> "Led teams of up to 14 engineers, established code review practices, and drove Agile delivery with 95% on-time shipping. I mentor developers and build the processes that let teams deliver consistently."

---

## 5. Career

**Title changes:**
- "Software Developer" → "Senior Flutter Developer"
- "SDE-III" → "Senior iOS Developer"

**Updated descriptions:**

**Senior Flutter Developer — transact/Euronet (Feb 2022 - Present):**
> "Building the DM stock management app end-to-end on Flutter for one of Germany's largest retail chains (3,800+ stores). Reduced app launch time by 20% through API contract optimization. Driving technical decisions and mentoring developers across the mobile stack."

**Senior iOS Developer — MyGate (Jan 2020 - Jan 2022):**
> "Led iOS development for India's largest gated community platform — 1M+ active users, 25k+ residential societies. Owned architecture, API design, performance profiling, and release management. Architected the core security and visitor management modules."

**CoFounder & Mobile Lead — Hefty Innovations (Oct 2018 - Dec 2020):**
> "Co-founded a mobile-first startup, built the engineering team, and scaled to 200k+ active users. Redesigned the app architecture for 30% faster time-to-market. Defined product roadmaps and led engineering alongside co-founders."

**Senior Software Engineer — EX2 Solutions (Feb 2017 - Oct 2018):**
> "Built enterprise EH&S compliance apps for global clients including offline-first iOS and Flutter architecture for field workers in low-connectivity environments. Delivered incident reporting, audit, and safety inspection modules."

**Mobile Lead — Mobikasa (Jun 2015 - Jan 2017):**
> "Led 14 developers across 10+ iOS projects in e-commerce and fitness verticals. Achieved 95% on-time delivery rate. Established code review practices and modular architecture patterns adopted as the team standard."

**PRM Technologies and WeirdLogics:** Keep as-is.

---

## 6. Projects

**New order (Flutter/React first):**

1. **Ria Money Transfer** — FinTech — Flutter, iOS, API Integration
   Keep existing description.

2. **RMT Secure Portal** — FinTech — React, Next.js, TypeScript, API Integration
   Keep existing description.

3. **EXP Suite Web & Mobile** — Enterprise EH&S — Next.js, React Native, Turborepo, Tailwind, NativeWind — **ADD NEW ENTRY**
   > "Cross-platform rebuild of the EXP Suite enterprise platform using a Turborepo monorepo — Next.js for web, React Native with NativeWind for mobile. Unified codebase serving both platforms with shared business logic and consistent UI."
   - Live URL: https://demo2.exp-inc.com/
   - Image: `null` (no screenshot available yet)
   - GitHub: "#"

4. **EXP Suite 7.0** — Enterprise EH&S — Flutter, Dart — **RENAME & UPDATE existing "EXP Suite" entry**
   Rename title from "EXP Suite" to "EXP Suite 7.0". Change tools from "iOS, Swift, Objective-C" to "Flutter, Dart". The app was originally native iOS but was rebuilt in Flutter.
   > "Enterprise EH&S compliance platform rebuilt in Flutter for cross-platform delivery. Offline-first architecture enables field workers to capture incidents, audits, and inspections without connectivity."
   Live URL: https://apps.apple.com/us/app/exp-suite-7-0/id1568060604 (keep existing)

5. **MyGate** — PropTech — iOS, Swift, API Integration
   Keep existing description.

6. **1-800-Flowers** — E-Commerce — iOS, Swift
   Keep existing description.

7. **CES Official App** — Events — iOS, Objective-C
   Keep existing description.

8. **Eventa** — Events Management — iOS, Swift
   Keep existing description.

**Removed:** Performix, CoFetch (no images, no live URLs).

---

## 7. Section Headings

| Section | Current | New |
|---------|---------|-----|
| What I Do | "What I Bring to the Table" | "What I Do" |
| Career | "Career & Milestones" | "Where I've Worked" |
| All others | (unchanged) | (unchanged) |

---

## 8. Contact

The contact description is **hardcoded in JSX** at `src/components/sections/Contact.tsx` lines 33-34, not driven by portfolio.json. This requires a direct edit to the component.

**File:** `src/components/sections/Contact.tsx`
**Lines 33-34, replace:**
```
I&apos;m currently open to new opportunities. Whether you have a
question or just want to say hi, my inbox is always open.
```
**With:**
```
I&apos;m open to senior and lead roles in Munich (onsite/hybrid) or
remote. Looking for teams that build mobile or full stack products
at scale. Have a role in mind? Let&apos;s talk.
```

**Add a second `<p>` below it:**
```
Also available for freelance and consulting engagements.
```

---

## 9. Alt Title & Meta

**Alt title:** "Mobile & Web Tech Lead" → "iOS · Flutter · React · Full Stack"

**Meta description:** "Anil Khanna — Senior Full Stack Developer with 14+ years shipping iOS, Flutter, React, and .NET applications. Based in Munich. Open to senior and lead roles."

---

## 10. Unchanged Sections

These JSON fields were reviewed and require no changes:
- `navLinks` — keep as-is
- `socialLinks` — keep as-is
- `techStack` — keep as-is (order and contents are fine)
- `educationData` — keep as-is
- `certifications` — keep as-is (empty array)
- `aboutData.heading` — keep as "About Me"

---

## 11. Implementation

**Files to modify:**
- `src/data/portfolio.json` — all content changes (hero, about, whatIDo, career, projects, section headings, altTitle)
- `src/app/layout.tsx` — meta description, OG description, Twitter description
- `src/components/sections/Contact.tsx` — hardcoded contact copy (lines 33-34)

**Project numbering:** Renumber all project `number` fields ("01" through "08") to match the new order.

**OG/Twitter meta:** Update OpenGraph and Twitter descriptions in `layout.tsx` to match the new meta description:
> "Anil Khanna — Senior Full Stack Developer with 14+ years shipping iOS, Flutter, React, and .NET applications. Based in Munich. Open to senior and lead roles."

# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal portfolio site with Next.js 15, React 19, Tailwind CSS, Framer Motion, and a lightweight Three.js hero scene with dark/light theme toggle.

**Architecture:** Single-page scrolling layout using Next.js App Router. All sections are client components composed in a single `page.tsx`. Portfolio content is centralized in `data/portfolio.ts` for easy editing. 3D scene is dynamically imported with SSR disabled.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion, React Three Fiber, @react-three/drei, next-themes, react-icons

**Spec:** `docs/superpowers/specs/2026-03-12-portfolio-site-design.md`

---

## Chunk 1: Project Setup & Foundation

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create Next.js app with Tailwind**

```bash
cd /Users/a.khanna/Data/Personal/portfolio
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion @react-three/fiber @react-three/drei three next-themes react-icons
npm install -D @types/three
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```
Expected: Server starts on localhost:3000 without errors.

- [ ] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 15 project with dependencies"
```

---

### Task 2: Theme provider and global styles

**Files:**
- Create: `src/components/providers/ThemeProvider.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create ThemeProvider**

```tsx
// src/components/providers/ThemeProvider.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 2: Update globals.css with base theme variables and styles**

Replace the default `globals.css` content with Tailwind directives and custom CSS variables for dark/light themes. Define:
- `--background`, `--foreground` colors for each theme
- `--accent` color
- Smooth scroll behavior on `html`
- Base body styles

- [ ] **Step 3: Update layout.tsx to wrap with ThemeProvider**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Personal Portfolio Website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify theme toggle works (manual)**

Add a temporary button in `page.tsx` that calls `setTheme()`. Confirm dark/light switches.

- [ ] **Step 5: Commit**

```bash
git add src/components/providers/ThemeProvider.tsx src/app/layout.tsx src/app/globals.css
git commit -m "feat: add theme provider with dark/light support"
```

---

### Task 3: Portfolio data file

**Files:**
- Create: `src/data/portfolio.ts`

- [ ] **Step 1: Create portfolio data with placeholder content**

```tsx
// src/data/portfolio.ts
export const siteConfig = {
  name: "Your Name",
  title: "Full Stack Developer",
  description: "I build things for the web.",
  email: "hello@example.com",
  location: "City, Country",
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Career", href: "#career" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export const socialLinks = [
  { name: "GitHub", url: "https://github.com", icon: "FaGithub" },
  { name: "LinkedIn", url: "https://linkedin.com", icon: "FaLinkedin" },
  { name: "Twitter", url: "https://twitter.com", icon: "FaTwitter" },
];

export const aboutData = {
  heading: "About Me",
  paragraphs: [
    "Placeholder paragraph 1 about yourself.",
    "Placeholder paragraph 2 about your passion.",
  ],
};

export const techStack = [
  "React", "Next.js", "TypeScript", "Node.js", "Python",
  "Tailwind CSS", "PostgreSQL", "Docker", "AWS", "Git",
];

export const whatIDo = [
  {
    title: "Frontend Development",
    description: "Building responsive and interactive web applications.",
    icon: "FaCode",
  },
  {
    title: "Backend Development",
    description: "Designing scalable server-side architectures.",
    icon: "FaServer",
  },
  {
    title: "UI/UX Design",
    description: "Creating intuitive and beautiful user experiences.",
    icon: "FaPaintBrush",
  },
];

export const careerData = [
  {
    role: "Senior Developer",
    company: "Company A",
    period: "2023 - Present",
    description: "Leading frontend development team.",
  },
  {
    role: "Developer",
    company: "Company B",
    period: "2021 - 2023",
    description: "Full-stack development with React and Node.js.",
  },
];

export const projectsData = [
  {
    title: "Project One",
    description: "A brief description of the project.",
    image: "/images/project1.jpg",
    tags: ["React", "Node.js", "MongoDB"],
    liveUrl: "#",
    githubUrl: "#",
  },
  {
    title: "Project Two",
    description: "A brief description of the project.",
    image: "/images/project2.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    liveUrl: "#",
    githubUrl: "#",
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/portfolio.ts
git commit -m "feat: add centralized portfolio data with placeholders"
```

---

### Task 4: Utility components (ScrollReveal, SectionHeading)

**Files:**
- Create: `src/components/ui/ScrollReveal.tsx`
- Create: `src/components/ui/SectionHeading.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create cn utility**

```tsx
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install: `npm install clsx tailwind-merge`

- [ ] **Step 2: Create ScrollReveal**

```tsx
// src/components/ui/ScrollReveal.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const directionOffset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directionOffset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 3: Create SectionHeading**

```tsx
// src/components/ui/SectionHeading.tsx
"use client";

import { ScrollReveal } from "./ScrollReveal";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <ScrollReveal className="mb-12 text-center">
      <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      )}
    </ScrollReveal>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/utils.ts src/components/ui/ScrollReveal.tsx src/components/ui/SectionHeading.tsx
git commit -m "feat: add ScrollReveal, SectionHeading, and cn utility"
```

---

## Chunk 2: UI Shell (Navbar, Footer, Cursor, ThemeToggle)

### Task 5: Navbar

**Files:**
- Create: `src/components/ui/Navbar.tsx`

- [ ] **Step 1: Build Navbar component**

Fixed top navbar with:
- Site name/logo on left
- Nav links from `navLinks` data (smooth scroll via `href="#section"`)
- ThemeToggle button on right
- Mobile hamburger menu with slide-in panel
- Backdrop blur + semi-transparent background
- `"use client"` directive (uses hooks)

Import `navLinks` from `@/data/portfolio`.

- [ ] **Step 2: Verify navbar renders and scrolls to sections**

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Navbar.tsx
git commit -m "feat: add responsive navbar with smooth scroll"
```

---

### Task 6: ThemeToggle

**Files:**
- Create: `src/components/ui/ThemeToggle.tsx`

- [ ] **Step 1: Build ThemeToggle**

Button that toggles between dark/light using `useTheme()` from `next-themes`. Show sun icon in dark mode, moon in light mode. Use `react-icons` (`FaSun`, `FaMoon`). Animate icon swap with Framer Motion.

- [ ] **Step 2: Integrate into Navbar**

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ThemeToggle.tsx
git commit -m "feat: add animated theme toggle"
```

---

### Task 7: Custom Cursor

**Files:**
- Create: `src/components/ui/CustomCursor.tsx`

- [ ] **Step 1: Build CustomCursor**

`"use client"` component that:
- Tracks mouse position with `mousemove` listener
- Renders a small dot + larger ring that follows with slight delay (Framer Motion `useSpring`)
- Scales up on hover over interactive elements (links, buttons) via CSS class detection
- Hidden on touch devices (check `window.matchMedia("(pointer: coarse)")`)
- Uses `pointer-events-none` and `fixed` positioning with high z-index

- [ ] **Step 2: Add to layout.tsx**

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CustomCursor.tsx src/app/layout.tsx
git commit -m "feat: add custom animated cursor (desktop only)"
```

---

### Task 8: Footer

**Files:**
- Create: `src/components/ui/Footer.tsx`

- [ ] **Step 1: Build Footer**

Simple footer with:
- Social icon links (from `socialLinks` data, use `react-icons`)
- Copyright line with current year
- Centered layout, subtle top border

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/Footer.tsx
git commit -m "feat: add footer with social links"
```

---

## Chunk 3: Content Sections

### Task 9: Hero section

**Files:**
- Create: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Build Hero**

Full-viewport-height section with:
- Large animated heading (name) — Framer Motion stagger on words
- Subtitle/title with typewriter or fade effect
- CTA button (scroll to contact)
- Scroll-down indicator at bottom
- 3D scene placeholder (empty div for now, will be filled in Task 14)

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx src/app/page.tsx
git commit -m "feat: add hero section with animated text"
```

---

### Task 10: About section

**Files:**
- Create: `src/components/sections/About.tsx`

- [ ] **Step 1: Build About**

- SectionHeading
- Two-column layout on desktop: text left, decorative element right
- Paragraphs from `aboutData` with ScrollReveal stagger
- Subtle background accent

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/About.tsx src/app/page.tsx
git commit -m "feat: add about section"
```

---

### Task 11: TechStack section

**Files:**
- Create: `src/components/sections/TechStack.tsx`

- [ ] **Step 1: Build TechStack**

- SectionHeading
- Infinite scrolling marquee of tech names/icons (CSS animation or Framer Motion)
- Two rows scrolling in opposite directions
- Gradient fade on edges
- Items from `techStack` data

- [ ] **Step 2: Add to page.tsx**

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/TechStack.tsx src/app/page.tsx
git commit -m "feat: add tech stack marquee section"
```

---

### Task 12: WhatIDo, Career, Projects, Contact sections

**Files:**
- Create: `src/components/sections/WhatIDo.tsx`
- Create: `src/components/sections/Career.tsx`
- Create: `src/components/sections/Projects.tsx`
- Create: `src/components/sections/Contact.tsx`

- [ ] **Step 1: Build WhatIDo**

- SectionHeading
- Grid of cards (icon, title, description) from `whatIDo` data
- Cards have hover lift effect (Framer Motion `whileHover`)
- Glass-morphism style card backgrounds

- [ ] **Step 2: Build Career**

- SectionHeading
- Vertical timeline with alternating left/right cards on desktop, left-aligned on mobile
- Connecting line with dots at each entry
- ScrollReveal on each entry
- Data from `careerData`

- [ ] **Step 3: Build Projects**

- SectionHeading
- Grid of project cards with:
  - Placeholder image area (gradient placeholder until user adds images)
  - Title, description, tech tags
  - Hover overlay with links (live, GitHub)
  - ScrollReveal stagger
- Data from `projectsData`

- [ ] **Step 4: Build Contact**

- SectionHeading
- Email link prominently displayed
- Social links row
- Location text
- "Let's work together" heading
- All from `siteConfig` and `socialLinks` data

- [ ] **Step 5: Add all to page.tsx**

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/WhatIDo.tsx src/components/sections/Career.tsx src/components/sections/Projects.tsx src/components/sections/Contact.tsx src/app/page.tsx
git commit -m "feat: add WhatIDo, Career, Projects, Contact sections"
```

---

## Chunk 4: 3D Scene & Polish

### Task 13: 3D Floating Scene

**Files:**
- Create: `src/components/three/FloatingScene.tsx`
- Modify: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Build FloatingScene**

`"use client"` component with:
- `<Canvas>` from React Three Fiber
- Multiple floating geometric shapes (torus, icosahedron, octahedron, box) with:
  - Slow rotation animation (`useFrame`)
  - Floating up/down motion (sin wave)
  - Semi-transparent material with wireframe option
  - Spread across the scene at different positions
- Ambient + point lighting
- Responsive to theme (adjust colors for dark/light)
- `<OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />`

- [ ] **Step 2: Dynamic import in Hero**

```tsx
import dynamic from "next/dynamic";
const FloatingScene = dynamic(
  () => import("@/components/three/FloatingScene").then(mod => ({ default: mod.FloatingScene })),
  { ssr: false }
);
```

Place behind hero text with `absolute inset-0 -z-10`.

- [ ] **Step 3: Verify 3D renders without hydration errors**

- [ ] **Step 4: Commit**

```bash
git add src/components/three/FloatingScene.tsx src/components/sections/Hero.tsx
git commit -m "feat: add 3D floating geometry hero background"
```

---

### Task 14: Final assembly and polish

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Assemble page.tsx with all sections in order**

```tsx
import { Navbar } from "@/components/ui/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { TechStack } from "@/components/sections/TechStack";
import { WhatIDo } from "@/components/sections/WhatIDo";
import { Career } from "@/components/sections/Career";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <TechStack />
        <WhatIDo />
        <Career />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Polish globals.css**

- Ensure smooth scrolling: `html { scroll-behavior: smooth; }`
- Custom scrollbar styling for dark/light
- Selection color
- Global transition for theme switching

- [ ] **Step 3: Add placeholder images**

Create `public/images/` directory. Add gradient placeholder SVGs or use CSS gradient backgrounds for project cards until user provides real images.

- [ ] **Step 4: Full visual verification**

Run `npm run dev` and verify:
- All sections render
- Scroll animations trigger
- Theme toggle works
- 3D scene renders
- Custom cursor works on desktop
- Mobile responsive layout
- No console errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: assemble full portfolio site with all sections"
```

---

## Summary

| Chunk | Tasks | What it delivers |
|---|---|---|
| 1: Foundation | 1-4 | Working Next.js app with theme, data, utilities |
| 2: UI Shell | 5-8 | Navbar, theme toggle, cursor, footer |
| 3: Sections | 9-12 | All content sections with animations |
| 4: 3D & Polish | 13-14 | 3D hero scene, final assembly, verification |

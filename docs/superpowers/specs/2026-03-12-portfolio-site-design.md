# Portfolio Site — Design Spec

## Goal

Build a personal portfolio website inspired by [raxx21/rajesh-portfolio](https://github.com/raxx21/rajesh-portfolio), using Next.js 15, React 19, Tailwind CSS v4, Framer Motion, and a lightweight Three.js 3D hero scene. Dark/light theme with toggle.

## Tech Stack

- Next.js 15 (App Router, TypeScript)
- React 19
- Tailwind CSS v4
- Framer Motion — scroll animations, text reveals, transitions
- React Three Fiber + Drei — floating geometry hero background
- next-themes — dark/light mode with system preference detection

## Sections

| Section | Description |
|---|---|
| Navbar | Fixed top, theme toggle, smooth-scroll links |
| Hero | Name, title, CTA, 3D floating geometry background |
| About | Bio with scroll-reveal |
| Tech Stack | Scrolling marquee of tech icons |
| What I Do | Skills/services cards with hover effects |
| Career | Timeline of work experience |
| Projects | Project cards with images and hover |
| Contact | Contact links + social icons |
| Footer | Minimal |
| Custom Cursor | Animated, desktop only |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── three/
│   │   └── FloatingScene.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── TechStack.tsx
│   │   ├── WhatIDo.tsx
│   │   ├── Career.tsx
│   │   ├── Projects.tsx
│   │   └── Contact.tsx
│   ├── ui/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── CustomCursor.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── SectionHeading.tsx
│   │   └── ScrollReveal.tsx
│   └── providers/
│       └── ThemeProvider.tsx
├── data/
│   └── portfolio.ts
└── lib/
    └── utils.ts
```

## Key Decisions

- All portfolio content centralized in `data/portfolio.ts`
- 3D scene loaded via `next/dynamic` with `ssr: false`
- Dark/light via Tailwind `dark:` + `next-themes`
- Custom cursor hidden on touch devices
- ScrollReveal is a reusable Framer Motion wrapper
- Single-page scroll layout, no client-side routing between pages

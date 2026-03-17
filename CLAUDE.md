# Portfolio — anilkhanna.dev

## Build Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 with `@theme` custom properties
- Framer Motion for animations
- Three.js (React Three Fiber + Drei) for 3D hero
- next-themes for dark/light mode
- MDX blog via next-mdx-remote/rsc

## Code Conventions

### Styling
- Use Tailwind theme classes: `text-accent`, `bg-surface`, `text-muted`, `text-foreground`, `border-border`, `bg-surface-hover`
- NEVER use raw CSS variable syntax like `text-[var(--accent)]`
- Theme tokens are defined via `@theme` in `src/app/globals.css`

### Section Headers (main page sections)
- Label: `font-mono text-[13px] font-semibold tracking-[2px] text-accent`
- H2: gradient text with `backgroundImage: "linear-gradient(0deg, var(--accent), var(--foreground))"`
- Divider: `h-0.5 w-[60px] bg-accent`
- Wrap in `<ScrollReveal>` component

### Navigation
- Internal links: use `<Link>` from `next/link` — never `<a href>` for internal routes
- NavLinks have `type: "anchor" | "page"` — anchors scroll, pages use router.push

### Standalone Pages (/services, /case-study/*, /blog/*)
- Must include `<Navbar />` and `<Footer />`
- Add `pt-20` (or `pt-28` when availability banner is active) to main content

### Carousel Pattern
- Single `motion.div` with `ref`, `drag="x"`, `dragConstraints`
- Match pattern in `Projects.tsx` — do NOT use nested motion divs

## Data Architecture
- All content centralized in `src/data/portfolio.json`
- Exports via `src/data/portfolio.ts`
- Blog posts are MDX files in `src/content/blog/` with frontmatter
- Admin panel at `/admin-panel-9x7k` — hidden URL, password-protected
- API route at `/api/admin/data` has `requiredKeys` validation — update when adding new fields

## Project Structure
```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── sections/     # Main page sections (Hero, About, Career, etc.)
│   ├── ui/           # Shared UI (Navbar, Footer, ScrollReveal, etc.)
│   ├── three/        # Three.js 3D scene
│   └── providers/    # ThemeProvider
├── data/             # portfolio.json + portfolio.ts exports
├── content/blog/     # MDX blog posts
└── lib/              # Utilities (utils.ts, blog.ts)
```

## Key Files
- `src/data/portfolio.json` — all portfolio content (edit here, not in components)
- `src/app/globals.css` — theme tokens, animations, global styles
- `src/app/layout.tsx` — root layout, metadata, JSON-LD schema
- `src/app/sitemap.ts` — SEO sitemap (update when adding new routes)

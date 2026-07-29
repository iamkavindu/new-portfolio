# iamkavindu.dev (new portfolio)

Astro-based portfolio and blog for [Kavindu Perera](https://iamkavindu.dev).

## Stack

- **Astro 7** — static site, content collections (Sätteri markdown)
- **Tailwind CSS v4** — teal / slate design system
- **TypeScript 5.9**
- **Node.js ≥ 22.12** (required by Astro 6+)
- **astro-og-canvas** — build-time Open Graph PNGs per post/project
- Deploy: **Netlify**

## Development

```bash
nvm use   # or: node >= 22.12
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
npm run check    # astro check
```

Copy `.env.example` to `.env` when you need local env vars.

## Content

- Blogs: `src/content/blogs/*.md`
- Projects: `src/content/projects/*.md`
- Guides: `src/content/guides/*.md` (optional topic hubs)

See `src/content.config.ts` for frontmatter schema. Set `draft: true` to exclude from build listings, RSS, and static routes.

## SEO checklist

| Item | Status |
|------|--------|
| Canonical URLs | Per page via `BaseLayout` |
| Open Graph / Twitter | Title, description, image |
| Default share image | `public/og-default.svg` |
| **Per-post OG PNG** | `/og/blog/{id}.png`, `/og/work/{id}.png` (build-time) |
| JSON-LD | Person + WebSite (home), BlogPosting, SoftwareSourceCode, BreadcrumbList |
| Sitemap | `@astrojs/sitemap` → `/sitemap-index.xml` |
| RSS | `/rss.xml` |
| robots.txt | Points at sitemap |
| Search Console | Set `PUBLIC_GOOGLE_SITE_VERIFICATION` in Netlify env |

### Open Graph images

- Generated at **build time** by `src/pages/og/[...route].ts` (`astro-og-canvas`).
- Blog/work pages use the PNG unless `heroImage` is set in frontmatter.
- Preview after build: open `dist/og/blog/<slug>.png` or hit the path in `astro preview`.
- Build needs network once to fetch Inter TTF from jsDelivr (or change `fonts` in the OG route to local files).

## Branches

Feature work lands on branches like `feat/og-per-post`, then merges to `main` via PR.

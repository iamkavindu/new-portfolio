# iamkavindu.dev (new portfolio)

Astro-based portfolio and blog for [Kavindu Perera](https://iamkavindu.dev).

## Stack

- **Astro 7** — static site, content collections (Sätteri markdown)
- **Tailwind CSS v4** — teal / slate design system
- **TypeScript 5.9**
- **Node.js ≥ 22.12** (required by Astro 6+)
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

See `src/content.config.ts` for frontmatter schema. Set `draft: true` to exclude from build listings, RSS, and static routes.

## SEO checklist

| Item | Status |
|------|--------|
| Canonical URLs | Per page via `BaseLayout` |
| Open Graph / Twitter | Title, description, image |
| Default share image | `public/og-default.svg` (1200×630) |
| JSON-LD | Person + WebSite (home), BlogPosting, SoftwareSourceCode, BreadcrumbList |
| Sitemap | `@astrojs/sitemap` → `/sitemap-index.xml` |
| RSS | `/rss.xml` |
| robots.txt | Points at sitemap |
| Search Console | Set `PUBLIC_GOOGLE_SITE_VERIFICATION` in Netlify env |

**OG image tip:** Many social crawlers prefer PNG/JPEG. Export `og-default.svg` to `og-default.png` (1200×630) and point `DEFAULT_OG_IMAGE` in `src/consts.ts` at the PNG for maximum compatibility.

## Branches

Feature work lands on branches like `feat/reading-kit`, then merges to `main` via PR.

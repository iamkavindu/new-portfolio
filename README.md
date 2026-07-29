# iamkavindu.dev (new portfolio)

Astro-based portfolio and blog for [Kavindu Perera](https://iamkavindu.dev).

## Stack

- **Astro 5** — static site, content collections
- **Tailwind CSS v4** — teal / slate design system
- **TypeScript**
- Deploy: **Netlify**

## Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build
npm run preview
```

## Content

- Blogs: `src/content/blogs/*.md`
- Projects: `src/content/projects/*.md`

See `src/content.config.ts` for frontmatter schema.

## Branches

Feature work lands on branches like `feat/astro-foundation`, then merges to `main` via PR.

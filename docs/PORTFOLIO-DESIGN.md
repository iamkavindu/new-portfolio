# Editorial portfolio review

This PR implements the approved cream/green editorial design with serif headings, structured navigation, readable articles, and selective lilac/lime accents. It adds a separate Sanity-powered portfolio entry point so the design can be reviewed before the live-site switch.

## Run with your published Sanity content

```bash
npm ci
npm --prefix studio ci
npm run portfolio:dev
```

Open <http://localhost:4321>. Stop `trial:dev` or the existing site's dev server first if it is using that port. In another terminal, run `npm run studio:dev` and open <http://localhost:3333> to edit content.

| Website page | Content source |
| --- | --- |
| `/` | Home / Contact introduction and featured references; published articles/projects as fallback selections |
| `/writing/` | Published `article` documents, newest article date first; optional topic filter |
| `/writing/<slug>/` | Published article with optional linked projects |
| `/work/` | Published `project` documents, newest creation date first |
| `/work/<slug>/` | Project story, technologies, repository/demo links, derived related articles |
| `/about/` | Fixed `profile` document: biography, skills, experience, education, optional PDF CV |
| `/contact/` | Fixed `siteSettings` document: contact introduction, public email and profile links |

The main reader uses project `ty4afqwx`, dataset `production`, and the published perspective without a token. It assumes the public dataset used by the writing trial. Published changes become available on the next request/refresh; a website build is not needed for this local server-rendered version. Drafts and the old `portfolioTrialArticle` sample are not included.

To populate the design, use the new Writing and Work sections rather than Writing trial. Add an article and project, generate their URLs, and publish them when ready. Fill and publish About / CV and Home / Contact as well. A published document is public Sanity content even though this PR does not deploy a live website page.

Keep the already working writing trial available using `npm run trial:dev` when you want its protected sample draft preview. Preview views for the permanent schemas, deployment integration, and the live-site switch are reserved for the production-publishing PR.

## Review without publishing any content

```bash
npm run portfolio:build
npm run portfolio:demo
```

Open <http://127.0.0.1:4322>. This local review server uses fixture responses in its own process. It performs no Sanity reads/writes and does not alter your dataset. It includes representative article blocks and optional article/project links. The sample biography explicitly identifies itself as review content. Stop it with Ctrl+C.

The fixture server belongs only to `portfolio/tests/`; it is never imported by the website, normal build, or production entry point. The production reader has no sample-content switch.

## What to review

1. Navigate Home → Writing → article → related project → related article. A standalone article must have no project section.
2. Try the Writing topic filters and All writing. Filters use regular links and work without JavaScript.
3. Read a code-heavy article, table, diagram, and callout at desktop and mobile widths. Code/table overflow stays inside its container; diagrams open at a larger size.
4. Review About / CV with your biography and experience. A CV button appears only when a PDF is uploaded. Print styles make the profile easier to print.
5. Review Contact with your public email and links.
6. Tab from the top of the page: the first focus target is Skip to content. Current navigation is marked, focus rings are visible, and reduced-motion preferences are respected.
7. Review an empty collection and a missing slug. Empty collections have honest messages; absent entries return 404; unavailable Sanity content returns 503 rather than a misleading 404.

The review version carries noindex/nofollow on every page and no-store response headers. It has basic titles/descriptions, but the production search-discovery work is not yet included.

## Checks

```bash
npm run portfolio:check
npm run portfolio:build
npm run portfolio:smoke
npm run check
npm run build
```

`portfolio:check` uses its own TypeScript include set because the review config has a different Astro source directory. The regular check/build still target the existing site. Astro regenerates its local content types when switching configs; use the matching check command for the version you are reviewing.

HTTP checks use the compiled server and fixture CMS responses. They verify the published-only/no-token reader, featured order, topic filters, rich content, relationship direction and missing targets, CV/contact links, unsafe-link handling, empty/missing/outage states, asset delivery, and review headers.

A direct read from the live Sanity endpoint timed out in the implementation workspace. Confirm published-content loading locally; the automated and browser checks use the isolated fixture responses.

Browser review in the implementation workspace covered all six page types at 1440px and 390px widths, with screenshots of Home and an article, no document-level horizontal overflow, no page JavaScript errors, and the keyboard skip link. Recheck with your real content and preferred devices.

## Production work to follow

The default `npm run dev`/`npm run build`, existing Markdown pages, and Netlify config continue to use the current site. The new build outputs to ignored `dist-portfolio/` and uses a standalone Node adapter for local review. Do not deploy that output as the finalized production architecture yet.

The next PR will settle the actual hosting adapter, connect protected previews to the permanent schemas, implement deployment/publishing feedback where needed, switch the default site, and add canonical URLs, social metadata, structured data, RSS, sitemap, and crawl controls. The URL transition from existing `/blog/` pages to `/writing/` must have explicit retained-URL/redirect/removal decisions. Old Markdown removal happens with that launch change.

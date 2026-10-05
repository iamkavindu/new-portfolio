# Production publishing

The default application is now the editorial portfolio in `src/portfolio`, served by Astro on Netlify. Sanity holds articles, projects, the About/CV profile, and Home/Contact settings. The old Markdown remains in Git as an archive; it is not loaded by the new application. No content is automatically migrated or deleted from Sanity.

## Prepare the deployment

1. Install root and Studio dependencies with `npm ci` and `npm --prefix studio ci` on Node >=22.12. If Sharp detects an incompatible system libvips installation, use `SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm ci --include=optional`.
2. In Sanity project `ty4afqwx`, keep the `production` dataset publicly readable: public pages read only published documents, without an API token.
3. Create a **Viewer** API token for protected draft previews. Set `SANITY_API_READ_TOKEN` in Netlify's Functions runtime environment. Set `SANITY_PREVIEW_SECRET` to a unique random password of at least 24 characters in the same runtime scope. These names are server-only; never prefix them with `PUBLIC_` or `SANITY_STUDIO_`. The editor build explicitly removes both secrets from its environment.
4. Add `https://iamkavindu.dev` to Sanity's CORS origins **with credentials** for the signed-in editor. Keep `http://localhost:3333` for local Studio. If an origin already exists, edit its credential setting rather than repeatedly adding it. Deployment previews need their own credential-enabled origin if you want to sign into their hosted Studio.
5. Publish About/CV and Home/Contact settings and the content you want to launch. Upload the CV PDF in About/CV. Check homepage featured references and optional article-to-project links. Empty sections are supported, but the application does not invent a biography or email address.
6. Keep Netlify's build command and publish directory from `netlify.toml`. The build installs Studio dependencies, builds the editor at `/studio/`, then builds the portfolio and SSR function. Netlify production builds set the editor preview origin to `https://iamkavindu.dev`; deployment previews use `DEPLOY_PRIME_URL`.
7. Optionally set `PUBLIC_GOOGLE_SITE_VERIFICATION` in the build environment and submit `/sitemap-index.xml` in Search Console after launch.

This PR does not deploy or change the configured Netlify production branch. Review it on `sanity`, then deploy the reviewed branch through your normal release workflow. Test the real Sanity credentials and hosted preview on Netlify before switching the live site.

## Write, preview, publish

Open `/studio/` and sign in with your Sanity account. Create an article or project, write in the editor, and save a slug. The **Preview** document tab opens a password-protected draft view. Unlock it with the preview password; its HttpOnly session lasts eight hours. Save in Studio and click Refresh to see changes. About/CV previews the About page; Home/Contact previews the homepage with a separate Contact preview link.

Click **Publish**, then **Open published version**. Public pages fetch the published perspective directly from Sanity, without the API CDN or shared page caching. Publishing, unpublishing, and content updates are reflected on the next page request; no webhook, Git branch, or rebuild is required. Code changes and changes to the editor itself still require a Netlify deployment. Ordinary uploads use Sanity's image pipeline; diagrams can include an alt description and caption.

Protected previews use runtime credentials and a signed session, reject cross-origin login/logout submissions, and are excluded from indexing and caching. Public pages never use the draft token. Preview availability depends on the Viewer token and preview password being configured in the deployed Functions runtime.

## Existing blog links

`/blog/` permanently redirects to `/writing/`. An old `/blog/<slug>/` redirects to a published article with the same slug or an entry in its optional **Previous blog URL slugs** field. Known retired article and guide URLs return **410 Gone** until replaced. Unknown URLs return 404. A Sanity outage returns 503 rather than falsely treating a missing response as deleted content. Recreate articles one at a time and enter their old slug when it differs from the new one.

## Search discovery

Production pages include canonical URLs, social metadata, and structured data for the person, website, pages, articles, projects, and breadcrumbs. `/rss.xml`, `/sitemap.xml`, and `/sitemap-index.xml` contain published content. `/social-card.png` supplies the default share image; an uploaded SEO/cover image takes precedence. Sitemap and RSS reads fail with 503 during a CMS outage.

Only `iamkavindu.dev` is indexable. Other hosts and local review builds are noindex, omit canonical/structured-data discovery, and disable feeds/sitemaps. `/studio/` and `/preview/` are always excluded. The host check is an indexing policy, not an authentication boundary.

`robots.txt` allows public pages to ordinary crawlers and explicitly to OpenAI's search crawler, OAI-SearchBot. Search crawling is distinct from model training; this release does not introduce a separate training opt-out. `/llms.txt` provides an experimental human-readable discovery index. Neither it nor structured data guarantees rankings, AI citations, or access by every LLM platform. Readable server-rendered pages and normal crawlable links remain the foundation.

## Local verification

```sh
npm run check
npm --prefix studio run check
npm run trial:test
npm run production:test:build
npm run production:smoke
npm run build
```

The production HTTP tests run the production routing/indexing rules with an isolated in-memory Sanity fixture, including published/draft separation, runtime credential failure, CSRF checks, preview headers, redirects, feeds, and outage handling. They do not write to Sanity. `npm run portfolio:build && npm run portfolio:demo` is a noindex sample-content design review. For actual authoring, copy `.env.example` to `.env`, configure your local runtime secrets, then run `npm run dev` and `npm run studio:dev` in separate terminals. Local credentials and authenticated live Sanity access must be verified by the project owner; the automated fixture checks do not prove deployment connectivity.

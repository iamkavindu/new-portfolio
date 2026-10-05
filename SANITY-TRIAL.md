# Sanity writing trial

Configured for project **ty4afqwx**, dataset **production**. This is an isolated local trial, not a deployed redesign.

The Studio includes an article editor with headings, lists, links, inline code, language-aware code blocks, image/diagram uploads, captions, alternative text, an editable table grid, and callouts. The Astro trial renders those blocks in the approved editorial direction.

## 1. Install

Use Node 22.12 or newer. Run from the repository root:

```bash
npm ci
npm --prefix studio ci
```

If applying the supplied patch to another checkout, start from commit `4f9fd6a` or review conflicts against newer work. Apply with `git apply --check sanity-cms-trial.patch`, followed by `git apply sanity-cms-trial.patch` from the repository root. The patch does not include credentials or dependencies.

## 2. Sign in and authorize the editor

```bash
cd studio
npm run login
npx sanity cors add http://localhost:3333 --credentials
cd ..
```

Sign in with the account that owns or can edit project `ty4afqwx`. Alternatively add `http://localhost:3333` under the project's API → CORS origins in Sanity Manage, with credentials allowed. Use the `localhost` URLs below consistently.

These are initial developer setup steps. Normal article writing uses the browser editor.

## 3. Load the sample draft

```bash
npm --prefix studio run seed
```

This authenticated command uploads the existing architecture diagram and creates a **draft**, using a dedicated `portfolioTrialArticle` document type. It never publishes. If either a draft or published copy already exists under the trial's fixed document ID, it exits without changing anything. The existing Markdown article is untouched.

The sample is a representative excerpt, not a full migration. It includes prose, Java code, a diagram, a table, and a callout.

## 4. Start the trial

In one terminal, from the repository root:

```bash
npm run studio:dev
```

In a second terminal:

```bash
npm run trial:dev
```

Open:

- Editor: <http://localhost:3333>
- Trial landing page: <http://localhost:4321/trial/>
- Local sample (no Sanity content needed): <http://localhost:4321/trial/article/sample/>
- Published trial article: <http://localhost:4321/trial/article/streaming-pipeline-trial/>

The Studio browser session needs a Sanity sign-in. Select the streaming draft under Writing. Write in the default Write group; URL, introduction, date, and topics live in Details. New articles need a generated URL before previewing or publishing.

Publishing makes the article available to this server-rendered trial after refreshing. It does **not** publish a page to `iamkavindu.dev`. This trial does not yet implement production build hooks or deployment status reporting.

## 5. Enable protected draft preview

The writing and published-content tests above can run without a preview token. Unpublished content needs the following one-time configuration.

1. In Sanity Manage → project → API → Tokens, create a **Viewer** token.
2. Copy `.env.example` to `.env` in the repository root only if you do not already have an `.env` file. Otherwise add the two fields to the existing file.
3. Set `SANITY_API_READ_TOKEN` to the Viewer token.
4. Generate a local preview password with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Set `SANITY_PREVIEW_SECRET` to that value.
5. Restart `npm run trial:dev`.

Keep both values in your local environment. Do not commit them or paste them into chat. Neither variable uses the `PUBLIC_` prefix.

In Studio, open the **Preview** view, enter the preview password, and submit. The preview uses the same article layout as the published trial. Click **Refresh preview** after the editor finishes saving. This first trial uses manual refresh, not live-as-you-type visual editing.

If the embedded preview has a browser cookie issue, use **Open draft preview** to open it in a new tab. The default configuration uses localhost for both editor and preview.

Draft access uses an eight-hour, HttpOnly signed session. Draft routes require that session before fetching any content. Trial pages carry `noindex` and `no-store`. The dev servers bind to loopback. Review deployment authentication, frame policies, cookie behavior, and rate limiting before hosting this trial publicly; this local setup is not the final production preview service.

## What to evaluate

1. Change a paragraph and heading; close and reopen the document after saving.
2. Paste Java code, choose its language, and add a filename.
3. Upload a large image or diagram; add alt text and a caption. Check its readable size in the preview.
4. Edit cells directly in the table grid; add a column and a row.
5. Check the actual article preview on a narrow screen.
6. Publish; refresh the published trial article and confirm the change.
7. Edit the published article again. Confirm the draft preview changes but the published page stays the same until Publish is pressed.

No branch, Markdown edit, image-resizing command, or manual build should be part of these authoring tasks. A complicated diagram may still need zooming via its image link; check whether this presentation suits your work.

## Verification and scope

Run:

```bash
npm run check
npm --prefix studio run check
npm run trial:test
npm run studio:build
npm run trial:build
npm run trial:smoke
npm run build
```

Verified in the preparation workspace:

- Sanity's public dataset endpoint is reachable; zero published trial articles were present.
- Astro and Studio TypeScript checks pass.
- Both builds and the existing production build pass.
- Four preview-session tests pass.
- HTTP checks verify rendered code/table/image content, image delivery, noindex/no-store, redirect-to-unlock behavior, wrong-password and cross-origin rejection, HttpOnly sessions, and failure without a Viewer token.

Not yet verified: authenticated authoring, sample upload, actual draft reads, publishing/unpublishing, and visual browser layout. Those require the signed-in trial; browser rendering could not be completed in the preparation environment. No remote content has been uploaded or published by this setup work.

The regular `npm run build` uses the existing config and does not include `/trial/` routes or Studio. Trial routes are injected only by `astro.trial.config.mjs`. The existing content, navigation, and Netlify deployment configuration are preserved.

## After the writing trial succeeds

Build the full approved design, add the project/profile/CV content models, settle the production preview hosting, connect publish events to deployment, report deployment success/failure, and add exports/recovery. The initial article schema and simple table editor are intentionally scoped to evaluating a single-author workflow.

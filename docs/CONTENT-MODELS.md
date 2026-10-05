# Portfolio content foundation

This change introduces the permanent authoring models. It does not replace the live website or connect the new document types to Astro pages yet. Publishing these documents stores them in Sanity; it does not deploy a page. The existing Writing trial retains its working preview.

## Editor sections

| Section | Document type / ID | Purpose |
| --- | --- | --- |
| Writing | `article` / generated | Articles, including optional links to projects |
| Work | `project` / generated | Hobby projects and other work, repository/demo links, technical story |
| About / CV | `profile` / `profile` | Biography, experience, education, skills, public PDF CV |
| Home / Contact | `siteSettings` / `siteSettings` | Homepage introduction, ordered featured content, contact details |
| Writing trial | `portfolioTrialArticle` / existing | Existing sample and local preview, retained for comparison |

Writing and project stories share the tested paragraph, heading, code, image, table, and callout editor. Existing `trialTable`, `trialTableRow`, and `trialCallout` storage names are deliberately retained for compatibility; their visible editor labels are simply Table, Row, and Callout.

New articles have Write, Details, and Search and sharing tabs. Topics are lightweight tags. Cover images and search overrides are optional. Required introductions provide future website metadata defaults. Project status describes the project, not its publication state. The article date is descriptive, not a publishing schedule.

## Relationships and rendering contract

An article's `relatedProjects` contains unique, strong references to `project` documents. It is optional: an article need not concern any project, and a project need not have an article. Sanity's reference workflow protects against silently deleting a referenced project.

Do not add a manually maintained related-articles array to a project. The website should derive it with a query such as:

```groq
*[_type == "article" && $projectId in relatedProjects[]._ref]
  | order(publishedAt desc) {
    _id, title, slug, description, publishedAt
  }
```

`$projectId` is the canonical project ID (without a `drafts.` prefix). Public pages must query with the published perspective. Draft preview requires the separate authenticated server-side path. A published article can reference a project that is not yet publicly available; public rendering must omit unresolved/unpublished targets instead of producing broken links. This rendering behavior belongs to the next website PR.

Homepage featured references preserve editor order. The future website should omit unavailable targets and use recent published articles/projects if selections are empty. Social/profile URLs accept HTTP/HTTPS; contact email is a separate field.

`profile` and `siteSettings` open at fixed IDs. Creation templates are hidden and duplication/deletion actions are removed in Studio. These are editor safeguards, not a database uniqueness constraint; integrations must use the same IDs.

## Review locally

```bash
npm --prefix studio run check
npm --prefix studio run build
npm run studio:dev
```

1. Open Content and verify Writing, Work, About / CV, Home / Contact, and Writing trial.
2. Create a project draft with a title, introduction, story, and generated URL. Add a repository link.
3. Create an article draft. Verify the familiar writing blocks, then choose the project under Details → Related projects. A standalone article should also validate with that field empty.
4. Confirm required fields and malformed URLs are reported. Add image alternative text.
5. Open About / CV; add ordered experience/education and a public PDF CV if desired. Reopening must return to the same document.
6. Select featured articles/projects in Home / Contact and drag to reorder. Confirm singletons do not appear in the global creation menu or offer Duplicate/Delete.
7. Open the existing Writing trial sample and confirm its Preview still opens.

No publishing is necessary to review the editor. New permanent documents deliberately have no website Preview view until the corresponding routes exist. No remote content is seeded, migrated, renamed, or deleted by installing this change.

## Following PRs

- Build Home, Writing, Work, About/CV, and Contact with the approved editorial design and these schemas. Derive project-to-article links automatically.
- Connect live publishing, protected previews, deployment feedback, SEO metadata, structured data, sitemap, RSS, and crawl access.
- Recreate chosen articles manually in Sanity. Remove active Markdown content only during the website switch; preserve Git history and decide retained URLs/redirects explicitly.

Navigation, colors, typography, and layouts remain in application code. This PR intentionally does not expose a page builder or theme settings.

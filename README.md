# iamkavindu.dev

An editorial portfolio for Kavindu Perera: Writing, Work, About/CV, and Contact. Astro serves published Sanity content on Netlify; Studio is hosted at `/studio/`. Publishing content needs no Git branch or rebuild.

## Setup

Use Node >=22.12, then:

```sh
npm ci
npm --prefix studio ci
cp .env.example .env
npm run dev
# In another terminal:
npm run studio:dev
```

See [Production publishing](docs/PRODUCTION-PUBLISHING.md) for runtime credentials, CORS, deployment, SEO, and verification. [Content models](docs/CONTENT-MODELS.md) describes what to edit in Sanity. [Portfolio design](docs/PORTFOLIO-DESIGN.md) documents the visual direction and sample-content review.

## Verification

```sh
npm run check
npm --prefix studio run check
npm run trial:test
npm run production:test:build
npm run production:smoke
npm run build
```

The original Markdown website remains in the repository as an archive; the active source is `src/portfolio/`. The [Sanity trial guide](SANITY-TRIAL.md) records the earlier isolated authoring evaluation, not the production publishing flow. Articles can optionally link to hobby projects; project pages derive related writing from those links.

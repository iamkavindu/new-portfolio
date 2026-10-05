import {defineConfig} from 'astro/config';
import node from '@astrojs/node';
import base from './astro.config.mjs';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  ...base,
  outDir: './dist-trial',
  adapter: node({mode: 'standalone'}),
  integrations: [
    // Keep the trial out of the production sitemap.
    ...base.integrations.filter((integration) => integration.name !== '@astrojs/sitemap'),
    {
      name: 'portfolio-sanity-trial',
      hooks: {
        'astro:config:setup': ({injectRoute, addMiddleware}) => {
          for (const [pattern, file] of [
            ['/trial/', 'index.astro'],
            ['/trial/article/[slug]/', 'article.astro'],
            ['/trial/preview/[slug]/', 'preview.astro'],
            ['/trial/access/', 'access.astro'],
          ]) injectRoute({pattern, entrypoint: fileURLToPath(new URL(`./src/trial/pages/${file}`, import.meta.url)), prerender: false});
          addMiddleware({entrypoint: fileURLToPath(new URL('./src/trial/middleware.ts', import.meta.url)), order: 'pre'});
        },
      },
    },
  ],
});

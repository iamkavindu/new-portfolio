import {defineConfig} from 'astro/config';
import node from '@astrojs/node';
import production from './astro.config.mjs';

// A portable local review; production uses Netlify.
export default defineConfig({
  ...production,
  outDir: './dist-portfolio',
  adapter: node({mode: 'standalone'}),
  vite: {define: {'import.meta.env.PORTFOLIO_REVIEW': JSON.stringify('true')}},
});

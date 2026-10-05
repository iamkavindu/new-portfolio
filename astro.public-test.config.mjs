import {defineConfig} from 'astro/config';
import review from './astro.portfolio.config.mjs';
export default defineConfig({
  ...review,
  outDir: './dist-public-test',
  vite: {define: {'import.meta.env.PORTFOLIO_REVIEW': JSON.stringify('false')}},
});

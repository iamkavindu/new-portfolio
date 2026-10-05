import {defineConfig} from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  srcDir: './src/portfolio',
  site: 'https://iamkavindu.dev',
  trailingSlash: 'always',
  output: 'server',
  session: false,
  adapter: netlify({cacheOnDemandPages: false, imageCDN: false, devFeatures: false}),
  integrations: [],
  compressHTML: true,
  vite: {define: {'import.meta.env.PORTFOLIO_REVIEW': JSON.stringify('false')}},
});

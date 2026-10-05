import {defineConfig} from 'astro/config';
import node from '@astrojs/node';

// Review the replacement independently until production hosting is connected.
export default defineConfig({
  srcDir: './src/portfolio',
  outDir: './dist-portfolio',
  site: 'https://iamkavindu.dev',
  trailingSlash: 'always',
  output: 'server',
  adapter: node({mode: 'standalone'}),
  compressHTML: true,
});

import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';

const blogs = await getCollection('blogs', ({ data }) => !data.draft);
const projects = await getCollection('projects', ({ data }) => !data.draft);

/** Keys become /og/{key}.png */
const pages = Object.fromEntries([
  ...blogs.map((post) => [
    `blog/${post.id}`,
    {
      title: post.data.title,
      description: post.data.description,
      kind: 'Writing' as const,
    },
  ]),
  ...projects.map((project) => [
    `work/${project.id}`,
    {
      title: project.data.title,
      description: project.data.description,
      kind: 'Work' as const,
    },
  ]),
]);

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    // Dark slate background (aligned with site surface-950)
    bgGradient: [[11, 18, 32]],
    border: {
      color: [45, 168, 168], // teal accent
      width: 16,
      side: 'inline-start',
    },
    padding: 72,
    font: {
      title: {
        color: [248, 250, 252],
        size: 56,
        weight: 'Bold',
        lineHeight: 1.15,
      },
      description: {
        color: [148, 163, 184],
        size: 28,
        weight: 'Normal',
        lineHeight: 1.35,
      },
    },
    // Noto Sans from Fontsource CDN (fetched at build time)
    fonts: [
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf',
    ],
  }),
});

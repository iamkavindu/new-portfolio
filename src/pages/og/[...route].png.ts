import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgPng } from '../../lib/og-image';

export async function getStaticPaths() {
  const blogs = await getCollection('blogs', ({ data }) => !data.draft);
  const projects = await getCollection('projects', ({ data }) => !data.draft);

  return [
    ...blogs.map((post) => ({
      params: { route: `blog/${post.id}` },
      props: {
        title: post.data.title,
        description: post.data.description,
        kind: 'Writing' as const,
      },
    })),
    ...projects.map((project) => ({
      params: { route: `work/${project.id}` },
      props: {
        title: project.data.title,
        description: project.data.description,
        kind: 'Work' as const,
      },
    })),
  ];
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng({
    title: props.title,
    description: props.description,
    kind: props.kind,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

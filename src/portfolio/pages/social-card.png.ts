import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import type {APIRoute} from 'astro';
export const prerender = true;
export const GET: APIRoute = async () => {
  const svg = await readFile('public/social-card.svg');
  const png = await sharp(svg).png().toBuffer();
  return new Response(new Uint8Array(png), {headers: {'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400'}});
};

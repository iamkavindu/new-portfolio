import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blogs'>;
export type ProjectEntry = CollectionEntry<'projects'>;

/** Published blog posts, newest first. */
export async function getPublishedPosts(): Promise<BlogEntry[]> {
  return (await getCollection('blogs', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/** Published projects, newest first. */
export async function getPublishedProjects(): Promise<ProjectEntry[]> {
  return (await getCollection('projects', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
}

/** Featured published projects, newest first. */
export async function getFeaturedProjects(): Promise<ProjectEntry[]> {
  return (await getPublishedProjects()).filter((p) => p.data.featured);
}

export function formatDate(
  date: Date,
  style: 'short' | 'long' = 'long'
): string {
  return date.toLocaleDateString(
    'en-US',
    style === 'short'
      ? { year: 'numeric', month: 'short', day: 'numeric' }
      : { year: 'numeric', month: 'long', day: 'numeric' }
  );
}

/** Approximate reading time from markdown body (words / 200 wpm). */
export function readingTimeMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_\-|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function readingTimeLabel(body: string): string {
  const mins = readingTimeMinutes(body);
  return `${mins} min read`;
}

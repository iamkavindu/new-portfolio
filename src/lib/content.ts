import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blogs'>;
export type ProjectEntry = CollectionEntry<'projects'>;
export type GuideEntry = CollectionEntry<'guides'>;

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

/** Published guides, title A–Z. */
export async function getPublishedGuides(): Promise<GuideEntry[]> {
  return (await getCollection('guides', ({ data }) => !data.draft)).sort((a, b) =>
    a.data.title.localeCompare(b.data.title)
  );
}

export async function getGuide(id: string): Promise<GuideEntry | undefined> {
  try {
    const entry = await getEntry('guides', id);
    if (!entry || entry.data.draft) return undefined;
    return entry;
  } catch {
    return undefined;
  }
}

/** Published posts in a guide, ordered by orderInGuide then pubDate ascending. */
export async function getPostsForGuide(guideId: string): Promise<BlogEntry[]> {
  const posts = await getCollection(
    'blogs',
    ({ data }) => !data.draft && data.guide === guideId
  );
  return posts.sort((a, b) => {
    const ao = a.data.orderInGuide ?? Number.MAX_SAFE_INTEGER;
    const bo = b.data.orderInGuide ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
  });
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
export function readingTimeMinutes(body: string | undefined): number {
  if (!body?.trim()) return 1;
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

export function readingTimeLabel(body: string | undefined): string {
  return `${readingTimeMinutes(body)} min read`;
}

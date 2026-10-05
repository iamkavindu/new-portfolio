import {createClient} from '@sanity/client';
import {createImageUrlBuilder} from '@sanity/image-url';
import type {TrialBlock} from '../trial/client';

export interface ContentImage {asset?: {_ref: string}; alt?: string;}
export interface Entry {
  _id: string; _type: 'article' | 'project'; title: string; slug: {current: string};
  description?: string; body?: TrialBlock[]; coverImage?: ContentImage;
  tags?: string[]; technologies?: string[]; publishedAt?: string;
  repositoryUrl?: string; demoUrl?: string; status?: string;
  relatedProjects?: {_ref: string}[];
  seo?: {title?: string; description?: string; image?: ContentImage};
}
export interface CareerEntry {_key: string; title: string; organization: string; period: string; description?: string;}
export interface Profile {
  name?: string; headline?: string; portrait?: ContentImage; body?: TrialBlock[];
  skills?: string[]; experience?: CareerEntry[]; education?: CareerEntry[];
  cvUrl?: string; seo?: Entry['seo'];
}
export interface Settings {
  homeTitle?: string; homeIntroduction?: string; contactIntroduction?: string; email?: string;
  featuredArticles?: {_ref: string}[]; featuredProjects?: {_ref: string}[];
  socialLinks?: {_key: string; title: string; url: string}[]; seo?: Entry['seo'];
}
export interface Catalog {articles: Entry[]; projects: Entry[]; profile: Profile | null; settings: Settings | null;}
const configuration = {projectId: 'ty4afqwx', dataset: 'production', apiVersion: '2025-02-19'};
const client = createClient({...configuration, useCdn: false, perspective: 'published', timeout: 10000});
const images = createImageUrlBuilder(configuration);
export function imageUrl(image: ContentImage | undefined, width = 1200): string | undefined {
  if (!image?.asset?._ref) return undefined;
  try {return images.image(image).width(width).fit('max').auto('format').url();} catch {return undefined;}
}
// No token or draft data is ever used by this public reader.
export async function getCatalog(): Promise<{data: Catalog; unavailable: boolean}> {
  try {
    const data = await client.fetch<Catalog>(`{
      "articles": *[_type == "article" && defined(slug.current)] | order(publishedAt desc, _id asc),
      "projects": *[_type == "project" && defined(slug.current)] | order(_createdAt desc, _id asc),
      "profile": *[_type == "profile" && _id == "profile"][0]{..., "cvUrl": cv.asset->url},
      "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]
    }`);
    return {data, unavailable: false};
  } catch {
    return {data: {articles: [], projects: [], profile: null, settings: null}, unavailable: true};
  }
}
export const entryPath = (entry: Entry) => `/${entry._type === 'article' ? 'writing' : 'work'}/${encodeURIComponent(entry.slug.current)}/`;
export function featured(entries: Entry[], refs?: {_ref: string}[], count = 3): Entry[] {
  const available = (refs || []).map(({_ref}) => entries.find((entry) => entry._id === _ref)).filter((entry): entry is Entry => !!entry);
  return (available.length ? available : entries).slice(0, count);
}
export function linkedProjects(article: Entry, projects: Entry[]): Entry[] {
  return (article.relatedProjects || []).flatMap(({_ref}) => projects.filter((project) => project._id === _ref));
}
export function linkedArticles(project: Entry, articles: Entry[]): Entry[] {
  return articles.filter((article) => article.relatedProjects?.some(({_ref}) => _ref === project._id));
}
export function displayDate(value?: string): string {
  if (!value || Number.isNaN(Date.parse(value))) return '';
  return new Date(value).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
}

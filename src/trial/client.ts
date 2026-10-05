import {createClient} from '@sanity/client';
import type {PortableTextBlock} from '@portabletext/types';

export const projectId = 'ty4afqwx';
export const dataset = 'production';
export type TrialBlock = PortableTextBlock & {_key: string} & Record<string, any>;
export interface TrialArticle {
  _id: string;
  title: string;
  slug: {current: string};
  description?: string;
  publishedAt?: string;
  tags?: string[];
  body: TrialBlock[];
}

export function trialClient(drafts = false) {
  const token = process.env.SANITY_API_READ_TOKEN ?? import.meta.env.SANITY_API_READ_TOKEN;
  if (drafts && !token) throw new Error('Draft preview needs SANITY_API_READ_TOKEN in the root .env file.');
  return createClient({projectId, dataset, apiVersion: '2025-02-19', useCdn: false, perspective: drafts ? 'drafts' : 'published', token: token || undefined, timeout: 15000});
}

export async function getTrialArticle(slug: string, drafts = false): Promise<TrialArticle | null> {
  return trialClient(drafts).fetch<TrialArticle | null>(
    '*[_type == "portfolioTrialArticle" && slug.current == $slug][0]{_id,title,slug,description,publishedAt,tags,body}', {slug},
  );
}

import type {Entry, Profile, Settings} from '../content';
import {imageUrl} from '../content';
export const SITE_URL = 'https://iamkavindu.dev';
export const absoluteUrl = (path: string) => new URL('/' + path.replace(/^\/+/, ''), SITE_URL).href;
export const isLiveHost = (url: URL) => url.hostname === new URL(SITE_URL).hostname;
export const serializeJSON = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');
export const httpUrl = (value?: string) => {
  try {const url = new URL(value || ''); return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;} catch {return undefined;}
};
export function structuredData(path: string, title: string, description: string, profile?: Profile | null, settings?: Settings | null, entry?: Entry) {
  const canonical = absoluteUrl(path);
  const name = profile?.name || 'Kavindu Perera';
  const personId = absoluteUrl('/about/#person');
  const person = {
    '@type': 'Person', '@id': personId, name, url: absoluteUrl('/about/'),
    ...(profile?.headline ? {jobTitle: profile.headline} : {}),
    ...(imageUrl(profile?.portrait) ? {image: imageUrl(profile?.portrait)} : {}),
    sameAs: (settings?.socialLinks || []).map((link) => httpUrl(link.url)).filter(Boolean),
  };
  const website = {'@type': 'WebSite', '@id': absoluteUrl('/#website'), url: absoluteUrl('/'), name, publisher: {'@id': personId}};
  const pageType = path === '/about/' ? 'ProfilePage' : path === '/contact/' ? 'ContactPage' : path === '/writing/' || path === '/work/' ? 'CollectionPage' : 'WebPage';
  const page = {'@type': pageType, '@id': `${canonical}#page`, url: canonical, name: title, description, isPartOf: {'@id': website['@id']}, ...(path === '/about/' ? {mainEntity: {'@id': personId}} : {})};
  const crumbs = [{name: 'Home', url: absoluteUrl('/')}];
  if (path !== '/') {
    if (entry) crumbs.push({name: entry._type === 'article' ? 'Writing' : 'Work', url: absoluteUrl(entry._type === 'article' ? '/writing/' : '/work/')});
    crumbs.push({name: entry?.title || title, url: canonical});
  }
  const breadcrumb = {'@type': 'BreadcrumbList', itemListElement: crumbs.map((item, index) => ({'@type': 'ListItem', position: index + 1, name: item.name, item: item.url}))};
  const graph: unknown[] = [person, website, page, breadcrumb];
  if (entry) {
    const creativeWork = {
      '@type': entry._type === 'article' ? 'BlogPosting' : 'SoftwareSourceCode',
      '@id': `${canonical}#content`, url: canonical, name: entry.title, headline: entry.title,
      description: entry.description, author: {'@id': personId}, mainEntityOfPage: {'@id': page['@id']},
      image: imageUrl(entry.seo?.image || entry.coverImage), keywords: (entry.tags || entry.technologies || []).join(', '),
      dateModified: entry._updatedAt,
      ...(entry._type === 'article' ? {datePublished: entry.publishedAt} : {codeRepository: httpUrl(entry.repositoryUrl)}),
    };
    graph.push(creativeWork);
  }
  return {'@context': 'https://schema.org', '@graph': graph};
}

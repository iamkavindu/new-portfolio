import {defineArrayMember, defineField, defineType} from 'sanity';
import {writingBlocks} from './schema';

const title = () => defineField({name: 'title', type: 'string', validation: (r) => r.required()});
const slug = () => defineField({
  name: 'slug', title: 'URL', type: 'slug', options: {source: 'title', maxLength: 96},
  description: 'Generate once. Changing a published URL later requires a redirect.',
  validation: (r) => r.required().custom((v) => !v?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.current) || 'Use lowercase letters, numbers, and hyphens.'),
});
const summary = () => defineField({name: 'description', title: 'Short introduction', type: 'text', rows: 3, validation: (r) => r.required().max(220)});
const body = (label: string) => defineField({name: 'body', title: label, type: 'array', of: writingBlocks, validation: (r) => r.required().min(1)});
const tags = (name: string, label: string) => defineField({name, title: label, type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}, validation: (r) => r.unique()});
const image = (name: string, label: string) => defineField({
  name, title: label, type: 'image', options: {hotspot: true},
  fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (r) => r.required()})],
});
const url = (name: string, label: string) => defineField({name, title: label, type: 'url', validation: (r) => r.uri({scheme: ['https', 'http']})});
const references = (name: string, label: string, type: string) => defineField({
  name, title: label, type: 'array', of: [defineArrayMember({type: 'reference', to: [{type}]})], validation: (r) => r.unique(),
});

export const seo = defineType({
  name: 'seo', title: 'Search and sharing', type: 'object',
  description: 'Optional overrides. The website will default to the title and short introduction.',
  fields: [
    defineField({name: 'title', title: 'Search title', type: 'string', validation: (r) => r.max(70).warning()}),
    defineField({name: 'description', title: 'Search description', type: 'text', rows: 3, validation: (r) => r.max(170).warning()}),
    image('image', 'Social sharing image'),
  ],
});

export const post = defineType({
  name: 'article', title: 'Article', type: 'document',
  groups: [{name: 'write', title: 'Write', default: true}, {name: 'details', title: 'Details'}, {name: 'seo', title: 'Search and sharing'}],
  fields: [
    {...title(), group: 'write'}, {...body('Article'), group: 'write'},
    {...slug(), group: 'details'}, {...summary(), group: 'details'},
    defineField({name: 'publishedAt', title: 'Article date', type: 'datetime', group: 'details', initialValue: () => new Date().toISOString(), validation: (r) => r.required(), description: 'Displayed article date; this does not schedule publishing.'}),
    {...tags('tags', 'Topics'), group: 'details'},
    defineField({name: 'legacySlugs', title: 'Previous blog URLs (optional)', type: 'array', group: 'details', of: [{type: 'string'}], description: 'Old /blog/ URL segments, without slashes. Existing links redirect to this article once published.', validation: (r) => r.unique().custom((values) => !values || values.every((value) => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) || 'Use lowercase URL segments with numbers and hyphens.')}), {...image('coverImage', 'Cover image (optional)'), group: 'details'},
    {...references('relatedProjects', 'Related projects (optional)', 'project'), group: 'details', description: 'Select only when this article discusses a project. Related articles on the project page are derived automatically.'},
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  orderings: [{title: 'Newest article date', name: 'dateDesc', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'description', media: 'coverImage'}},
});

export const project = defineType({
  name: 'project', title: 'Project', type: 'document',
  groups: [{name: 'story', title: 'Project', default: true}, {name: 'details', title: 'Details'}, {name: 'seo', title: 'Search and sharing'}],
  fields: [
    {...title(), group: 'story'}, {...summary(), group: 'story'},
    {...body('Project story'), group: 'story', description: 'Explain the problem, what you built, important decisions, and what you learned. Add screenshots where useful.'},
    {...slug(), group: 'details'}, {...image('coverImage', 'Project image'), group: 'details'},
    {...tags('technologies', 'Technologies'), group: 'details'},
    {...url('repositoryUrl', 'GitHub / source repository'), group: 'details'}, {...url('demoUrl', 'Live demo'), group: 'details'},
    defineField({name: 'status', type: 'string', group: 'details', initialValue: 'in-progress', options: {list: [{title: 'In progress', value: 'in-progress'}, {title: 'Available', value: 'available'}, {title: 'Archived', value: 'archived'}]}}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {select: {title: 'title', subtitle: 'description', media: 'coverImage'}},
});

export const careerEntry = defineType({
  name: 'careerEntry', title: 'Experience or education', type: 'object',
  fields: [
    defineField({name: 'title', title: 'Role or qualification', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'organization', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'period', title: 'Date range', type: 'string', description: 'For example: 2024–present or Jan 2022–Jun 2024.', validation: (r) => r.required()}),
    defineField({name: 'description', title: 'Highlights', type: 'text', rows: 4}),
  ],
  preview: {select: {title: 'title', subtitle: 'organization'}},
});

export const profile = defineType({
  name: 'profile', title: 'About / CV', type: 'document',
  fields: [
    defineField({name: 'name', title: 'Full name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'headline', title: 'Professional headline', type: 'string', validation: (r) => r.required()}),
    image('portrait', 'Portrait'), body('Biography'),
    tags('skills', 'Skills'),
    defineField({name: 'experience', title: 'Experience (drag to reorder)', type: 'array', of: [{type: 'careerEntry'}]}),
    defineField({name: 'education', title: 'Education (drag to reorder)', type: 'array', of: [{type: 'careerEntry'}]}),
    defineField({name: 'cv', title: 'Downloadable CV (PDF)', type: 'file', options: {accept: 'application/pdf'}, description: 'Upload only the version intended for public download.'}),
    defineField({name: 'seo', type: 'seo'}),
  ],
  preview: {select: {title: 'name', subtitle: 'headline', media: 'portrait'}},
});

export const siteSettings = defineType({
  name: 'siteSettings', title: 'Home / Contact', type: 'document',
  groups: [{name: 'home', title: 'Home', default: true}, {name: 'contact', title: 'Contact'}, {name: 'seo', title: 'Search and sharing'}],
  fields: [
    defineField({name: 'homeTitle', title: 'Homepage heading', type: 'string', group: 'home', validation: (r) => r.required()}),
    defineField({name: 'homeIntroduction', title: 'Homepage introduction', type: 'text', rows: 3, group: 'home', validation: (r) => r.required()}),
    {...references('featuredArticles', 'Featured articles (drag to reorder)', 'article'), group: 'home'},
    {...references('featuredProjects', 'Featured projects (drag to reorder)', 'project'), group: 'home'},
    defineField({name: 'contactIntroduction', title: 'Contact introduction', type: 'text', rows: 3, group: 'contact'}),
    defineField({name: 'email', title: 'Public contact email', type: 'string', group: 'contact', validation: (r) => r.email()}),
    defineField({name: 'socialLinks', title: 'Public profile links', type: 'array', group: 'contact', of: [defineArrayMember({name: 'socialLink', type: 'object', fields: [title(), {...url('url', 'URL'), validation: (r) => r.required().uri({scheme: ['https', 'http']})}], preview: {select: {title: 'title', subtitle: 'url'}}})]}),
    defineField({name: 'seo', title: 'Default search and sharing', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Home / Contact'})},
});

export const contentModels = [seo, post, project, careerEntry, profile, siteSettings];
export const singletonTypes = new Set(['profile', 'siteSettings']);

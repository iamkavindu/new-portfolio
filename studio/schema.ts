import {defineArrayMember, defineField, defineType} from 'sanity';
import {TableInput} from './TableInput';

export const callout = defineType({
  name: 'trialCallout', title: 'Callout', type: 'object',
  fields: [
    defineField({name: 'title', title: 'Heading', type: 'string'}),
    defineField({name: 'text', title: 'Text', type: 'text', rows: 3, validation: (rule) => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}, prepare: ({title, subtitle}) => ({title: title || 'Callout', subtitle})},
});

export const trialTableRow = defineType({
  name: 'trialTableRow', title: 'Row', type: 'object',
  fields: [defineField({name: 'cells', title: 'Cells (left to right)', type: 'array', of: [{type: 'string'}], validation: (rule) => rule.required().min(1)})],
  preview: {select: {cells: 'cells'}, prepare: ({cells}) => ({title: (cells || []).join(' | ') || 'Empty row'})},
});

export const trialTable = defineType({
  name: 'trialTable', title: 'Table', type: 'object',
  components: {input: TableInput},
  fields: [
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
    defineField({name: 'headers', title: 'Column headings', type: 'array', of: [{type: 'string'}], validation: (rule) => rule.required().min(1)}),
    defineField({name: 'rows', title: 'Rows', type: 'array', of: [{type: 'trialTableRow'}], validation: (rule) => rule.required().min(1)}),
  ],
  validation: (rule) => rule.custom((value) => {
    const table = value as {headers?: string[]; rows?: {cells?: string[]}[]} | undefined;
    if (!table?.headers?.length || !table.rows) return true;
    return table.rows.every((row) => row.cells?.length === table.headers!.length) || 'Each row must have the same number of cells as the column headings.';
  }),
  preview: {select: {title: 'caption'}, prepare: ({title}) => ({title: title || 'Table'})},
});

export const writingBlocks = [
  defineArrayMember({
    type: 'block',
    styles: [{title: 'Paragraph', value: 'normal'}, {title: 'Heading', value: 'h2'}, {title: 'Subheading', value: 'h3'}, {title: 'Quote', value: 'blockquote'}],
    lists: [{title: 'Bullets', value: 'bullet'}, {title: 'Numbered', value: 'number'}],
    marks: {
      decorators: [{title: 'Bold', value: 'strong'}, {title: 'Italic', value: 'em'}, {title: 'Inline code', value: 'code'}],
      annotations: [{name: 'link', title: 'Link', type: 'object', fields: [defineField({name: 'href', title: 'URL', type: 'url', validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto'], allowRelative: true})})]}],
    },
  }),
  defineArrayMember({type: 'image', title: 'Image or diagram', options: {hotspot: true}, fields: [
    defineField({name: 'alt', title: 'Alternative text', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ]}),
  defineArrayMember({type: 'code', title: 'Code', options: {withFilename: true, languageAlternatives: [
    {title: 'Java', value: 'java'}, {title: 'TypeScript', value: 'typescript'}, {title: 'JavaScript', value: 'javascript'},
    {title: 'JSON', value: 'json'}, {title: 'YAML', value: 'yaml'}, {title: 'Shell', value: 'bash'}, {title: 'SQL', value: 'sql'}, {title: 'Plain text', value: 'text'},
  ]}}),
  defineArrayMember({type: 'trialTable'}),
  defineArrayMember({type: 'trialCallout'}),
];

export const article = defineType({
  name: 'portfolioTrialArticle', title: 'Trial article', type: 'document',
  groups: [
    {name: 'write', title: 'Write', default: true},
    {name: 'details', title: 'Details'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'write', validation: (rule) => rule.required()}),
    defineField({
      name: 'body', title: 'Article', type: 'array', group: 'write',
      of: writingBlocks, validation: (rule) => rule.required().min(1),
    }),
    defineField({name: 'slug', title: 'Article URL', type: 'slug', group: 'details', options: {source: 'title', maxLength: 96}, validation: (rule) => rule.required().custom((value) => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || 'Use lowercase letters, numbers, and hyphens.')}),
    defineField({name: 'description', title: 'Short introduction', type: 'text', rows: 3, group: 'details', validation: (rule) => rule.required().max(220)}),
    defineField({name: 'publishedAt', title: 'Article date', type: 'datetime', group: 'details', initialValue: () => new Date().toISOString(), validation: (rule) => rule.required()}),
    defineField({name: 'tags', title: 'Topics', type: 'array', of: [{type: 'string'}], options: {layout: 'tags'}, group: 'details'}),
  ],
  preview: {select: {title: 'title', subtitle: 'description'}},
});

import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {codeInput} from '@sanity/code-input';
import {article, callout, trialTable, trialTableRow} from './schema';
import {contentModels, singletonTypes} from './contentModels';
import {ArticlePreview} from './ArticlePreview';

export default defineConfig({
  name: 'portfolio-trial',
  title: 'Kavindu · Portfolio',
  projectId: 'ty4afqwx',
  dataset: 'production',
  plugins: [
    structureTool({
      title: 'Content',
      structure: (S) => S.list().title('Portfolio').items([
        S.documentTypeListItem('article').title('Writing'),
        S.documentTypeListItem('project').title('Work'),
        S.listItem().title('About / CV').id('profile').child(S.document().schemaType('profile').documentId('profile')),
        S.listItem().title('Home / Contact').id('siteSettings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
        S.divider(),
        S.documentTypeListItem('portfolioTrialArticle').title('Writing trial'),
      ]),
      defaultDocumentNode: (S, {schemaType}) => schemaType === 'portfolioTrialArticle' ? S.document().views([
        S.view.form().title('Write'),
        S.view.component(ArticlePreview).title('Preview'),
      ]) : S.document().views([S.view.form()]),
    }),
    codeInput(),
  ],
  schema: {
    types: [article, callout, trialTable, trialTableRow, ...contentModels],
    templates: (templates) => templates.filter((template) => !singletonTypes.has(template.schemaType)),
  },
  document: {
    actions: (actions, {schemaType}) => singletonTypes.has(schemaType)
      ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
      : actions,
  },
});

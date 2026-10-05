import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {codeInput} from '@sanity/code-input';
import {article, callout, trialTable, trialTableRow} from './schema';
import {ArticlePreview} from './ArticlePreview';

export default defineConfig({
  name: 'portfolio-trial',
  title: 'Kavindu · Writing trial',
  projectId: 'ty4afqwx',
  dataset: 'production',
  plugins: [
    structureTool({
      title: 'Writing',
      structure: (S) => S.documentTypeList('portfolioTrialArticle').title('Trial articles'),
      defaultDocumentNode: (S) => S.document().views([
        S.view.form().title('Write'),
        S.view.component(ArticlePreview).title('Preview'),
      ]),
    }),
    codeInput(),
  ],
  schema: {types: [article, callout, trialTable, trialTableRow]},
});

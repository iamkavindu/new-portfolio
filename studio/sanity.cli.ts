import {defineCliConfig} from 'sanity/cli';

export default defineCliConfig({
  deployment: {autoUpdates: false},
  api: {projectId: 'ty4afqwx', dataset: 'production'},
});
